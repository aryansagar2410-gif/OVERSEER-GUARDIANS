import { NextRequest } from 'next/server';
import { POST as Register } from '../src/app/api/auth/register/route';
import { POST as Login } from '../src/app/api/auth/login/route';
import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

jest.mock('../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    }
  },
}));

jest.mock('bcryptjs', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({ id: 'user-1', email: 'test@test.com', role: 'STAFF' });
      
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'password123', name: 'Test' })
      });
      
      const response = await Register(request);
      expect(response.status).toBe(201);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.token).toBeDefined();
    });

    it('should fail if user exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1' });
      
      const request = new NextRequest('http://localhost/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'password123' })
      });
      
      const response = await Register(request);
      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user and return token', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', email: 'test@test.com', password: 'hashed-password', role: 'STAFF' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      
      const request = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'password123' })
      });
      
      const response = await Login(request);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.data.token).toBeDefined();
    });

    it('should return 401 for invalid password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1', email: 'test@test.com', password: 'hashed-password', role: 'STAFF' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      const request = new NextRequest('http://localhost/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
      });
      
      const response = await Login(request);
      expect(response.status).toBe(401);
    });
  });
});
