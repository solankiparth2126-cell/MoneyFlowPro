import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  successResponse,
  handleApiError,
  supabaseAdmin,
  ApiError
} from '@/lib/api-middleware';

/**
 * POST /api/admin/users/reset-password
 * Admin sets a new password for a specific user
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    
    // 1. Verify the requester is an ADMIN
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileErr || profile?.role?.toLowerCase() !== 'admin') {
      throw new ApiError('Forbidden - Admin only', 403);
    }

    // 2. Parse the request body
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      throw new ApiError('User ID and new password are required', 400);
    }

    if (newPassword.length < 6) {
      throw new ApiError('Password must be at least 6 characters long', 400);
    }

    // 3. Reset the password using the admin client
    const { error: resetErr } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (resetErr) throw resetErr;

    return NextResponse.json(successResponse({ success: true, message: 'Password reset successful' }));
  } catch (error: any) {
    return handleApiError(error);
  }
}
