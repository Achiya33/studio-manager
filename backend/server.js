import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes.js';
import shootRoutes from './routes/shootRoutes.js';
import albumRoutes from './routes/albumRoutes.js';
import studioRoutes from './routes/studioRoutes.js';
import packageRoutes from './routes/packageRoutes.js';

dotenv.config();

const app = express();

// ========================================
// SECURITY: Helmet — Set secure HTTP headers
// Protects against: XSS, clickjacking, MIME sniffing, etc.
// ========================================
app.use(helmet());

// ========================================
// SECURITY: CORS — Restrict allowed origins
// Only allow requests from your frontend domain
// ========================================
const allowedOrigins = [
  'https://studio-manager-qtex.vercel.app',
  // Add localhost for development
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://localhost:3000'] : [])
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman in dev)
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ========================================
// SECURITY: Rate Limiting — Prevent brute force & DDoS
// ========================================
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

// Stricter limit for auth-related endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' }
});

app.use(generalLimiter);

// ========================================
// SECURITY: Body size limits
// Reduced from 50mb to 1mb globally to prevent memory exhaustion
// Specific routes can override this if needed (e.g., logo upload)
// ========================================
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));

// ========================================
// LOGGING: Morgan — HTTP request logging for audit trail
// ========================================
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// ========================================
// ROUTES
// ========================================
app.use('/api/users', authLimiter, userRoutes);
app.use('/api/shoots', shootRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/packages', packageRoutes);

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('Studio Manager API is running...');
});

// ========================================
// SECURITY: Global Error Handler
// Prevents stack traces and internal details from leaking to clients
// ========================================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ message: 'Internal server error' });
  } else {
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// ========================================
// DATABASE CONNECTION
// ========================================
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in .env file');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
