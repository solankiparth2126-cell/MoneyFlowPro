import { NextRequest, NextResponse } from 'next/server';
import {
  requireCompanyAccess,
  logAudit,
  successResponse,
  handleApiError,
  supabaseAdmin,
} from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');
    if (!companyId) throw new Error('Company ID required');

    const user = await requireCompanyAccess(request, companyId);

    const { data, error } = await supabaseAdmin
      .from('recurring_transactions')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(successResponse(data || []));
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, ...data } = body;

    if (!companyId) throw new Error('Company ID required');

    const user = await requireCompanyAccess(request, companyId);

    const { data: result, error } = await supabaseAdmin
      .from('recurring_transactions')
      .insert([{ ...data, company_id: companyId, created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;

    await logAudit(user.id, companyId, 'CREATE', 'RECURRING','Created recurring transaction');

    return NextResponse.json(successResponse(result), { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
