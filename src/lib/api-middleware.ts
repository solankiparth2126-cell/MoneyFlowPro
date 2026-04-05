import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize admin client for all API routes
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);

// Custom API Error class
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Extract and verify JWT token from Authorization header
 */
export async function getUserFromJWT(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Require authentication middleware
 */
export async function requireAuth(request: NextRequest) {
  const user = await getUserFromJWT(request);

  if (!user) {
    throw new ApiError('Unauthorized', 401);
  }

  // Fetch the role from profiles table (CRITICAL FOR GLOBAL ADMIN)
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return {
    ...user,
    role: profile?.role || 'User'
  };
}

/**
 * Verify user has access to specific company
 */
export async function verifyCompanyAccess(user: any, companyId: string) {
  // 1. Check if user is a Global Admin (bypass access check)
  if (user.role === 'ADMIN') {
    return { role: 'admin' }; 
  }

  // 2. Normal user check
  const { data: access, error } = await supabaseAdmin
    .from('user_company_access')
    .select('id, role')
    .eq('user_id', user.id)
    .eq('company_id', companyId)
    .maybeSingle();

  if (error || !access) {
    throw new ApiError('Forbidden - No access to this company', 403);
  }

  return access;
}

/**
 * Require company access middleware
 */
export async function requireCompanyAccess(
  request: NextRequest,
  companyId: string
) {
  const user = await requireAuth(request);
  await verifyCompanyAccess(user, companyId);
  return user;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null;
  error?: string;
  timestamp: string;
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(error: string): ApiResponse<null> {
  return {
    data: null,
    error,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create audit log entry
 */
export async function logAudit(
  userId: string,
  companyId: string,
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
  module: string,
  details: string
) {
  try {
    await supabaseAdmin.from('audit_logs').insert([
      {
        user_id: userId,
        username: await getUserEmail(userId),
        action,
        module,
        details,
        company_id: companyId,
        timestamp: new Date().toISOString(),
      },
    ]);
  } catch (error) {
    // Log audit failure but don't throw - don't break main operation
    console.error('[WARNING] Audit log failed:', { action, module, error });
  }
}

/**
 * Get user email from cache or lookup
 */
async function getUserEmail(userId: string): Promise<string> {
  try {
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    return user?.email || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: any): NextResponse {
  console.error('[API ERROR]', error);
  try {
    const fs = require('fs');
    fs.appendFileSync('backend_error.log', new Date().toISOString() + ' : ' + (error.stack || error.message || JSON.stringify(error)) + '\n');
  } catch (e) {}

  if (error instanceof ApiError) {
    return NextResponse.json(
      errorResponse(error.message),
      { status: error.status }
    );
  }

  if (error.message?.includes('Forbidden')) {
    return NextResponse.json(
      errorResponse('Forbidden'),
      { status: 403 }
    );
  }

  console.error('[API ERROR]', error);

  return NextResponse.json(
    errorResponse(error.message || 'Internal server error'),
    { status: 500 }
  );
}
