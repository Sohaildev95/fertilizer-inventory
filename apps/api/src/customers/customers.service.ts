import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { QueryCustomersDto } from './dto/query-customers.dto.js';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * List customers / farmers with search and pagination
   */
  async findAll(query: QueryCustomersDto) {
    const adminClient = this.supabaseService.getAdminClient();
    const page = query.page || 1;
    const limit = query.limit || 50;
    const offset = (page - 1) * limit;

    let supabaseQuery = adminClient
      .from('customers')
      .select('*', { count: 'exact' });

    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    } else {
      supabaseQuery = supabaseQuery.eq('status', 'active');
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${q}%,phone.ilike.%${q}%,village.ilike.%${q}%,cnic.ilike.%${q}%`,
      );
    }

    supabaseQuery = supabaseQuery
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await supabaseQuery;

    if (error) {
      this.logger.error(`Failed to fetch customers: ${error.message}`);
      throw new BadRequestException(`Kisanon ki list lane mein masla aya: ${error.message}`);
    }

    return {
      data: data || [],
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Find single customer with summary
   */
  async findOne(id: string) {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: customer, error } = await adminClient
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !customer) {
      throw new NotFoundException(`Kisan record nahi mila (ID: ${id})`);
    }

    // Also fetch recent sales
    const { data: recentSales } = await adminClient
      .from('sales')
      .select('id, invoice_no, sale_date, total_amount, paid_amount, balance_due, payment_status')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Also fetch recent payments received
    const { data: recentPayments } = await adminClient
      .from('payments')
      .select('id, payment_number, amount, payment_method, notes, created_at')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      ...customer,
      recentSales: recentSales || [],
      recentPayments: recentPayments || [],
    };
  }

  /**
   * Create a new farmer / customer
   */
  async create(dto: CreateCustomerDto) {
    const adminClient = this.supabaseService.getAdminClient();

    const initialBalance = dto.currentBalance ?? 0;
    const creditLimit = dto.creditLimit ?? 50000;

    const { data: customer, error } = await adminClient
      .from('customers')
      .insert({
        name: dto.name.trim(),
        phone: dto.phone.trim(),
        alt_phone: dto.altPhone?.trim() || null,
        cnic: dto.cnic?.trim() || null,
        village: dto.village?.trim() || null,
        address: dto.address?.trim() || null,
        credit_limit: creditLimit,
        current_balance: initialBalance,
        status: 'active',
        notes: dto.notes?.trim() || null,
      })
      .select('*')
      .single();

    if (error) {
      this.logger.error(`Failed to create customer: ${error.message}`);
      throw new BadRequestException(`Kisan register karne mein masla aya: ${error.message}`);
    }

    // If starting balance was entered (> 0), log an opening balance transaction
    if (initialBalance > 0) {
      await adminClient.from('payments').insert({
        payment_number: `OPN-${Date.now().toString().slice(-6)}`,
        entity_type: 'customer',
        customer_id: customer.id,
        reference_type: 'opening_balance',
        amount: initialBalance,
        payment_type: 'debit',
        payment_method: 'cash',
        notes: 'Sabqa Sabqa / Opening Balance (سابقہ پرانا بقایا ادھار)',
      });
    }

    return customer;
  }

  /**
   * Update customer profile or credit limit
   */
  async update(id: string, dto: Partial<CreateCustomerDto>) {
    const adminClient = this.supabaseService.getAdminClient();

    const updatePayload: Record<string, any> = {};
    if (dto.name !== undefined) updatePayload.name = dto.name.trim();
    if (dto.phone !== undefined) updatePayload.phone = dto.phone.trim();
    if (dto.altPhone !== undefined) updatePayload.alt_phone = dto.altPhone.trim() || null;
    if (dto.cnic !== undefined) updatePayload.cnic = dto.cnic.trim() || null;
    if (dto.village !== undefined) updatePayload.village = dto.village.trim() || null;
    if (dto.address !== undefined) updatePayload.address = dto.address.trim() || null;
    if (dto.creditLimit !== undefined) updatePayload.credit_limit = dto.creditLimit;
    if (dto.notes !== undefined) updatePayload.notes = dto.notes.trim() || null;

    const { data, error } = await adminClient
      .from('customers')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new BadRequestException(`Kisan update karne mein masla aya: ${error.message}`);
    }

    return data;
  }

  /**
   * Record payment / Wasooli received from customer
   */
  async recordPayment(customerId: string, dto: any, userId?: string) {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: customer, error: cErr } = await adminClient
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (cErr || !customer) {
      throw new NotFoundException(`کسان کا ریکارڈ نہیں ملا (ID: ${customerId})`);
    }

    const amount = Number(dto.amount);
    if (!amount || amount <= 0) {
      throw new BadRequestException('وصولی کی رقم صفر سے زیادہ ہونی چاہیے');
    }

    const oldBalance = Number(customer.current_balance || 0);
    const newBalance = Math.max(0, oldBalance - amount);
    const receiptNo = `REC-${Date.now().toString().slice(-6)}`;

    // 1. Insert into payments table
    const { data: payment, error: pErr } = await adminClient
      .from('payments')
      .insert({
        payment_number: receiptNo,
        entity_type: 'customer',
        customer_id: customerId,
        reference_type: 'direct_payment',
        amount: amount,
        payment_type: 'credit',
        payment_method: dto.paymentMethod || 'cash',
        cheque_number: dto.chequeNumber?.trim() || null,
        cheque_date: dto.chequeDate || null,
        notes: dto.notes?.trim() || 'کاؤنٹر وصولی (نقد یا چیک)',
        created_by: userId || null,
      })
      .select('*')
      .single();

    if (pErr) {
      this.logger.error(`Failed to record payment: ${pErr.message}`);
      throw new BadRequestException(`رقم وصولی کا اندراج نہیں ہو سکا: ${pErr.message}`);
    }

    // 2. Update customer balance
    await adminClient
      .from('customers')
      .update({ current_balance: newBalance })
      .eq('id', customerId);

    return {
      success: true,
      receiptNo,
      payment,
      oldBalance,
      newBalance,
      customer: {
        ...customer,
        current_balance: newBalance,
      },
    };
  }

  /**
   * Get Khata statement (chronological running ledger with debit/credit balance)
   */
  async getLedger(customerId: string) {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: customer, error: cErr } = await adminClient
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (cErr || !customer) {
      throw new NotFoundException(`کیسان ریکارڈ نہیں ملا (ID: ${customerId})`);
    }

    // Fetch all sales for this customer with items
    const { data: sales } = await adminClient
      .from('sales')
      .select('*, items:sale_items(quantity, unit_price, total_price, product:products(name, urdu_name))')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: true });

    // Fetch all payments for this customer
    const { data: payments } = await adminClient
      .from('payments')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: true });

    // Build unified chronological transactions
    const rawEvents: any[] = [];

    (sales || []).forEach((s: any) => {
      const itemsSummary = (s.items || [])
        .map((it: any) => `${it.product?.urdu_name || it.product?.name || 'کھاد'} (${it.quantity} بوری)`)
        .join(', ');

      // Debit = entire bill total
      rawEvents.push({
        id: `sale-${s.id}`,
        date: s.sale_date || s.created_at.slice(0, 10),
        timestamp: new Date(s.created_at).getTime(),
        type: 'sale',
        description: itemsSummary ? `خریداری: ${itemsSummary}` : `سیل انوائس #${s.invoice_no}`,
        biltyOrSlipNo: s.invoice_no,
        debit: Number(s.total_amount || 0),
        credit: 0,
        paymentMethod: s.payment_method,
      });

      // If counter cash was paid at the time of sale, record the credit event
      if (Number(s.paid_amount || 0) > 0) {
        rawEvents.push({
          id: `sale-paid-${s.id}`,
          date: s.sale_date || s.created_at.slice(0, 10),
          timestamp: new Date(s.created_at).getTime() + 1, // 1ms after debit
          type: 'sale_payment',
          description: `کاؤنٹر فوری ادائیگی (انوائس #${s.invoice_no})`,
          biltyOrSlipNo: s.invoice_no,
          debit: 0,
          credit: Number(s.paid_amount || 0),
          paymentMethod: s.payment_method,
        });
      }
    });

    (payments || []).forEach((p: any) => {
      // Exclude sale payments if already recorded or opening balance
      if (p.reference_type === 'opening_balance') {
        rawEvents.push({
          id: `opn-${p.id}`,
          date: p.created_at.slice(0, 10),
          timestamp: new Date(p.created_at).getTime() - 1000000,
          type: 'opening_balance',
          description: 'سابقہ پرانا کھاتہ ادھار (Opening Balance)',
          biltyOrSlipNo: p.payment_number,
          debit: Number(p.amount || 0),
          credit: 0,
          paymentMethod: p.payment_method,
        });
      } else if (p.reference_type === 'direct_payment') {
        rawEvents.push({
          id: `pay-${p.id}`,
          date: p.created_at.slice(0, 10),
          timestamp: new Date(p.created_at).getTime(),
          type: 'direct_payment',
          description: p.notes || `وصولی رقم (${p.payment_method})`,
          biltyOrSlipNo: p.payment_number,
          debit: 0,
          credit: Number(p.amount || 0),
          paymentMethod: p.payment_method,
        });
      }
    });

    // Sort all events chronologically
    rawEvents.sort((a, b) => a.timestamp - b.timestamp);

    // Calculate running balance (میزان)
    let runningBalance = 0;
    const transactions = rawEvents.map((ev) => {
      runningBalance = runningBalance + ev.debit - ev.credit;
      return {
        ...ev,
        balance: runningBalance,
      };
    });

    return {
      customer,
      transactions,
      summary: {
        totalDebit: transactions.reduce((s, t) => s + t.debit, 0),
        totalCredit: transactions.reduce((s, t) => s + t.credit, 0),
        netBalance: runningBalance,
      },
    };
  }

  /**
   * Get Customers Summary Stats (Total Udhaar, Over limit, Count)
   */
  async getSummaryStats() {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: customers } = await adminClient
      .from('customers')
      .select('id, current_balance, credit_limit, status');

    let totalUdhar = 0;
    let overLimitCount = 0;
    const totalCount = customers?.length || 0;

    (customers || []).forEach((c: any) => {
      const bal = Number(c.current_balance || 0);
      const limit = Number(c.credit_limit || 0);
      if (bal > 0) totalUdhar += bal;
      if (bal > limit) overLimitCount++;
    });

    // Today's recovery
    const today = new Date().toISOString().slice(0, 10);
    const { data: todayPayments } = await adminClient
      .from('payments')
      .select('amount')
      .eq('entity_type', 'customer')
      .eq('payment_type', 'credit')
      .gte('created_at', today);

    const todayRecovery = (todayPayments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);

    return {
      totalCount,
      totalUdhar,
      overLimitCount,
      todayRecovery,
    };
  }
}
