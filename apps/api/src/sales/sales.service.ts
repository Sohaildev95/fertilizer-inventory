import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { CreateSaleDto } from './dto/create-sale.dto.js';
import { QuerySalesDto } from './dto/query-sales.dto.js';

@Injectable()
export class SalesService {
  private readonly logger = new Logger(SalesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Process a new POS Counter Sale
   */
  async create(dto: CreateSaleDto, userId?: string) {
    const adminClient = this.supabaseService.getAdminClient();

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('کارٹ میں کم از کم ایک پروڈکٹ کا ہونا ضروری ہے (Cart cannot be empty)');
    }

    // 1. Fetch products from DB to get verified cost prices and current stock
    const productIds = dto.items.map((i) => i.productId);
    const { data: dbProducts, error: prodErr } = await adminClient
      .from('products')
      .select('id, name, urdu_name, cost_price, sale_price, current_stock, unit, company_name')
      .in('id', productIds);

    if (prodErr || !dbProducts) {
      throw new BadRequestException(`پروڈکٹس لوڈ کرنے میں خرابی: ${prodErr?.message}`);
    }

    const productMap = new Map<string, any>();
    dbProducts.forEach((p) => productMap.set(p.id, p));

    // 2. Calculate line items, total amount and profit
    let subtotal = 0;
    const saleItemsPayload: any[] = [];
    const stockUpdates: { id: string; prevStock: number; newStock: number; qty: number; name: string }[] = [];

    for (const item of dto.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(`پروڈکٹ نہیں ملی (ID: ${item.productId})`);
      }

      const itemTotal = Number(item.quantity) * Number(item.unitPrice);
      const costPrice = Number(product.cost_price || 0);
      const profit = (Number(item.unitPrice) - costPrice) * Number(item.quantity);

      subtotal += itemTotal;

      saleItemsPayload.push({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        cost_price: costPrice,
        total_price: itemTotal,
        profit: profit,
      });

      const currentStock = Number(product.current_stock || 0);
      const newStock = Math.max(0, currentStock - Number(item.quantity));

      stockUpdates.push({
        id: product.id,
        prevStock: currentStock,
        newStock: newStock,
        qty: Number(item.quantity),
        name: product.name,
      });
    }

    const discount = Number(dto.discount || 0);
    const totalAmount = Math.max(0, subtotal - discount);
    const paidAmount = Math.max(0, Number(dto.paidAmount || 0));
    const balanceDue = Math.max(0, totalAmount - paidAmount);

