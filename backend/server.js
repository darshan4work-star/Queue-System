const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for MVP/Dev
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Log Requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Attach IO to request for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

const queueRoutes = require('./routes/queueRoutes');
const authRoutes = require('./routes/authRoutes');
const formRoutes = require('./routes/formRoutes');

// Routes
app.use('/api', queueRoutes);
app.use('/api', authRoutes);
app.use('/api/form', formRoutes);

app.get('/', (req, res) => {
  res.send('Queue System API is running');
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_shop', (shopId) => {
    socket.join(shopId);
    console.log(`Socket ${socket.id} joined shop ${shopId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io }; // Export io for use in services
