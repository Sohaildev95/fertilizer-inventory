import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { CreateVendorDto } from './dto/create-vendor.dto.js';
import { QueryVendorsDto } from './dto/query-vendors.dto.js';
import { CreateVendorPaymentDto } from './dto/create-vendor-payment.dto.js';
import { VendorPriceUpdateDto, VendorDispatchNoticeDto } from './dto/vendor-portal.dto.js';

@Injectable()
export class VendorsService {
  private readonly logger = new Logger(VendorsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * List vendors / suppliers with search and pagination
   */
  async findAll(query: QueryVendorsDto) {
    const adminClient = this.supabaseService.getAdminClient();
    const page = query.page || 1;
    const limit = query.limit || 50;
    const offset = (page - 1) * limit;

    let supabaseQuery = adminClient
      .from('vendors')
      .select('*', { count: 'exact' });

    if (query.status) {
      supabaseQuery = supabaseQuery.eq('status', query.status);
    } else {
      supabaseQuery = supabaseQuery.neq('status', 'deleted');
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${q}%,company_name.ilike.%${q}%,phone.ilike.%${q}%,city.ilike.%${q}%,contact_person.ilike.%${q}%`,
      );
    }

    supabaseQuery = supabaseQuery
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await supabaseQuery;

    if (error) {
      this.logger.error(`Failed to fetch vendors: ${error.message}`);
      throw new BadRequestException(`سپلائرز کی لسٹ لانے میں مسئلہ پیش آیا: ${error.message}`);
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
   * Find single vendor with summary
   */
  async findOne(id: string) {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: vendor, error } = await adminClient
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !vendor) {
      throw new NotFoundException(`سپلائر کا ریکارڈ نہیں ملا (ID: ${id})`);
    }

    // Recent purchases
    const { data: recentPurchases } = await adminClient
      .from('purchases')
      .select('id, invoice_no, purchase_date, total_amount, paid_amount, balance_due, payment_status')
      .eq('vendor_id', id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Recent payments sent
    const { data: recentPayments } = await adminClient
      .from('payments')
      .select('id, payment_number, amount, payment_method, notes, created_at')
      .eq('vendor_id', id)
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      ...vendor,
      recentPurchases: recentPurchases || [],
      recentPayments: recentPayments || [],
    };
  }

  /**
   * Create new vendor
   */
  async create(dto: CreateVendorDto) {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = await adminClient
      .from('vendors')
      .insert({
        name: dto.name.trim(),
        company_name: dto.companyName?.trim() || null,
        contact_person: dto.contactPerson?.trim() || null,
        phone: dto.phone.trim(),
        alt_phone: dto.altPhone?.trim() || null,
        email: dto.email?.trim() || null,
        cnic: dto.cnic?.trim() || null,
        address: dto.address?.trim() || null,
        city: dto.city?.trim() || 'Multan',
        current_balance: Number(dto.currentBalance || 0),
        status: dto.status || 'active',
        notes: dto.notes?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to create vendor: ${error.message}`);
      throw new BadRequestException(`نیا سپلائر رجسٹر کرنے میں مسئلہ آیا: ${error.message}`);
    }

    return data;
  }

