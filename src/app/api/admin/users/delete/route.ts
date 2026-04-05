import { NextRequest, NextResponse } from 'next/server';
import {
  requireAuth,
  successResponse,
  handleApiError,
  supabaseAdmin,
  ApiError
} from '@/lib/api-middleware';

/**
 * POST /api/admin/users/delete
 * Admin permanently deletes a user and their identity
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
    const { userId } = await request.json();

    if (!userId) {
      throw new ApiError('User ID is required', 400);
    }

    // Prevents admin from deleting themselves
    if (userId === user.id) {
       throw new ApiError('Cannot delete yourself', 400);
    }

    // 3. Delete from Supabase Auth (this will cascade to profiles)
    const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteErr) throw deleteErr;

    return NextResponse.json(successResponse({ success: true, message: 'User deleted permanently' }));
  } catch (error: any) {
    return handleApiError(error);
  }
}
