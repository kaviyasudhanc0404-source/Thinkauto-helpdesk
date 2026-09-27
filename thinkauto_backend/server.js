// Load environment variables first — every module below reads process.env when it is imported
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import emailTicketService from './services/emailTicketService.js';
import { frontendUrls } from './utils/frontendUrl.js';

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (health checks, uptime pingers, curl) which send no Origin
    if (!origin || frontendUrls.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ThinkAuto Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to ThinkAuto API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      tickets: '/api/tickets',
      users: '/api/users'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  console.log(`\n🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Allowed frontend origins: ${frontendUrls.join(', ')}`);
  console.log(`🤖 ML Service URL: ${process.env.ML_SERVICE_URL || 'http://localhost:5001'}`);
  console.log(`🏥 Health Check: /api/health\n`);
  
  // Start email-based ticket creation service
  try {
    await emailTicketService.start();
  } catch (error) {
    console.error('⚠️  Email service failed to start:', error.message);
    console.log('   Server will continue without email monitoring');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);

  // Don't shut down server for IMAP-related errors
  if (err.message && (err.message.includes('IMAP') || err.message.includes('EPIPE') || err.message.includes('ECONNRESET'))) {
    console.warn('⚠️  Email service error - server continues running');
    return;
  }

  // For critical errors, shut down gracefully
  console.error('🔴 Critical error - shutting down server');
  emailTicketService.stop();
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions (like unhandled error events)
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);

  // Don't shut down server for IMAP/Socket-related errors
  if (err.message && (err.message.includes('IMAP') || err.message.includes('socket') || err.message.includes('EPIPE') || err.message.includes('ECONNRESET'))) {
    console.warn('⚠️  Email service error - server continues running');
    console.log('   Email monitoring may be disabled, but API continues to work');
    return;
  }

  // For critical errors, shut down gracefully
  console.error('🔴 Critical error - shutting down server');
  emailTicketService.stop();
  server.close(() => process.exit(1));
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  emailTicketService.stop();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received, shutting down gracefully');
  emailTicketService.stop();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
