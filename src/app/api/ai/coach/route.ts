import { NextRequest, NextResponse } from 'next/server';
import {
  requireCompanyAccess,
  successResponse,
  handleApiError,
  supabaseAdmin,
} from '@/lib/api-middleware';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');
    if (!companyId) throw new Error('Company ID required');

    await requireCompanyAccess(request, companyId);

    const now = new Date();
    const currentStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const currentEnd = format(endOfMonth(now), 'yyyy-MM-dd');
    
    const lastMonth = subMonths(now, 1);
    const lastStart = format(startOfMonth(lastMonth), 'yyyy-MM-dd');
    const lastEnd = format(endOfMonth(lastMonth), 'yyyy-MM-dd');

    // 1. Fetch Current + Previous Month Expenses
    const { data: currentData, error: currentErr } = await supabaseAdmin
      .from('transactions')
      .select('amount, type, category_id, categories(name)')
      .eq('company_id', companyId)
      .eq('is_deleted', false)
      .gte('date', currentStart)
      .lte('date', currentEnd);

    const { data: lastData, error: lastErr } = await supabaseAdmin
      .from('transactions')
      .select('amount')
      .eq('company_id', companyId)
      .eq('is_deleted', false)
      .eq('type', 'expense')
      .gte('date', lastStart)
      .lte('date', lastEnd);

    if (currentErr || lastErr) throw currentErr || lastErr;

    // 2. Calculations
    const currentExpenses = (currentData || [])
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const lastExpenses = (lastData || [])
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentIncome = (currentData || [])
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // 3. Category Drivers
    const categoryMap = new Map<string, number>();
    (currentData || []).filter(t => t.type === 'expense').forEach((t: any) => {
      const categoryData = Array.isArray(t.categories) ? t.categories[0] : t.categories;
      const name = categoryData?.name || 'Uncategorized';
      categoryMap.set(name, (categoryMap.get(name) || 0) + Number(t.amount));
    });

    const topCategories = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, amount]) => ({ name, amount }));

    // 4. Checklist Generation
    const checklist = [];
    
    const uncategorizedCount = currentData?.filter(t => !t.category_id).length || 0;
    if (uncategorizedCount > 0) {
      checklist.push({
        id: 'uncategorized',
        task: `Categorize ${uncategorizedCount} recent transactions`,
        priority: 'high',
        action: '/transactions'
      });
    }

    if (currentExpenses > lastExpenses && lastExpenses > 0) {
      checklist.push({
        id: 'spending_alert',
        task: 'Review top categories - spending is higher than last month',
        priority: 'medium',
        action: '/reports'
      });
    } else if (currentExpenses === 0 && currentIncome === 0) {
      checklist.push({
        id: 'no_data',
        task: 'Import your bank statement to see AI insights',
        priority: 'high',
        action: '/transactions'
      });
    }

    // 5. Savings Goal
    const savings = currentIncome - currentExpenses;
    const efficiencyTarget = topCategories.length > 0 
      ? `Aim to reduce '${topCategories[0].name}' by 10% next month to save ₹${(topCategories[0].amount * 0.1).toFixed(0)}.`
      : "You're all set! Keep tracking to unlock deep goals.";

    const response = {
      summary: {
        currentExpenses,
        lastExpenses,
        currentIncome,
        savings,
        momChange: lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0
      },
      topCategories,
      efficiencyTarget,
      checklist: checklist.slice(0, 3)
    };

    return NextResponse.json(successResponse(response), {
      headers: {
        'Cache-Control': 's-maxage=3600'
      }
    });
  } catch (error: any) {
    console.error('[AI COACH API ERROR]', error);
    return handleApiError(error);
  }
}
