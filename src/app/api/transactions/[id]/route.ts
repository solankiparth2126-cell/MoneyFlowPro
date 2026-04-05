import { NextRequest, NextResponse } from 'next/server';
import { transactionSchema } from '@/lib/validations';
import {
  requireCompanyAccess,
  logAudit,
  successResponse,
  handleApiError,
  ApiError,
} from '@/lib/api-middleware';
import { createClient } from '@/lib/supabase-server-client';

/**
 * PUT /api/transactions/[id]
 * Update a transaction (user must own company)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      throw new ApiError('Transaction ID required', 400);
    }

    const body = await request.json();
    const validated = transactionSchema.parse(body);
    const { companyId } = body;

    if (!companyId) {
      throw new ApiError('Company ID required', 400);
    }

    const user = await requireCompanyAccess(request, companyId);
    const supabase = await createClient();

    // Verify transaction belongs to this company (Implicitly enforced by RLS, but explicit for logic)
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id')
      .eq('id', id)
      .eq('company_id', companyId)
      .maybeSingle();

    if (txError || !transaction) {
      throw new ApiError('Transaction not found', 404);
    }

    // Update transaction
    const { data, error } = await supabase
      .from('transactions')
      .update({
        description: validated.description,
        amount: validated.amount,
        date: validated.date,
        type: validated.type,
        category_id: validated.category,
        ledger_id: validated.ledgerId || null,
        payment_method: validated.paymentMethod,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log audit
    await logAudit(
      user.id,
      companyId,
      'UPDATE',
      'TRANSACTIONS',
      `Updated transaction: ${validated.description}`
    );

    return NextResponse.json(successResponse(data));
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/transactions/[id]
 * Soft delete a transaction (user must own company)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      throw new ApiError('Transaction ID required', 400);
    }

    const { companyId } = await request.json();

    if (!companyId) {
      throw new ApiError('Company ID required', 400);
    }

    const user = await requireCompanyAccess(request, companyId);
    const supabase = await createClient();

    // Verify transaction belongs to this company
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('id')
      .eq('id', id)
      .eq('company_id', companyId)
      .maybeSingle();

    if (txError || !transaction) {
      throw new ApiError('Transaction not found', 404);
    }

    // Soft delete
    const { error } = await supabase
      .from('transactions')
      .update({ is_deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', companyId);

    if (error) {
      throw error;
    }

    // Log audit
    await logAudit(
      user.id,
      companyId,
      'DELETE',
      'TRANSACTIONS',
      `Soft-deleted transaction ID: ${id}`
    );

    return NextResponse.json(successResponse({ success: true }));
  } catch (error: any) {
    return handleApiError(error);
  }
}
