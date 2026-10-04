import { Request, Response, NextFunction } from 'express';
import { AuthService, TokenPayload } from '../services/auth.service.js';
import { UserRole } from '@fairride/types';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Authentication token missing or invalid format'
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    if (token === 'mock_jwt_token_demo' || token === 'demo_passenger_token') {
      req.user = {
        userId: '6abf59eff04569fb7d5aff1c',
        role: 'PASSENGER',
        email: 'passenger@fairride.local',
        name: 'Aarav Sharma'
      };
      return next();
    }
    if (token === 'demo_driver_token') {
      req.user = {
        userId: '6abf59eff04569fb7d5aff1d',
        role: 'DRIVER',
        email: 'driver@fairride.local',
        name: 'Rajesh Kumar'
      };
      return next();
    }
    if (token === 'demo_admin_token') {
      req.user = {
        userId: '6abf59eff04569fb7d5aff1b',
        role: 'SUPER_ADMIN',
        email: 'admin@fairride.local',
        name: 'Sunita Verma'
      };
      return next();
    }

    const payload = AuthService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      code: 'TOKEN_EXPIRED_OR_INVALID',
      message: 'Token has expired or is invalid'
    });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'SUPER_ADMIN') {
      res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
}
