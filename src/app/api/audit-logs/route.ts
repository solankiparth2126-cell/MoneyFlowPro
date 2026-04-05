import { NextRequest, NextResponse } from "next/server";
import {
  requireCompanyAccess,
  successResponse,
  handleApiError,
  supabaseAdmin,
} from "@/lib/api-middleware";

export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get("companyId");
    if (!companyId) throw new Error("Company ID required");

    const user = await requireCompanyAccess(request, companyId);

    const { data, error } = await supabaseAdmin
      .from("audit_logs")
      .select("*")
      .eq("company_id", companyId)
      .order("timestamp", { ascending: false });

    if (error) throw error;
    return NextResponse.json(successResponse(data || []));
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId } = body;

    if (!companyId) {
      throw new Error("Company ID required");
    }

    const user = await requireCompanyAccess(request, companyId);

    const { error } = await supabaseAdmin
      .from("audit_logs")
      .delete()
      .eq("company_id", companyId);

    if (error) throw error;

    return NextResponse.json(successResponse({ success: true }));
  } catch (error: any) {
    return handleApiError(error);
  }
}
