import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { registerSchema } from '@/validators/auth';
import { errorResponse, serverErrorResponse, successResponse, validationErrorResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors[0].message);
    }
    
    const { email, password, name, role } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse('USER_EXISTS', 'User with this email already exists', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as any,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entity: 'USER',
        entityId: user.id,
      }
    });

    const token = signToken({ userId: user.id, role: user.role as any });

    const { password: _, ...userWithoutPassword } = user;

    return successResponse({ user: userWithoutPassword, token }, 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
