const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const errorHandler = require('./middleware/error');

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
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/astrologers', require('./routes/astrologers'));
app.use('/api/horoscope',   require('./routes/horoscope'));
app.use('/api/kundli',      require('./routes/kundli'));
app.use('/api/calculators', require('./routes/calculators'));
app.use('/api/puja',        require('./routes/puja'));
app.use('/api/remedies',    require('./routes/remedies'));
app.use('/api/chat',        require('./routes/chat'));
app.use('/api/payments',    require('./routes/payments'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/consultation', require('./routes/consultation'));
app.use('/api/panchang',    require('./routes/panchang'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Astrology API is running' });
});

app.get('/api/astrologers/status', (req, res) => {
  res.json({ onlineAstrologers: Object.keys(onlineAstrologers) });
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
    socket.sessionId  = sessionId;
    socket.userId     = userId;
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
  socket.on('send_message', async ({ sessionId, message, senderType, senderName, userLanguage }) => {
    const { translateMessage, detectLanguage } = require('./utils/translate');
    try {
      const detectedLang = detectLanguage(message);
      let translatedMessage = message;
      let showOriginal = false;

      if (senderType === 'user' && detectedLang === 'english' && userLanguage === 'english') {
        translatedMessage = await translateMessage(message, 'hindi');
        showOriginal = true;
      } else if (senderType === 'user' && detectedLang === 'hindi') {
        translatedMessage = await translateMessage(message, 'english');
        showOriginal = true;
      } else if (senderType === 'astrologer') {
        if (detectedLang === 'hindi') {
          translatedMessage = await translateMessage(message, 'english');
          showOriginal = true;
        } else if (detectedLang === 'english') {
          translatedMessage = await translateMessage(message, 'hindi');
          showOriginal = true;
        }
      }

      const timestamp = new Date();

      // Send to sender — show their own message
      socket.emit('receive_message', {
        sessionId, senderType, senderName,
        message,
        displayMessage: message,
        translatedMessage: showOriginal ? translatedMessage : null,
        isMine: true,
        timestamp
      });

      // Send to receiver — show translated message
      socket.to(sessionId).emit('receive_message', {
        sessionId, senderType, senderName,
        message: translatedMessage,
        displayMessage: translatedMessage,
        translatedMessage: showOriginal ? message : null,
        isMine: false,
        timestamp
      });

    } catch (err) {
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
    }
    io.to(sessionId).emit('session_ended', { sessionId });
    socket.leave(sessionId);
  });

  socket.on('disconnect', () => {
    // Remove astrologer from online list
    if (socket.astrologerId) {
      delete onlineAstrologers[socket.astrologerId];
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