import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Verify company ownership for authenticated user
 * POST /api/auth/verify with { companyId }
 */
export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID required' },
        { status: 400 }
      );
    }

    // Create Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // Cookies are read-only in middleware
          },
          remove(name: string, options: any) {
            // Cookies are read-only in middleware
          },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has access to this company
    const { data: access, error: accessError } = await supabase
      .from('user_company_access')
      .select('id, role')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .maybeSingle();

    if (accessError || !access) {
      return NextResponse.json(
        { error: 'Forbidden - No access to this company' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      authorized: true,
      userId: user.id,
      companyId,
      role: access.role,
    });
  } catch (error: any) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
