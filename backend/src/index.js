require('dotenv').config();
const express = require('express');
const cors = require('cors');
const winston = require('winston');

// Logger configuratie
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

// App initialisatie
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Basis route
app.get('/', (req, res) => {
  res.json({ message: "Welkom bij de RPM App API" });
});

// Import routes
const categoryRoutes = require('./routes/categories');
const rpmBlockRoutes = require('./routes/rpmblocks');
const calendarRoutes = require('./routes/calendar-events');

// Route registratie
app.use('/api/categories', categoryRoutes);
app.use('/api/rpmblocks', rpmBlockRoutes);
app.use('/api/calendar-events', calendarRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Er is een serverfout opgetreden' });
});

// Server starten
app.listen(PORT, () => {
  logger.info(`Server draait op http://localhost:${PORT}`);
});

module.exports = app;
