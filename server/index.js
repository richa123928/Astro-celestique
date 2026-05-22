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
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
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


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Astrology API is running' });
});

// Socket.io - real time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', {
      ...data,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
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