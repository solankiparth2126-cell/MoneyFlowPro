import { NextRequest, NextResponse } from 'next/server';
import {
  requireCompanyAccess,
  requireAuth,
  logAudit,
  successResponse,
  handleApiError,
  supabaseAdmin,
} from '@/lib/api-middleware';

// GET /api/masters/companies - Get all companies for the user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    let companies = [];

    if (user.role === 'ADMIN') {
      // Global Admin can see all companies
      const { data, error } = await supabaseAdmin
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      companies = data || [];
    } else {
      // Regular users only see their linked companies
      const { data, error } = await supabaseAdmin
        .from('user_company_access')
        .select(`
          company_id,
          companies (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      companies = (data || [])
        .map(uca => uca.companies)
        .filter(c => c && Object.keys(c).length > 0);
    }
    
    return NextResponse.json(successResponse(companies));
  } catch (error: any) {
    return handleApiError(error);
  }
}

// GET /api/masters/companies/:id/financial-years - Get financial years for company
export async function GET_FINANCIAL_YEARS(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    const user = await requireCompanyAccess(request, companyId);

    const { data, error } = await supabaseAdmin
      .from('financial_years')
      .select('*')
      .eq('company_id', companyId)
      .order('start_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(successResponse(data || []));
  } catch (error: any) {
    return handleApiError(error);
  }
}
