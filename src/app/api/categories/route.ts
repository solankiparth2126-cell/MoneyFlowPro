import { NextRequest, NextResponse } from 'next/server';
import {
  requireCompanyAccess,
  logAudit,
  successResponse,
  handleApiError,
  supabaseAdmin,
} from '@/lib/api-middleware';
import { categorySchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');
    if (!companyId) throw new Error('Company ID required');

    const user = await requireCompanyAccess(request, companyId);

    const { data, error } = await supabaseAdmin
      .from('categories')
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
      .from('categories')
      .insert([{
        name: body.name,
        type: body.type,
        icon: body.icon,
        color: body.color || '#4f46e5',
        keywords: body.keywords,
        parent_id: body.parentId,
        company_id: companyId,
      }])
      .select()
      .single();

    if (error) throw error;

    await logAudit(user.id, companyId, 'CREATE', 'CATEGORIES', `Created category: ${body.name}`);

    return NextResponse.json(successResponse(data), { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
