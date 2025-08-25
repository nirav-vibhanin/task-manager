import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import taskRoutes from './routes/task.routes.js';
import { successResponder } from './utils/response.js';
import { logger, morganStream } from './utils/logger.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/openapi.js';

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: morganStream }));

// Mongo Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_manager';
mongoose
  .connect(MONGO_URI)
  .then(() => logger.info('MongoDB connected'))
  .catch((err) => logger.error('MongoDB connection error', { err }));

// Health
app.get('/health', (_req, res) => successResponder(res, 200, { status: 'ok' }));

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// 404 & Error
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
