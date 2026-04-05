import { NextRequest, NextResponse } from 'next/server';
import {
  requireCompanyAccess,
  successResponse,
  handleApiError,
  supabaseAdmin,
} from '@/lib/api-middleware';

/**
 * GET /api/stats/wealth?companyId=...
 * Get wealth distribution across ledgers
 */
export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');

    if (!companyId) {
      throw new Error('Company ID required');
    }

    const user = await requireCompanyAccess(request, companyId);

    const { data, error } = await supabaseAdmin
      .from('ledgers')
      .select('account_type, balance')
      .eq('company_id', companyId)
      .eq('is_deleted', false);

    if (error) throw error;

    const typeMap = new Map<string, number>();
    (data || []).forEach((ledger: any) => {
      const type = ledger.account_type || 'other';
      const current = typeMap.get(type) || 0;
      typeMap.set(type, current + Number(ledger.balance));
    });

    const distribution = Array.from(typeMap.entries()).map(([type, balance]) => ({
      type,
      balance,
    }));

    return NextResponse.json(successResponse(distribution));
  } catch (error: any) {
    return handleApiError(error);
  }
}
