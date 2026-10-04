import { Server, Socket } from 'socket.io';
import { Driver, Booking } from '../models/index.js';

export function setupSocketIO(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join personal user room
    socket.on('user:join', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`[Socket.IO] User ${userId} joined personal room`);
    });

    // Join ride room
    socket.on('ride:join', (bookingId: string) => {
      socket.join(`ride:${bookingId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined ride:${bookingId}`);
    });

    // Driver location update stream
    socket.on('driver:location', async (data: { driverId: string; bookingId?: string; coordinates: [number, number]; bearing?: number }) => {
      const { driverId, bookingId, coordinates, bearing } = data;
      
      // Update in driver record
      try {
        await Driver.findByIdAndUpdate(driverId, {
          'currentLocation.coordinates': coordinates,
          'currentLocation.updatedAt': new Date(),
          'currentLocation.bearing': bearing || 0
        });
      } catch (err) {
        // silent catch
      }

      // Broadcast to ride room if trip is active
      if (bookingId) {
        io.to(`ride:${bookingId}`).emit('driver:location', {
          driverId,
          coordinates,
          bearing: bearing || 0,
          timestamp: new Date()
        });
      }

      // Broadcast to operations room
      io.to('admin:operations').emit('driver:location_update', {
        driverId,
        coordinates
      });
    });

    // In-app passenger <-> driver messaging
    socket.on('ride:message', (data: { bookingId: string; sender: string; text: string; timestamp: string }) => {
      io.to(`ride:${data.bookingId}`).emit('ride:message', data);
    });

    // Simulated driver acceptance broadcast
    socket.on('ride:driver_accepted', (data: { bookingId: string; driver: any; eta: number }) => {
      io.to(`ride:${data.bookingId}`).emit('ride:accepted', data);
    });

    // Join admin operations room
    socket.on('admin:join', () => {
      socket.join('admin:operations');
      socket.join('admin:safety');
      console.log(`[Socket.IO] Admin socket joined operations & safety room`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}
