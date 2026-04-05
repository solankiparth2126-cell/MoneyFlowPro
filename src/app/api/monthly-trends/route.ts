import { NextRequest, NextResponse } from 'next/server';
import {
  requireCompanyAccess,
  successResponse,
  handleApiError,
  supabaseAdmin,
} from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');
    const startDate = request.nextUrl.searchParams.get('startDate');
    const endDate = request.nextUrl.searchParams.get('endDate');

    if (!companyId) throw new Error('Company ID required');

    const user = await requireCompanyAccess(request, companyId);

    let query = supabaseAdmin
      .from('transactions')
      .select('date, amount, type')
      .eq('company_id', companyId)
      .eq('is_deleted', false);

    if (startDate) query = query.gte('date', startDate);
    if (endDate) query = query.lte('date', endDate);

    const { data, error } = await query;

    if (error) throw error;

    // Group by date and calculate daily totals
    const dailyMap = new Map<string, { income: number; expense: number }>();
    (data || []).forEach((tx: any) => {
      const current = dailyMap.get(tx.date) || { income: 0, expense: 0 };
      if (tx.type === 'income') {
        current.income += Number(tx.amount);
      } else {
        current.expense += Number(tx.amount);
      }
      dailyMap.set(tx.date, current);
    });

    const trends = Array.from(dailyMap.entries()).map(([date, { income, expense }]) => ({
      date,
      income,
      expense,
      net: income - expense
    }));

    return NextResponse.json(successResponse(trends));
  } catch (error: any) {
    return handleApiError(error);
  }
}
