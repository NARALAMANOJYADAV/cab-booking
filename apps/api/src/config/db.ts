import mongoose from 'mongoose';
import { config } from './index.js';

let mongodInstance: any = null;

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  const uri = config.MONGO_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log(`[Database] Connecting to MongoDB at ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
      console.log('[Database] MongoDB connected successfully.');
      return;
    } catch (err: any) {
      console.warn('[Database] Local MongoDB unreachable, falling back to embedded in-memory MongoDB engine.');
    }
  }

  // Fallback to mongodb-memory-server for frictionless zero-config local development and testing
  try {
    console.log('[Database] Initializing in-memory MongoDB engine for zero-setup local execution...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongodInstance = await MongoMemoryServer.create();
    const memoryUri = mongodInstance.getUri();
    await mongoose.connect(memoryUri);
    console.log(`[Database] In-memory MongoDB connected successfully at ${memoryUri}`);
  } catch (memErr) {
    console.error('[Database] Critical error establishing MongoDB connection:', memErr);
    throw memErr;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}
