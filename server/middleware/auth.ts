import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include user property
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      email: string;
    };
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    // Check if no token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    // Add user from token payload to request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // In a real app, you would check if the user has admin privileges
  // For simplicity, we're leaving this as a placeholder
  
  if (!req.user) {
    return res.status(401).json({ message: 'Authorization denied' });
  }
  
  // Here you would check user roles or admin status
  // For example: 
  // const user = await User.findById(req.user.userId);
  // if (!user || !user.isAdmin) return res.status(403).json({ message: 'Access denied' });
  
  next();
}; 