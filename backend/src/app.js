const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const path         = require('path');
const rateLimit    = require('express-rate-limit');

const authRoutes   = require('./routes/auth.routes');
const reportRoutes = require('./routes/report.routes');
const matchRoutes  = require('./routes/match.routes');
const userRoutes   = require('./routes/user.routes');
const errorHandler = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth',    authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/match',   matchRoutes);
app.use('/api/users',   userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'STRAY API is running ✅' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

module.exports = app;