    let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'paid';
    if (balanceDue <= 0) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0 && balanceDue > 0) {
      paymentStatus = 'partial';
    } else {
      paymentStatus = 'unpaid';
    }

    // 3. Generate serial invoice number: e.g. INV-20261016-8492
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randPart = Math.floor(1000 + Math.random() * 9000);
    const invoiceNo = `INV-${dateStr}-${randPart}`;

    // 4. Fetch customer details if registered
    let customer: any = null;
    let oldCustomerBalance = 0;
    let newCustomerBalance = 0;

    if (dto.customerType === 'registered' && dto.customerId) {
      const { data: custData, error: custErr } = await adminClient
        .from('customers')
        .select('*')
        .eq('id', dto.customerId)
        .single();

      if (custErr || !custData) {
        throw new BadRequestException('منتخب کردہ کھاتے دار کسان کا ریکارڈ نہیں ملا');
      }

      customer = custData;
      oldCustomerBalance = Number(customer.current_balance || 0);
      newCustomerBalance = oldCustomerBalance + balanceDue;
    }

    // 5. Insert Sale record
    const { data: sale, error: saleErr } = await adminClient
      .from('sales')
      .insert({
        invoice_no: invoiceNo,
        customer_id: dto.customerType === 'registered' ? dto.customerId : null,
        customer_type: dto.customerType,
        walk_in_name:
          dto.customerType === 'walk_in'
            ? dto.walkInName || 'عام نقد کسان (Walk-in Cash)'
            : null,
        sale_date: dto.saleDate || now.toISOString().slice(0, 10),
        subtotal: subtotal,
        discount: discount,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        balance_due: balanceDue,
        payment_status: paymentStatus,
        payment_method: dto.paymentMethod,
        notes: dto.notes?.trim() || null,
        created_by: userId || null,
      })
      .select('*')
      .single();

    if (saleErr || !sale) {
      this.logger.error(`Failed to insert sale: ${saleErr?.message}`);
      throw new BadRequestException(`بل بنانے میں خرابی پیش آگئی: ${saleErr?.message}`);
    }

    // 6. Insert Sale Items
    const itemsToInsert = saleItemsPayload.map((item) => ({
      ...item,
      sale_id: sale.id,
    }));

    const { error: itemsErr } = await adminClient
      .from('sale_items')
      .insert(itemsToInsert);

    if (itemsErr) {
      this.logger.error(`Failed to insert sale items: ${itemsErr.message}`);
    }

    // 7. Update Stock for each product & log stock movement
    for (const update of stockUpdates) {
      await adminClient
        .from('products')
        .update({ current_stock: update.newStock })
        .eq('id', update.id);

      await adminClient.from('stock_movements').insert({
        product_id: update.id,
        movement_type: 'sale',
        quantity: -update.qty,
        previous_stock: update.prevStock,
        new_stock: update.newStock,
        reference_id: sale.id,
        reason: `POS Sale Invoice #${invoiceNo} (${update.qty} بوری فروخت)`,
        created_by: userId || null,
      });
    }

    // 8. If registered customer, update customer balance & create payment receipt
    if (dto.customerType === 'registered' && dto.customerId) {
      if (balanceDue > 0) {
        await adminClient
          .from('customers')
          .update({ current_balance: newCustomerBalance })
          .eq('id', dto.customerId);
      }

      // If counter cash was received, record credit payment
      if (paidAmount > 0) {
        await adminClient.from('payments').insert({
          payment_number: `REC-${Date.now().toString().slice(-6)}`,
          entity_type: 'customer',
          customer_id: dto.customerId,
          reference_type: 'sale',
          reference_id: sale.id,
          amount: paidAmount,
          payment_type: 'credit',
          payment_method: dto.paymentMethod,
          notes: `POS Bill #${invoiceNo} کی نقد وصولی`,
          created_by: userId || null,
        });
      }
    }

    // 9. Prepare populated invoice response for Thermal Print & POS State
    const populatedItems = saleItemsPayload.map((item) => {
      const prod = productMap.get(item.product_id);
      return {
        ...item,
        productName: prod?.name || 'Product',
        productUrduName: prod?.urdu_name || prod?.name || '',
        company: prod?.company_name || '',
        unit: prod?.unit || 'bag_50kg',
      };
    });

    return {
      success: true,
      sale: {
        ...sale,
        items: populatedItems,
        customer: customer
          ? {
              ...customer,
              oldBalance: oldCustomerBalance,
              newBalance: newCustomerBalance,
            }
          : {
              name: dto.walkInName || 'عام نقد کسان (Walk-in Cash)',
              isWalkIn: true,
              oldBalance: 0,
              newBalance: 0,
            },
      },
    };
  }

  /**
   * List sales with date filters, search and pagination
   */
  async findAll(query: QuerySalesDto) {
    const adminClient = this.supabaseService.getAdminClient();
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let supabaseQuery = adminClient
      .from('sales')
      .select('*, customer:customers(id, name, phone, village), items:sale_items(*, product:products(id, name, urdu_name, unit))', {
        count: 'exact',
      });

    if (query.customerId) {
      supabaseQuery = supabaseQuery.eq('customer_id', query.customerId);
    }

    if (query.paymentStatus) {
      supabaseQuery = supabaseQuery.eq('payment_status', query.paymentStatus);
    }

    if (query.startDate) {
      supabaseQuery = supabaseQuery.gte('sale_date', query.startDate);
    }

    if (query.endDate) {
      supabaseQuery = supabaseQuery.lte('sale_date', query.endDate);
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      supabaseQuery = supabaseQuery.or(`invoice_no.ilike.%${q}%,walk_in_name.ilike.%${q}%,notes.ilike.%${q}%`);
    }

    supabaseQuery = supabaseQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await supabaseQuery;

    if (error) {
      this.logger.error(`Failed to fetch sales: ${error.message}`);
      throw new BadRequestException(`بلوں کی لسٹ لانے میں خرابی: ${error.message}`);
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
   * Get single sale by ID with all item details
   */
  async findOne(id: string) {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: sale, error } = await adminClient
      .from('sales')
      .select('*, customer:customers(*), items:sale_items(*, product:products(*))')
      .eq('id', id)
      .single();

    if (error || !sale) {
      throw new NotFoundException(`سیل ریکارڈ نہیں ملا (ID: ${id})`);
    }

    return sale;
  }

  /**
   * Get today's POS Counter Statistics
   */
  async getTodayStats() {
    const adminClient = this.supabaseService.getAdminClient();
    const today = new Date().toISOString().slice(0, 10);

    const { data: sales, error } = await adminClient
      .from('sales')
      .select('total_amount, paid_amount, balance_due, payment_status, items:sale_items(quantity)')
      .eq('sale_date', today);

    if (error) {
      return {
        totalSalesCount: 0,
        totalRevenue: 0,
        cashCollected: 0,
        creditExtended: 0,
        bagsSold: 0,
      };
    }

    let totalRevenue = 0;
    let cashCollected = 0;
    let creditExtended = 0;
    let bagsSold = 0;

    (sales || []).forEach((s: any) => {
      totalRevenue += Number(s.total_amount || 0);
      cashCollected += Number(s.paid_amount || 0);
      creditExtended += Number(s.balance_due || 0);
      if (s.items && Array.isArray(s.items)) {
        s.items.forEach((item: any) => {
          bagsSold += Number(item.quantity || 0);
        });
      }
    });

    return {
      totalSalesCount: sales?.length || 0,
      totalRevenue,
      cashCollected,
      creditExtended,
      bagsSold,
    };
  }
}
