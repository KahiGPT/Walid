
import { Request, Response, NextFunction } from 'express';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      user?: any;
    }
  }
}

export const tenancyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // In a real scenario, this comes from the JWT Claim.
  // For now, we simulate extraction from a header or fallback for dev.
  const tenantHeader = req.headers['x-tenant-id'];

  if (!tenantHeader) {
    // SECURITY RISK: Block request if no context is found in production
    // For Prototype: Default to the 'Foodika Grill' seed tenant
    // req.tenantId = 'default-tenant-uuid'; 
    return res.status(401).json({ error: 'Missing Tenant Context' });
  }

  req.tenantId = tenantHeader as string;
  next();
};
