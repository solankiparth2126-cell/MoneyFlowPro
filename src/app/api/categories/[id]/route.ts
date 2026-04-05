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

    if (!companyId || !id) throw new Error('Company ID and Category ID required');

    const user = await requireCompanyAccess(request, companyId);

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update({
        name: body.name,
        type: body.type,
        icon: body.icon,
        color: body.color,
        parent_id: body.parentId,
        keywords: body.keywords,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;

    await logAudit(user.id, companyId, 'UPDATE', 'CATEGORIES', `Updated category: ${body.name}`);

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

    if (!companyId || !id) throw new Error('Company ID and Category ID required');

    const user = await requireCompanyAccess(request, companyId);

    const { error } = await supabaseAdmin
      .from('categories')
      .update({ is_deleted: true })
      .eq('id', id)
      .eq('company_id', companyId);

    if (error) throw error;

    await logAudit(user.id, companyId, 'DELETE', 'CATEGORIES', `Deleted category ID: ${id}`);

    return NextResponse.json(successResponse({ success: true }));
  } catch (error: any) {
    return handleApiError(error);
  }
}
