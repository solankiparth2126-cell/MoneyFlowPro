import { NextRequest, NextResponse } from 'next/server';
import {
  requireCompanyAccess,
  logAudit,
  successResponse,
  handleApiError,
  supabaseAdmin,
} from '@/lib/api-middleware';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: companyId } = await params;
    if (!companyId) throw new Error('Company ID required');

    const user = await requireCompanyAccess(request, companyId);

    // 1. Check for existing financial years
    let { data: financialYears, error } = await supabaseAdmin
      .from('financial_years')
      .select('*')
      .eq('company_id', companyId)
      .order('start_date', { ascending: false });

    if (error) throw error;

    // 2. Auto-Seed if empty
    if (!financialYears || financialYears.length === 0) {
      console.log(`[BOOTSTRAP] Dynamic auto-seeding FYs for company: ${companyId}`);
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1; // 1-12

      // Indian FY starts in April (4)
      let fyStartYear = currentMonth >= 4 ? currentYear : currentYear - 1;
      
      const defaultFYs = [
        {
          name: `FY ${fyStartYear}-${(fyStartYear + 1).toString().slice(-2)}`,
          start_date: `${fyStartYear}-04-01`,
          end_date: `${fyStartYear + 1}-03-31`,
          is_active: true,
          company_id: companyId,
          description: 'Auto-generated current financial year'
        },
        {
          name: `FY ${fyStartYear - 1}-${fyStartYear.toString().slice(-2)}`,
          start_date: `${fyStartYear - 1}-04-01`,
          end_date: `${fyStartYear}-03-31`,
          is_active: false,
          company_id: companyId,
          description: 'Auto-generated previous financial year'
        }
      ];

      const { data: seeded, error: seedErr } = await supabaseAdmin
        .from('financial_years')
        .insert(defaultFYs)
        .select();

      if (seedErr) throw seedErr;
      financialYears = seeded;

      await logAudit(user.id, companyId, 'CREATE', 'MASTERS', 'System auto-seeded default financial years');
    }

    return NextResponse.json(successResponse(financialYears || []));
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { companyId, ...financialYearData } = body;

    if (!companyId) throw new Error('Company ID required');

    const user = await requireCompanyAccess(request, companyId);

    const { data, error } = await supabaseAdmin
      .from('financial_years')
      .insert([{ ...financialYearData, company_id: companyId }])
      .select()
      .single();

    if (error) throw error;

    await logAudit(user.id, companyId, 'CREATE', 'FINANCIAL_YEARS', 'Created financial year');

    return NextResponse.json(successResponse(data), { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { companyId, ...financialYearData } = body;

    if (!companyId) throw new Error('Company ID required');

    const user = await requireCompanyAccess(request, companyId);

    const { data, error } = await supabaseAdmin
      .from('financial_years')
      .update(financialYearData)
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) throw error;

    await logAudit(user.id, companyId, 'UPDATE', 'FINANCIAL_YEARS', 'Updated financial year');

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
      .from('financial_years')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId);

    if (error) throw error;

    await logAudit(user.id, companyId, 'DELETE', 'FINANCIAL_YEARS', 'Deleted financial year');

    return NextResponse.json(successResponse({ id }), { status: 200 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
