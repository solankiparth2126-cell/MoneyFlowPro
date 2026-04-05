import { NextRequest, NextResponse } from 'next/server';
import {
  requireCompanyAccess,
  logAudit,
  successResponse,
  handleApiError,
  supabaseAdmin,
} from '@/lib/api-middleware';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { companyId } = body;

    if (!companyId || !id) throw new Error('Company ID and Ledger ID required');

    const user = await requireCompanyAccess(request, companyId);

    const { data, error } = await supabaseAdmin
      .from('ledgers')
      .update({
        name: body.name,
        description: body.description,
        balance: body.balance,
        initial_balance: body.initialBalance,
        icon: body.icon,
        account_type: body.accountType,
        currency: body.currency,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;

    await logAudit(user.id, companyId, 'UPDATE', 'LEDGERS', `Updated ledger: ${body.name}`);

    return NextResponse.json(successResponse(data));
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { companyId } = body;

    if (!companyId || !id) throw new Error('Company ID and Ledger ID required');

    const user = await requireCompanyAccess(request, companyId);

    const { error } = await supabaseAdmin
      .from('ledgers')
      .update({ is_deleted: true })
      .eq('id', id)
      .eq('company_id', companyId);

    if (error) throw error;

    await logAudit(user.id, companyId, 'DELETE', 'LEDGERS', `Deleted ledger ID: ${id}`);

    return NextResponse.json(successResponse({ success: true }));
  } catch (error: any) {
    return handleApiError(error);
  }
}
