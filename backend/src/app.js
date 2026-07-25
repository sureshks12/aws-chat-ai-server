import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import Routes
import authRoutes from './routes/auth.routes.js';
import awsProfileRoutes from './routes/awsProfile.routes.js';
import chatRoutes from './routes/chat.routes.js';
import historyRoutes from './routes/history.routes.js';
import auditRoutes from './routes/audit.routes.js';

// Import Error Handling Middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// HTTP Request Logging
app.use(morgan('dev'));

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AWS Infrastructure Chat Assistant Backend'
  });
});

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/aws-profile', awsProfileRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/audit', auditRoutes);

// Catch 404 & Forward to Centralized Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
