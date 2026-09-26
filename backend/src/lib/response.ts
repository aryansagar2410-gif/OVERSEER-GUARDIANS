import { NextResponse } from 'next/server';

export function successResponse(data: any, status = 200) { return NextResponse.json({ success: true, data }, { status }); }

export function errorResponse(code: string, message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status }
  );
}

export function unauthenticatedResponse() {
  return errorResponse('UNAUTHORIZED', 'Authentication required', 401);
}

export function unauthorizedResponse() {
  return errorResponse('FORBIDDEN', 'Insufficient permissions', 403);
}

export function notFoundResponse(entity: string) {
  return errorResponse('NOT_FOUND', `${entity} not found`, 404);
}

export function validationErrorResponse(message: string) {
  return errorResponse('VALIDATION_ERROR', message, 422);
}

export function serverErrorResponse(error: any) {
  console.error('Server error:', error);
  return errorResponse('INTERNAL_SERVER_ERROR', 'An unexpected error occurred', 500);
}

