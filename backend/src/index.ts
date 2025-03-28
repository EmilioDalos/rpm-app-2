import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import winston from 'winston';
import { syncDatabase } from './models';
import categoryRoutes from './routes/categories/route';
import roleRoutes from './routes/roles/route';

// Load environment variables
dotenv.config();

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ],
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true
};

// App initialization
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Base route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Welkom bij de RPM App API" });
});

// Import routes
import rpmBlockRoutes from './routes/rpmblocks';
import calendarRoutes from './routes/calendar-events';

// Route registration
app.use('/api/categories', categoryRoutes);
app.use('/api/rpmblocks', rpmBlockRoutes);
app.use('/api/calendar-events', calendarRoutes);
app.use('/api/roles', roleRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Er is een serverfout opgetreden' });
});

// Initialize database and start server
syncDatabase().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server draait op http://localhost:${PORT}`);
  });
}).catch(error => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app; 