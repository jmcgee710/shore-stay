import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type AuthRole = 'HOMEOWNER' | 'PROPERTY_MANAGER' | 'TRIP_PLANNER' | 'HOME_WATCHER';

export interface AuthPayload {
  sub: string;
  role: AuthRole;
  email?: string;
  name?: string;
  bookingId?: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

/** Verifies JWT and optionally restricts to specific roles. */
export function requireAuth(...roles: AuthRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const token = header.slice(7);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
      if (roles.length && !roles.includes(payload.role)) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
      req.auth = payload;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}
