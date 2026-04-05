import { NextRequest, NextResponse } from 'next/server';
import {
  requireCompanyAccess,
  logAudit,
  successResponse,
  handleApiError,
  supabaseAdmin,
} from '@/lib/api-middleware';

import { startOfMonth, endOfMonth, format } from 'date-fns';

/**
 * GET /api/stats/breakdown?companyId=...&type=income|expense&startDate=...&endDate=...
 * Get category breakdown for transactions
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const type = (searchParams.get('type') || 'expense') as 'income' | 'expense';

    // Default to current month
    const now = new Date();
    const startDate = searchParams.get('startDate') || format(startOfMonth(now), 'yyyy-MM-dd');
    const endDate = searchParams.get('endDate') || format(endOfMonth(now), 'yyyy-MM-dd');

    if (!companyId) throw new Error('Company ID required');

    const user = await requireCompanyAccess(request, companyId);

    // Efficient selection and filtering
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('amount, categories(name)')
      .eq('company_id', companyId)
      .eq('type', type)
      .eq('is_deleted', false)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    const categoryMap = new Map<string, { amount: number; count: number }>();
    (data || []).forEach((tx: any) => {
      const name = tx.categories?.name || 'Uncategorized';
      const current = categoryMap.get(name) || { amount: 0, count: 0 };
      categoryMap.set(name, {
        amount: current.amount + Number(tx.amount),
        count: current.count + 1,
      });
    });

    const breakdown = Array.from(categoryMap.entries()).map(([category, stat]) => ({
      category,
      amount: stat.amount,
      count: stat.count,
    }));

    return NextResponse.json(successResponse(breakdown));
  } catch (error: any) {
    return handleApiError(error);
  }
}
