import { NextRequest, NextResponse } from 'next/server';
import {
  requireCompanyAccess,
  successResponse,
  handleApiError,
  supabaseAdmin,
} from '@/lib/api-middleware';

/**
 * GET /api/budgets?companyId=...&month=3&year=2024
 * Get budgets with status
 */
export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');
    const month = request.nextUrl.searchParams.get('month');
    const year = request.nextUrl.searchParams.get('year');

    if (!companyId) {
      throw new Error('Company ID required');
    }

    const user = await requireCompanyAccess(request, companyId);

    // Fetch budgets
    let query = supabaseAdmin
      .from('budgets')
      .select('*, categories(*)')
      .eq('company_id', companyId);

    if (month) query = query.eq('month', parseInt(month));
    if (year) query = query.eq('year', parseInt(year));

    const { data: budgetData, error: budgetError } = await query;
    if (budgetError) throw budgetError;

    const mappedBudgets = (budgetData || []).map(b => ({
      id: b.id,
      amount: Number(b.amount),
      month: b.month,
      year: b.year,
      category: b.categories,
      categoryId: b.category_id
    }));

    // Calculate status if month/year provided
    let status: any[] = [];
    if (month && year) {
      const monthStr = month.toString().padStart(2, '0');
      const startOfMonth = `${year}-${monthStr}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endOfMonth = `${year}-${monthStr}-${lastDay.toString().padStart(2, '0')}`;

      const { data: txData, error: txError } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('company_id', companyId)
        .eq('type', 'expense')
        .eq('is_deleted', false)
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);

      if (txError) throw txError;

      status = mappedBudgets.map(b => {
        const catName = b.category?.name || "Unknown";
        const spent = (txData || [])
          .filter(tx => tx.category_id === b.categoryId)
          .reduce((acc, tx) => acc + Number(tx.amount), 0);

        return {
          id: b.id,
          categoryName: catName,
          amount: b.amount,
          spent,
          remaining: b.amount - spent,
          percentUsed: b.amount > 0 ? (spent / b.amount) * 100 : 0
        };
      });
    }

    return NextResponse.json(successResponse({ budgets: mappedBudgets, status }));
  } catch (error: any) {
    return handleApiError(error);
  }
}
