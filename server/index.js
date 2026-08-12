const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const errorHandler = require('./middleware/error');
const astrologerStatusStore = require('./utils/astrologerStatusStore');

const app = express();
const httpServer = http.createServer(app);

// Socket.io for real-time chat
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://astrocelestique.com',
      'https://www.astrocelestique.com',
    ],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://astrocelestique.com',
    'https://www.astrocelestique.com',
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/astrologers',  require('./routes/astrologers'));
app.use('/api/horoscope',    require('./routes/horoscope'));
app.use('/api/kundli',       require('./routes/kundli'));
app.use('/api/calculators',  require('./routes/calculators'));
app.use('/api/puja',         require('./routes/puja'));
app.use('/api/remedies',     require('./routes/remedies'));
app.use('/api/chat',         require('./routes/chat'));
app.use('/api/payments',     require('./routes/payments'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/consultation', require('./routes/consultation'));
app.use('/api/panchang',     require('./routes/panchang'));
app.use('/api/places',       require('./routes/places'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Astrology API is running' });
});

// Track online astrologers: { astrologerId: socketId }
const onlineAstrologers = {};
// Track active sessions: { sessionId: { userSocketId, astrologerSocketId, startTime, astrologerId, userId } }
const activeSessions = {};

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // Astrologer comes online
  socket.on('astrologer_online', ({ astrologerId, astrologerName }) => {
    onlineAstrologers[astrologerId] = socket.id;
    astrologerStatusStore.setOnline(astrologerId.toString(), socket.id);
    io.emit('astrologer_status_update', astrologerStatusStore.getStatusSnapshot());
    console.log(`Astrologer ${astrologerName} is online. Socket: ${socket.id}`);
    socket.astrologerId = astrologerId;
  });

  // User requests chat with astrologer
  socket.on('chat_request', ({ astrologerId, userId, userName, userLanguage }) => {
    const astrologerSocketId = onlineAstrologers[astrologerId];
    if (!astrologerSocketId) {
      socket.emit('chat_error', { message: 'Astrologer is currently offline' });
      return;
    }
    const sessionId = `session_${userId}_${astrologerId}_${Date.now()}`;
    socket.sessionId    = sessionId;
    socket.userId       = userId;
    socket.userLanguage = userLanguage || 'english';

    // Notify astrologer of incoming request
    io.to(astrologerSocketId).emit('incoming_request', {
      sessionId,
      userId,
      userName,
      userLanguage,
      userSocketId: socket.id
    });

    // Tell user we are waiting
    socket.emit('request_sent', { sessionId, message: 'Waiting for astrologer to accept...' });
    console.log(`Chat request: ${userName} → Astrologer ${astrologerId}`);
  });

  // Astrologer accepts chat
  socket.on('accept_chat', ({ sessionId, userSocketId, astrologerId }) => {
    activeSessions[sessionId] = {
      userSocketId,
      astrologerSocketId: socket.id,
      astrologerId,
      startTime: new Date(),
      isActive:  true
    };
    astrologerStatusStore.setBusy(astrologerId.toString());
    io.emit('astrologer_status_update', astrologerStatusStore.getStatusSnapshot());

    // Join both to same room
    socket.join(sessionId);
    io.sockets.sockets.get(userSocketId)?.join(sessionId);

    // Notify both parties
    io.to(sessionId).emit('chat_started', { sessionId });
    console.log(`Chat started: Session ${sessionId}`);
  });

  // Astrologer declines chat
  socket.on('decline_chat', ({ userSocketId }) => {
    io.to(userSocketId).emit('chat_declined', {
      message: 'Astrologer is busy. Please try again later.'
    });
  });

  // Send message with translation
  socket.on('send_message', async ({ sessionId, message, senderType, senderName, userLanguage, astrologerLanguage }) => {
    const { translateMessage } = require('./utils/translate');
    try {
      const userLang = userLanguage || 'English';
      const astroLang = astrologerLanguage || 'Hindi';
      const targetLanguage = senderType === 'user' ? astroLang : userLang;

      console.log('🔍 DEBUG send_message:', { senderType, message, userLanguage, astrologerLanguage, targetLanguage });

      const translatedMessage = await translateMessage(message, targetLanguage);

      console.log('🔍 DEBUG translation result:', { original: message, targetLanguage, translatedMessage });

      const timestamp = new Date();

      // Sender sees their own original message, with the translation shown
      // as a small reference underneath (so they can confirm it read correctly)
      socket.emit('receive_message', {
        sessionId, senderType, senderName,
        message,
        displayMessage: message,
        translatedMessage,
        isMine: true,
        timestamp
      });

      // Receiver sees the translated message as the main text, with the
      // sender's original shown as a small reference underneath
      socket.to(sessionId).emit('receive_message', {
        sessionId, senderType, senderName,
        message: translatedMessage,
        displayMessage: translatedMessage,
        translatedMessage: message,
        isMine: false,
        timestamp
      });

    } catch (err) {
      console.error('🔍 DEBUG send_message error:', err.message);
      io.to(sessionId).emit('receive_message', {
        sessionId, senderType, senderName,
        message, displayMessage: message,
        isMine: socket.id === activeSessions[sessionId]?.userSocketId,
        timestamp: new Date()
      });
    }
  });

  // Typing indicator
  socket.on('typing', ({ sessionId, senderType }) => {
    socket.to(sessionId).emit('user_typing', { senderType });
  });

  // End session
  socket.on('end_session', ({ sessionId }) => {
    if (activeSessions[sessionId]) {
      activeSessions[sessionId].isActive = false;
      activeSessions[sessionId].endTime  = new Date();
      astrologerStatusStore.setAvailable(activeSessions[sessionId].astrologerId.toString());
      io.emit('astrologer_status_update', astrologerStatusStore.getStatusSnapshot());
    }
    io.to(sessionId).emit('session_ended', { sessionId });
    socket.leave(sessionId);
  });

  socket.on('disconnect', () => {
    // Remove astrologer from online list
    if (socket.astrologerId) {
      delete onlineAstrologers[socket.astrologerId];
      astrologerStatusStore.removeBySocketId(socket.id);
      io.emit('astrologer_status_update', astrologerStatusStore.getStatusSnapshot());
      console.log(`Astrologer ${socket.astrologerId} went offline`);
    }
    console.log('Socket disconnected:', socket.id);
  });
});

app.use(errorHandler);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });