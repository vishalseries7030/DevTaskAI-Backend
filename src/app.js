const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const { initSentry, sentryErrorHandler } = require('./config/sentry');
const { celebrateErrorHandler, globalErrorHandler } = require('./middleware/errorHandler');
const logger = require('./config/logger');

const app = express();

// Initialize Sentry
initSentry(app);

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// ✅ Root route (for Render & testing)
app.get('/', (req, res) => {
  res.send('Backend is live 🚀');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

// API routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const bugRoutes = require('./routes/bugs');
const snippetRoutes = require('./routes/snippets');
const uploadRoutes = require('./routes/uploads');
const aiRoutes = require('./routes/ai');
const toolsRoutes = require('./routes/tools');

// API version route
app.get('/api/v1', (req, res) => {
  res.json({ success: true, message: 'DevTask API v1' });
});

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/projects/:projectId/tasks', taskRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/projects/:projectId/bugs', bugRoutes);
app.use('/api/v1/bugs', bugRoutes);
app.use('/api/v1/snippets', snippetRoutes);
app.use('/api/v1/uploads', uploadRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/tools', toolsRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Sentry error handler (must be before other error handlers)
app.use(sentryErrorHandler());

// Celebrate validation error handler
app.use(celebrateErrorHandler);

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
