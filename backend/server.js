// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const Product = require('./models/Product');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const offerRoutes = require('./routes/offerRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const server = http.createServer(app);

// Socket.io Configuration (Added 'PUT' method support)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mf_dari_grocery';

// Middleware (Added 'PUT' method support)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// API Routes (Must be defined before static routing/catch-alls)
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes); // Supports direct /api/reset-password and /api/users/:id endpoints

// Serve Static Frontend and Admin Folders
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/admin', express.static(path.join(__dirname, '../frontend/admin')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Socket.io Live Tracking & Real-Time Sync
io.on('connection', (socket) => {
  console.log(`Client Connected: ${socket.id}`);

  // Join dedicated order tracking room
  socket.on('join_order_tracking', (orderId) => {
    socket.join(orderId);
    console.log(`Socket ${socket.id} joined tracking room for Order: ${orderId}`);
  });

  // New order placed notification from customer to admin
  socket.on('new_order_placed', (order) => {
    io.emit('new_order_placed', order);
  });

  // Admin/Rider broadcasts live GPS coordinate update
  socket.on('update_rider_location', ({ orderId, latitude, longitude, speed, heading }) => {
    const payload = {
      latitude,
      longitude,
      speed,
      heading,
      updatedAt: new Date().toLocaleTimeString()
    };
    if (orderId) {
      io.to(orderId).emit('rider_location_changed', payload);
    }
    io.emit('rider_location_changed', payload);
  });

  // 1-Tap Checkpoint & status updates
  socket.on('order_status_updated', (data) => {
    io.emit('order_status_updated', data);
    if (data && data.orderId) {
      io.to(data.orderId).emit('status_changed', data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Database Connection & Server Listener
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    server.listen(PORT, () => {
      console.log(`MF Dari Grocery Live Map Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });