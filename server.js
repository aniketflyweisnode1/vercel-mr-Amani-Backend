require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Import database connection
const connectDB = require('./config/database');

// Import routes
const routes = require('./src');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import logger
const logger = require('./utils/logger');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if ('development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api/', limiter);

// Ignore favicon requests
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Request logging middleware
app.use((req, res, next) => {
  // Skip logging for favicon requests
  if (req.originalUrl === '/favicon.ico') {
    return next();
  }
  logger.info('Request received', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// API routes
app.use('/api/v2', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Node.js API Structure',
    version: '1.0.0',
    documentation: '/api',
    health: '/api/v2/health',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection', {
    error: err.message,
    stack: err.stack,
    promise: promise
  });
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Check if running on Vercel (serverless)
const isVercel = false;

// Start server only if not on Vercel
let server = null;
let io = null;

if (!isVercel) {
  // Start server for local development
  const PORT = 3030;
  server = app.listen(PORT, () => {
    logger.info(`Server running in 'development' mode on port ${PORT}`);
    logger.info(`API Documentation: http://localhost:${PORT}/api/v2`);
    logger.info(`Health Check: http://localhost:${PORT}/api/v2/health`);
    logger.info(`WebSocket: ws://localhost:${PORT}/`);
  });

  // Initialize Socket.io directly - Socket.io only (no REST API endpoints)
  // Must be initialized AFTER server starts to handle WebSocket upgrades
  try {
    // console.log('Initializing Socket.io');
    const { setupSocket } = require('./src/routes/Chat/SocketChat.routes');
    io = setupSocket(server);
    logger.info('Socket.io initialized successfully on path: /');
  } catch (error) {
    logger.warn('Socket.io initialization skipped', { error: error.message });
  }

  // Handle server errors
  server.on('error', (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

    switch (error.code) {
      case 'EACCES':
        logger.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        logger.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
} else {
  logger.info('Running on Vercel - serverless mode');
}

// Export for Vercel (default export must be the app or handler function)
// Vercel requires the default export to be the Express app
module.exports = app;

// Also export server and io for local development if needed
if (!isVercel && server) {
  module.exports.server = server;
  module.exports.io = io;
}
