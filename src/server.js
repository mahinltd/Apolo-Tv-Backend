// ©2026 Apolo TV Mahin Ltd develop by (Tanvir)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.config');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoute = require('./routes/auth.route');
const healthRouter = require('./routes/health.route');
const channelRouter = require('./routes/channel.route');
const streamRouter = require('./routes/stream.route');
const paymentRoute = require('./routes/payment.route');
const userRoute = require('./routes/user.route');
const adminRoute = require('./routes/admin.route');
const { startChannelHealthCron } = require('./services/cron.service');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/channels', channelRouter);
app.use('/api/v1/stream', streamRouter);
app.use('/api/v1/payments', paymentRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/admin', adminRoute);

// Serve public assets (logo, images)
app.use('/public', express.static(path.join(__dirname, '../public')));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error Middleware
app.use(errorMiddleware);

// Connect to Database and Start Server
const startServer = async () => {
  try {
    await connectDB();
    startChannelHealthCron();
    app.listen(PORT, () => {
      console.log(`🚀 Apolo TV API server is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();