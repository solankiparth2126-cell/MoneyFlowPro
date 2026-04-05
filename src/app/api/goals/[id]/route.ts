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
    const { companyId, ...goalData } = body;

    if (!companyId) throw new Error('Company ID required');

    const user = await requireCompanyAccess(request, companyId);

    const { data, error } = await supabaseAdmin
      .from('goals')
      .update(goalData)
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;

    await logAudit(user.id, companyId, 'UPDATE', 'GOALS', `Updated goal`);

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

    if (!companyId) throw new Error('Company ID required');

    const user = await requireCompanyAccess(request, companyId);

    const { error } = await supabaseAdmin
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId);

    if (error) throw error;

    await logAudit(user.id, companyId, 'DELETE', 'GOALS', `Deleted goal`);

    return NextResponse.json(successResponse({ id }), { status: 200 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
