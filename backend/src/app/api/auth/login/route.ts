import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { loginSchema } from '@/validators/auth';
import { errorResponse, serverErrorResponse, successResponse, validationErrorResponse } from '@/lib/response';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    // 5 attempts per 15 minutes
    if (!rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
      return errorResponse('RATE_LIMIT_EXCEEDED', 'Too many login attempts. Try again later.', 429);
    }

    const body = await request.json();
    const validation = loginSchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors[0].message);
    }
    
    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return errorResponse('INVALID_CREDENTIALS', 'Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse('INVALID_CREDENTIALS', 'Invalid credentials', 401);
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'USER',
        entityId: user.id,
      }
    });

    const token = signToken({ userId: user.id, role: user.role as any });

    const { password: _, ...userWithoutPassword } = user;

    return successResponse({ user: userWithoutPassword, token });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
