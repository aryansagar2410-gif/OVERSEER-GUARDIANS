import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { errorResponse, serverErrorResponse, successResponse, unauthenticatedResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const tokenPayload = getUserFromRequest(request);
    
    if (!tokenPayload) {
      return unauthenticatedResponse();
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenPayload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return errorResponse('USER_NOT_FOUND', 'User not found', 404);
    }

    return successResponse({ user });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
