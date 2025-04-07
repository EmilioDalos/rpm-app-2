import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import winston from 'winston';
import { testDatabaseConnection, setupAssociations } from './models';
import categoryRoutes from './routes/categories';
import roleRoutes from './routes/roles';
import rpmBlockRoutes from './routes/rpmblocks';
import calendarRoutes from './routes/calendar-events';

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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Base route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Welkom bij de RPM App API" });
});

// Setup associations before registering routes
setupAssociations();

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

// Start the server
if (require.main === module) {
  // Test database connection
  testDatabaseConnection().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }).catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export default app; 