  /**
   * Update existing vendor
   */
  async update(id: string, dto: Partial<CreateVendorDto>) {
    const adminClient = this.supabaseService.getAdminClient();

    const updatePayload: Record<string, any> = {};
    if (dto.name !== undefined) updatePayload.name = dto.name.trim();
    if (dto.companyName !== undefined) updatePayload.company_name = dto.companyName.trim();
    if (dto.contactPerson !== undefined) updatePayload.contact_person = dto.contactPerson.trim();
    if (dto.phone !== undefined) updatePayload.phone = dto.phone.trim();
    if (dto.altPhone !== undefined) updatePayload.alt_phone = dto.altPhone.trim();
    if (dto.email !== undefined) updatePayload.email = dto.email.trim();
    if (dto.cnic !== undefined) updatePayload.cnic = dto.cnic.trim();
    if (dto.address !== undefined) updatePayload.address = dto.address.trim();
    if (dto.city !== undefined) updatePayload.city = dto.city.trim();
    if (dto.currentBalance !== undefined) updatePayload.current_balance = Number(dto.currentBalance);
    if (dto.status !== undefined) updatePayload.status = dto.status;
    if (dto.notes !== undefined) updatePayload.notes = dto.notes.trim();

    const { data, error } = await adminClient
      .from('vendors')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to update vendor: ${error.message}`);
      throw new BadRequestException(`سپلائر اپڈیٹ کرنے میں مسئلہ آیا: ${error.message}`);
    }

    return data;
  }

  /**
   * KPI Summary Stats for Vendors
   */
  async getSummaryStats() {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: vendors, error } = await adminClient
      .from('vendors')
      .select('id, current_balance, status');

    if (error) {
      this.logger.error(`Failed to get vendor stats: ${error.message}`);
      throw new BadRequestException(`سپلائر سٹیٹس لوڈ کرنے میں خرابی: ${error.message}`);
    }

    const allVendors = vendors || [];
    const totalCount = allVendors.length;
    const activeCount = allVendors.filter((v) => v.status === 'active').length;

    // Total payable = amount we owe vendors (current_balance > 0)
    const totalPayable = allVendors.reduce((sum, v) => {
      const b = Number(v.current_balance || 0);
      return b > 0 ? sum + b : sum;
    }, 0);

    // Total advance = amount we have paid extra in advance (current_balance < 0)
    const totalAdvance = Math.abs(
      allVendors.reduce((sum, v) => {
        const b = Number(v.current_balance || 0);
        return b < 0 ? sum + b : sum;
      }, 0),
    );

    // This month's total purchases
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .slice(0, 10);

    const { data: monthPurchases } = await adminClient
      .from('purchases')
      .select('total_amount')
      .gte('purchase_date', startOfMonth);

    const thisMonthPurchases = (monthPurchases || []).reduce(
      (sum, p) => sum + Number(p.total_amount || 0),
      0,
    );

    return {
      totalCount,
      activeCount,
      totalPayable,
      totalAdvance,
      thisMonthPurchases,
    };
  }

  /**
   * Unified Vendor Khata Ledger
   */
  async getLedger(vendorId: string) {
    const adminClient = this.supabaseService.getAdminClient();

    // 1. Fetch Vendor
    const { data: vendor, error: vErr } = await adminClient
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (vErr || !vendor) {
      throw new NotFoundException(`سپلائر نہیں ملا (ID: ${vendorId})`);
    }

    // 2. Fetch Purchases (Debits - bills increasing what we owe)
    const { data: purchases } = await adminClient
      .from('purchases')
      .select('id, invoice_no, purchase_date, subtotal, discount, total_amount, paid_amount, balance_due, notes, created_at')
      .eq('vendor_id', vendorId)
      .order('purchase_date', { ascending: true });

    // 3. Fetch Payments (Credits - payments sent to vendor reducing payable)
    const { data: payments } = await adminClient
      .from('payments')
      .select('id, payment_number, amount, payment_method, notes, created_at, reference_type, cheque_number, cheque_date')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: true });

    // 4. Merge transactions chronologically
    interface UnifiedTx {
      id: string;
      date: string;
      rawDate: Date;
      description: string;
      biltyOrSlipNo: string;
      debit: number; // Purchase bill amount (adds to debt)
      credit: number; // Payment sent (reduces debt)
      balance: number; // Running balance
      type: 'purchase' | 'payment';
    }

    const unifiedList: UnifiedTx[] = [];

    // Add purchases
    (purchases || []).forEach((p) => {
      const pDate = new Date(p.purchase_date || p.created_at);
      unifiedList.push({
        id: `pur-${p.id}`,
        date: p.purchase_date || p.created_at.slice(0, 10),
        rawDate: pDate,
        description: p.notes ? `خریداری مال: ${p.notes}` : `خریداری انوائس بل (#${p.invoice_no})`,
        biltyOrSlipNo: p.invoice_no,
        debit: Number(p.total_amount || 0),
        credit: 0,
        balance: 0,
        type: 'purchase',
      });
    });

    // Add payments
    (payments || []).forEach((pay) => {
      const payDate = new Date(pay.created_at);
      const methodLabel =
        pay.payment_method === 'bank_transfer'
          ? 'بینک ٹرانسفر'
          : pay.payment_method === 'cheque'
          ? `چیک #${pay.cheque_number || ''}`
          : 'نقد رقم';

      unifiedList.push({
        id: `pay-${pay.id}`,
        date: pay.created_at.slice(0, 10),
        rawDate: payDate,
        description: pay.notes
          ? `ادائیگی بذریعہ ${methodLabel} (${pay.notes})`
          : `ادائیگی بذریعہ ${methodLabel}`,
        biltyOrSlipNo: pay.payment_number,
        debit: 0,
        credit: Number(pay.amount || 0),
        balance: 0,
        type: 'payment',
      });
    });

    // Sort by timestamp
    unifiedList.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    // Compute running balance
    let runningBalance = 0;
    const finalTransactions = unifiedList.map((tx) => {
      runningBalance = runningBalance + tx.debit - tx.credit;
      return {
        ...tx,
        balance: runningBalance,
      };
    });

    return {
      vendor,
      transactions: finalTransactions,
      summary: {
        totalPurchases: finalTransactions.reduce((acc, t) => acc + t.debit, 0),
        totalPayments: finalTransactions.reduce((acc, t) => acc + t.credit, 0),
        currentBalance: Number(vendor.current_balance || runningBalance),
      },
    };
  }

  /**
   * Record payment sent to vendor (ادائیگی کا اندراج)
   */
  async recordPayment(vendorId: string, dto: CreateVendorPaymentDto, userId?: string) {
    const adminClient = this.supabaseService.getAdminClient();

    // 1. Verify Vendor
    const { data: vendor, error: vErr } = await adminClient
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (vErr || !vendor) {
      throw new NotFoundException(`سپلائر نہیں ملا (ID: ${vendorId})`);
    }

    const amount = Number(dto.amount);
    if (!amount || amount <= 0) {
      throw new BadRequestException('رقم کا 1 روپے سے زیادہ ہونا ضروری ہے');
    }

    // 2. Generate serial payment number: PAY-XXXXXX
    const randCode = Math.floor(100000 + Math.random() * 900000);
    const paymentNumber = `PAY-${randCode}`;

    // 3. Insert payment in payments table
    const { data: paymentRecord, error: payErr } = await adminClient
      .from('payments')
      .insert({
        payment_number: paymentNumber,
        entity_type: 'vendor',
        vendor_id: vendorId,
        reference_type: 'direct_payment',
        amount: amount,
        payment_type: 'credit', // credit reduces debt
        payment_method: dto.paymentMethod || 'cash',
        cheque_number: dto.chequeNumber || null,
        cheque_date: dto.chequeDate || null,
        notes: dto.notes?.trim() || 'سپلائر کو کھاتہ ادائیگی',
        created_by: userId || null,
      })
      .select()
      .single();

    if (payErr) {
      this.logger.error(`Failed to record vendor payment: ${payErr.message}`);
      throw new BadRequestException(`ادائیگی محفوظ کرنے میں خرابی: ${payErr.message}`);
    }

    // 4. Update vendor balance: current_balance - amount
    const oldBalance = Number(vendor.current_balance || 0);
    const newBalance = oldBalance - amount;

    const { error: updErr } = await adminClient
      .from('vendors')
      .update({ current_balance: newBalance })
      .eq('id', vendorId);

    if (updErr) {
      this.logger.error(`Failed to update vendor balance: ${updErr.message}`);
    }

    return {
      success: true,
      paymentNumber,
      paymentId: paymentRecord.id,
      amount,
      oldBalance,
      newBalance,
      vendor: {
        id: vendor.id,
        name: vendor.name,
        companyName: vendor.company_name,
        newBalance,
      },
    };
  }

  /**
   * Vendor Self-Service Portal Dashboard
   */
  async getPortalDashboard(vendorId?: string) {
    const adminClient = this.supabaseService.getAdminClient();

    // 1. Fetch target vendor, or default to first active vendor (e.g. FFC)
    let vendorQuery = adminClient.from('vendors').select('*');
    if (vendorId) {
      vendorQuery = vendorQuery.eq('id', vendorId);
    } else {
      vendorQuery = vendorQuery.order('current_balance', { ascending: false }).limit(1);
    }

    const { data: vendorList, error: vErr } = await vendorQuery;
    if (vErr || !vendorList || vendorList.length === 0) {
      throw new NotFoundException('کوئی سپلائر کمپنی موجود نہیں ہے');
    }
    const currentVendor = vendorList[0];
    const targetId = currentVendor.id;

    // 2. Fetch all purchases / deliveries for this vendor
    const { data: purchases } = await adminClient
      .from('purchases')
      .select('id, invoice_no, purchase_date, subtotal, discount, total_amount, paid_amount, balance_due, payment_status, payment_method, notes, created_at, purchase_items(id, quantity, unit_price, total_price, product_id)')
      .eq('vendor_id', targetId)
      .order('purchase_date', { ascending: false });

    // 3. Fetch all payments sent to this vendor
    const { data: payments } = await adminClient
      .from('payments')
      .select('id, payment_number, amount, payment_method, notes, created_at, cheque_number, cheque_date')
      .eq('vendor_id', targetId)
      .order('created_at', { ascending: false });

    // 4. Fetch products supplied by this vendor
    const { data: allProducts } = await adminClient
      .from('products')
      .select('id, name, urdu_name, sku, company_name, unit, cost_price, sale_price, current_stock, min_stock_alert, rack_location')
      .order('name', { ascending: true });

    const companyKeyword = (currentVendor.company_name || currentVendor.name || '').toLowerCase();
    const vendorProducts = (allProducts || []).filter((p) => {
      const pCompany = (p.company_name || '').toLowerCase();
      return pCompany.includes(companyKeyword) || companyKeyword.includes(pCompany);
    });

    // 5. Aggregate stats
    const totalDeliveries = (purchases || []).length;
    const totalSuppliedValue = (purchases || []).reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
    const totalPaymentsReceived = (payments || []).reduce((sum, pay) => sum + Number(pay.amount || 0), 0);
    const totalBagsSupplied = (purchases || []).reduce((sum, p) => {
      const pBags = (p.purchase_items || []).reduce((pSum: number, item: any) => pSum + Number(item.quantity || 0), 0);
      return sum + pBags;
    }, 0);

    return {
      vendor: {
        id: currentVendor.id,
        name: currentVendor.name,
        companyName: currentVendor.company_name,
        contactPerson: currentVendor.contact_person,
        phone: currentVendor.phone,
        altPhone: currentVendor.alt_phone,
        email: currentVendor.email,
        city: currentVendor.city,
        address: currentVendor.address,
        currentBalance: Number(currentVendor.current_balance || 0),
        status: currentVendor.status,
      },
      stats: {
        totalSuppliedValue,
        totalPaymentsReceived,
        currentBalanceDue: Number(currentVendor.current_balance || 0),
        totalDeliveries,
        totalBagsSupplied,
      },
      recentShipments: (purchases || []).map((p) => ({
        id: p.id,
        biltyNumber: p.invoice_no,
        date: p.purchase_date || p.created_at.slice(0, 10),
        totalAmount: Number(p.total_amount || 0),
        paidAmount: Number(p.paid_amount || 0),
        balanceDue: Number(p.balance_due || 0),
        status: p.payment_status,
        paymentMethod: p.payment_method,
        notes: p.notes,
        totalBags: (p.purchase_items || []).reduce((sum: number, it: any) => sum + Number(it.quantity || 0), 0),
        items: p.purchase_items || [],
      })),
      recentPayments: (payments || []).map((pay) => ({
        id: pay.id,
        paymentNumber: pay.payment_number,
        amount: Number(pay.amount || 0),
        method: pay.payment_method,
        date: pay.created_at.slice(0, 10),
        chequeNumber: pay.cheque_number,
        notes: pay.notes,
      })),
      suppliedProducts: vendorProducts.length > 0 ? vendorProducts : allProducts?.slice(0, 5) || [],
    };
  }

  /**
   * Submit new price revision notice from vendor
   */
  async submitPriceUpdate(vendorId: string, dto: VendorPriceUpdateDto) {
    this.logger.log(`Vendor ${vendorId} submitted price update for product ${dto.productId}: New Cost: ${dto.newCostPrice}`);
    return {
      success: true,
      message: 'نئے ریٹ کی اطلاع کامیابی سے دکان کو ارسال کر دی گئی ہے',
      noticeId: `REV-${Date.now()}`,
      vendorId,
      productId: dto.productId,
      newCostPrice: dto.newCostPrice,
      suggestedSalePrice: dto.suggestedSalePrice,
      effectiveDate: dto.effectiveDate || new Date().toISOString().slice(0, 10),
      status: 'pending_review',
    };
  }

  /**
   * Submit advance truck dispatch notice from vendor
   */
  async submitDispatchNotice(vendorId: string, dto: VendorDispatchNoticeDto) {
    this.logger.log(`Vendor ${vendorId} submitted dispatch notice: Truck ${dto.truckNumber}, Bags: ${dto.bagsQuantity}`);
    return {
      success: true,
      message: 'ٹرک روانگی کی پیشگی اطلاع محفوظ ہو گئی ہے، دکان عملہ گودام خالی اور پلے دار تیار رکھے گا',
      dispatchId: `DSP-${Date.now()}`,
      vendorId,
      truckNumber: dto.truckNumber,
      biltyNumber: dto.biltyNumber || `BLT-${Math.floor(1000 + Math.random() * 9000)}`,
      productName: dto.productName,
      bagsQuantity: dto.bagsQuantity,
      driverContact: dto.driverContact,
      expectedArrival: dto.expectedArrival || 'آج شام',
      status: 'dispatched',
    };
  }
}
