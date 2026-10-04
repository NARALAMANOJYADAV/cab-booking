import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import { config } from './config/index.js';
import { connectDB } from './config/db.js';
import { getRedisClient } from './config/redis.js';
import { setupSocketIO } from './socket/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { User } from './models/index.js';
import { runSeed } from './scripts/seed.js';

import { authRouter } from './routes/auth.routes.js';
import { locationRouter } from './routes/location.routes.js';
import { fareRouter } from './routes/fare.routes.js';
import { bookingRouter } from './routes/booking.routes.js';
import { driverRouter } from './routes/driver.routes.js';
import { safetyRouter } from './routes/safety.routes.js';
import { disputeRouter } from './routes/dispute.routes.js';
import { paymentRouter } from './routes/payment.routes.js';
import { walletRouter } from './routes/wallet.routes.js';
import { corporateRouter } from './routes/corporate.routes.js';
import { aiRouter } from './routes/ai.routes.js';
import { adminRouter } from './routes/admin.routes.js';

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSocketIO(io);

// Core Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'FairRide Intelligent Mobility API',
    tagline: 'Book With Confidence.',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Versioned API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/locations', locationRouter);
app.use('/api/v1/fares', fareRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/drivers', driverRouter);
app.use('/api/v1/safety', safetyRouter);
app.use('/api/v1/disputes', disputeRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/wallet', walletRouter);
app.use('/api/v1/corporate', corporateRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/admin', adminRouter);

// Global Error Handler
app.use(errorHandler);

// Start Server
async function start() {
  try {
    await connectDB();
    getRedisClient();

    // Auto-seed if database is freshly initialized
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Running initial seed...');
      await runSeed();
    }

    server.listen(config.PORT, () => {
      console.log(`====================================================`);
      console.log(`  FAIRRIDE BACKEND API SERVER RUNNING               `);
      console.log(`  PORT:     http://localhost:${config.PORT}         `);
      console.log(`  TAGLINE:  "Book With Confidence."                `);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('[Server Failed to Start]', err);
    process.exit(1);
  }
}

start();

export { app, server };
