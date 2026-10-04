import dotenv from 'dotenv';
dotenv.config();

export const config = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || '',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'fairride_jwt_super_secret_production_key_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fairride_jwt_refresh_super_secret_2026',
  JWT_ACCESS_EXPIRES_IN: '2h',
  JWT_REFRESH_EXPIRES_IN: '30d',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_fairride2026',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'fairride_rzp_mock_secret_key',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};
