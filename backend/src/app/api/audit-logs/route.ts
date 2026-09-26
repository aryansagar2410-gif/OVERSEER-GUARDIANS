import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest, hasPermission } from '@/lib/auth';
import { successResponse, serverErrorResponse, unauthenticatedResponse, unauthorizedResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return unauthenticatedResponse();

    // Only MANAGER and ADMIN can view audit logs
    if (!hasPermission(user.role, 'MANAGER')) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { name: true, email: true } }
        },
        orderBy: { timestamp: 'desc' }
      }),
      prisma.auditLog.count({ where })
    ]);

    return successResponse({
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
