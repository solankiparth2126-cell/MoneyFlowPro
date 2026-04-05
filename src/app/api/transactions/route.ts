import { NextRequest, NextResponse } from 'next/server';
import {
  requireCompanyAccess,
  logAudit,
  successResponse,
  handleApiError,
} from '@/lib/api-middleware';
import { createClient } from '@/lib/supabase-server-client';
import { transactionSchema } from '@/lib/validations';

/**
 * GET /api/transactions?companyId=xxx
 * Fetch transactions for a company (user must own company)
 */
export async function GET(request: NextRequest) {
  try {
    const companyId = request.nextUrl.searchParams.get('companyId');
    if (!companyId) throw new Error('Company ID required');

    const user = await requireCompanyAccess(request, companyId);
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_deleted', false)
      .order('date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(successResponse(data || []));
  } catch (error: any) {
    return handleApiError(error);
  }
}

/**
 * POST /api/transactions
 * Create a new transaction or batch of transactions (user must own company)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, batch } = body;

    if (!companyId) throw new Error('Company ID required');

    const user = await requireCompanyAccess(request, companyId);
    const supabase = await createClient();

    // Handle batch import
    if (batch && Array.isArray(batch)) {
      // Validate each transaction in batch
      const validatedBatch = batch.map((tx: any, index: number) => {
        try {
          return transactionSchema.parse(tx);
        } catch (err: any) {
          throw new Error(`Transaction ${index + 1} validation failed: ${err.message}`);
        }
      });

      // Check that all transactions have a ledger
      const missingLedger = validatedBatch.findIndex((tx: any) => !tx.ledgerId);
      if (missingLedger >= 0) {
        throw new Error(`Transaction ${missingLedger + 1}: Ledger is required for all imported transactions`);
      }

      // Insert batch
      const insertData = validatedBatch.map((validated: any) => ({
        description: validated.description,
        amount: validated.amount,
        date: validated.date,
        type: validated.type,
        category_id: validated.category || null,
        ledger_id: validated.ledgerId,
        payment_method: validated.paymentMethod,
        company_id: companyId,
        currency: 'INR',
      }));

      const { data, error } = await supabase
        .from('transactions')
        .insert(insertData)
        .select();

      if (error) throw error;

      await logAudit(
        user.id,
        companyId,
        'CREATE',
        'TRANSACTIONS',
        `Batch imported ${data?.length || 0} transactions`
      );

      return NextResponse.json(successResponse(data || []), { status: 201 });
    }

    // Single transaction import
    const validated = transactionSchema.parse(body);

    // Create transaction
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          description: validated.description,
          amount: validated.amount,
          date: validated.date,
          type: validated.type,
          category_id: validated.category,
          ledger_id: validated.ledgerId || null,
          payment_method: validated.paymentMethod,
          company_id: companyId,
          currency: 'INR',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    await logAudit(user.id, companyId, 'CREATE', 'TRANSACTIONS', `Created transaction: ${validated.description} (₹${validated.amount})`);

    return NextResponse.json(successResponse(data), { status: 201 });
  } catch (error: any) {
    return handleApiError(error);
  }
}
