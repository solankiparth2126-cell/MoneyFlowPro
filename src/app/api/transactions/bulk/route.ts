import { NextRequest, NextResponse } from 'next/server';
import {
  requireCompanyAccess,
  logAudit,
  successResponse,
  handleApiError,
  ApiError,
} from '@/lib/api-middleware';
import { createClient } from '@/lib/supabase-server-client';

/**
 * POST /api/transactions/bulk
 * Perform bulk operations (Delete, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const { ids, companyId, action } = await request.json();

    if (!companyId) throw new ApiError('Company ID required', 400);
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new ApiError('Transaction IDs required', 400);
    }

    const user = await requireCompanyAccess(request, companyId);
    const supabase = await createClient();

    if (action === 'DELETE') {
      // Perform bulk soft delete
      const { error } = await supabase
        .from('transactions')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .in('id', ids)
        .eq('company_id', companyId);

      if (error) throw error;

      await logAudit(
        user.id,
        companyId,
        'DELETE',
        'TRANSACTIONS',
        `Bulk soft-deleted ${ids.length} transactions`
      );

      return NextResponse.json(successResponse({ success: true, count: ids.length }));
    }

    if (action === 'HARD_DELETE') {
       // Perform bulk hard delete (for purging orphans)
       const { error } = await supabase
         .from('transactions')
         .delete()
         .in('id', ids)
         .eq('company_id', companyId);

       if (error) throw error;

       await logAudit(
         user.id,
         companyId,
         'DELETE',
         'TRANSACTIONS',
         `Bulk hard-deleted (purged) ${ids.length} transactions`
       );

       return NextResponse.json(successResponse({ success: true, count: ids.length }));
    }

    throw new ApiError('Invalid action', 400);
  } catch (error: any) {
    return handleApiError(error);
  }
}
