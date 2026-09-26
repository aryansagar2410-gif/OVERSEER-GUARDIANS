import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET environment variable is not set.");
}

// Defining locally since @prisma/client types might not be updated yet
export type Role = 'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER';

export interface JwtPayload {
  userId: string;
  role: Role;
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(request: NextRequest): JwtPayload | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  const roleWeights: Record<Role, number> = {
    VIEWER: 1,
    STAFF: 2,
    MANAGER: 3,
    ADMIN: 4,
  };
  return roleWeights[userRole] >= roleWeights[requiredRole];
}
