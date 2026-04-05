import { NextRequest, NextResponse } from 'next/server';
import {
  requireCompanyAccess,
  logAudit,
  successResponse,
  handleApiError,
  supabaseAdmin,
} from '@/lib/api-middleware';
import { ledgerSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');
    if (!companyId) throw new Error('Company ID required');

    const user = await requireCompanyAccess(request, companyId);

    const { data, error } = await supabaseAdmin
      .from('ledgers')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_deleted', false)
      .order('name', { ascending: true });

    if (error) throw error;
    return NextResponse.json(successResponse(data || []));
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId } = body;
    if (!companyId) throw new Error('Company ID required');

    const user = await requireCompanyAccess(request, companyId);

    const { data, error } = await supabaseAdmin
      .from('ledgers')
      .insert([{
        name: body.name,
        description: body.description,
        initial_balance: body.initialBalance ?? 0,
        balance: body.balance ?? 0,
        icon: body.icon,
        account_type: body.accountType,
        currency: body.currency || 'INR',
        company_id: companyId,
      }])
      .select()
      .single();

    if (error) throw error;

    await logAudit(user.id, companyId, 'CREATE', 'LEDGERS', `Created ledger: ${body.name}`);

    return NextResponse.json(successResponse(data), { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
