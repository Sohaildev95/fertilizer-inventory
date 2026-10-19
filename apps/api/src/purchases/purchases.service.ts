import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { CreatePurchaseDto } from './dto/create-purchase.dto.js';
import { QueryPurchasesDto } from './dto/query-purchases.dto.js';

@Injectable()
export class PurchasesService {
  private readonly logger = new Logger(PurchasesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Record a new Purchase (Stock-In from Vendor)
   */
  async create(dto: CreatePurchaseDto, userId?: string) {
    const adminClient = this.supabaseService.getAdminClient();

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('خریداری میں کم از کم ایک پراڈکٹ کا ہونا ضروری ہے');
    }

    // 1. Verify Vendor exists
    const { data: vendor, error: vErr } = await adminClient
      .from('vendors')
      .select('*')
      .eq('id', dto.vendorId)
      .single();

    if (vErr || !vendor) {
      throw new BadRequestException('منتخب کردہ کمپنی یا سپلائر نہیں ملا');
    }

    // 2. Fetch products to verify existence & current stock
    const productIds = dto.items.map((i) => i.productId);
    const { data: dbProducts, error: prodErr } = await adminClient
      .from('products')
      .select('id, name, urdu_name, current_stock, cost_price, sale_price, unit, company_name')
      .in('id', productIds);

    if (prodErr || !dbProducts) {
      throw new BadRequestException(`پراڈکٹس لوڈ کرنے میں خرابی: ${prodErr?.message}`);
    }

    const productMap = new Map<string, any>();
    dbProducts.forEach((p) => productMap.set(p.id, p));

    // 3. Calculate line items, total amount
    let subtotal = 0;
    const purchaseItemsPayload: any[] = [];
    const stockUpdates: { id: string; prevStock: number; newStock: number; qty: number; name: string }[] = [];

    for (const item of dto.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(`پراڈکٹ نہیں ملی (ID: ${item.productId})`);
      }

      const qty = Number(item.quantity);
      const rate = Number(item.unitPrice);
      const itemTotal = qty * rate;

      subtotal += itemTotal;

      purchaseItemsPayload.push({
        product_id: item.productId,
        quantity: qty,
        unit_price: rate,
        total_price: itemTotal,
        batch_number: item.batchNumber || null,
        expiry_date: item.expiryDate || null,
      });

      const currentStock = Number(product.current_stock || 0);
      const newStock = currentStock + qty;

      stockUpdates.push({
        id: product.id,
        prevStock: currentStock,
        newStock: newStock,
        qty: qty,
        name: product.name,
      });
    }

    const discount = Number(dto.discount || 0);
    const totalAmount = Math.max(0, subtotal - discount);
    const paidAmount = Math.max(0, Number(dto.paidAmount || 0));
    const balanceDue = Math.max(0, totalAmount - paidAmount);

    let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    if (balanceDue <= 0) {
      paymentStatus = 'paid';
    } else if (paidAmount > 0 && balanceDue > 0) {
      paymentStatus = 'partial';
    } else {
      paymentStatus = 'unpaid';
    }

    // 4. Generate invoice number if not provided: e.g. PUR-20261019-4821
    let invoiceNo = dto.invoiceNo?.trim();
    if (!invoiceNo) {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randPart = Math.floor(1000 + Math.random() * 9000);
      invoiceNo = `PUR-${dateStr}-${randPart}`;
    }

    // Combine notes with vehicle and bilty details
    const notesParts: string[] = [];
    if (dto.vehicleNo?.trim()) notesParts.push(`گاڑی: ${dto.vehicleNo.trim()}`);
    if (dto.biltyNo?.trim()) notesParts.push(`بلٹی: ${dto.biltyNo.trim()}`);
    if (dto.notes?.trim()) notesParts.push(dto.notes.trim());
    const finalNotes = notesParts.join(' • ') || null;

    // 5. Insert Purchase Record
    const purchaseDate = dto.purchaseDate || new Date().toISOString().slice(0, 10);
    const { data: purchase, error: purErr } = await adminClient
      .from('purchases')
      .insert({
        invoice_no: invoiceNo,
        vendor_id: dto.vendorId,
        purchase_date: purchaseDate,
        subtotal: subtotal,
        discount: discount,
        total_amount: totalAmount,
        paid_amount: paidAmount,
        balance_due: balanceDue,
        payment_status: paymentStatus,
        payment_method: dto.paymentMethod || 'cash',
        notes: finalNotes,
        created_by: userId || null,
      })
      .select()
      .single();

    if (purErr || !purchase) {
      this.logger.error(`Failed to create purchase: ${purErr?.message}`);
      throw new BadRequestException(`خریداری بل محفوظ کرنے میں خرابی: ${purErr?.message}`);
    }

    // 6. Insert Purchase Items
    const itemsToInsert = purchaseItemsPayload.map((item) => ({
      ...item,
      purchase_id: purchase.id,
    }));

    const { error: itemsErr } = await adminClient
      .from('purchase_items')
      .insert(itemsToInsert);

    if (itemsErr) {
      this.logger.error(`Failed to insert purchase items: ${itemsErr.message}`);
    }

    // 7. Atomic Stock Increment & Stock Movement Log
    for (const update of stockUpdates) {
      const { error: stErr } = await adminClient
        .from('products')
        .update({
          current_stock: update.newStock,
          cost_price: purchaseItemsPayload.find((i) => i.product_id === update.id)?.unit_price || undefined,
        })
        .eq('id', update.id);

      if (stErr) {
        this.logger.error(`Failed to increment stock for product ${update.id}: ${stErr.message}`);
      }

      await adminClient.from('stock_movements').insert({
        product_id: update.id,
        movement_type: 'purchase',
        quantity: update.qty,
        previous_stock: update.prevStock,
        new_stock: update.newStock,
        reference_id: purchase.id,
        reason: `خریداری مال انوائس #${invoiceNo} (${vendor.name})`,
        created_by: userId || null,
      });
    }

    // 8. Update Vendor Current Balance (Amount we owe increases by balanceDue)
    const oldVendorBalance = Number(vendor.current_balance || 0);
    const newVendorBalance = oldVendorBalance + balanceDue;

    if (balanceDue > 0) {
      const { error: vUpdErr } = await adminClient
        .from('vendors')
        .update({ current_balance: newVendorBalance })
        .eq('id', vendor.id);

      if (vUpdErr) {
        this.logger.error(`Failed to update vendor balance: ${vUpdErr.message}`);
      }
    }

    // 9. If paid amount > 0, record in payments table
    if (paidAmount > 0) {
      const randCode = Math.floor(100000 + Math.random() * 900000);
      const paymentNumber = `PAY-${randCode}`;

      await adminClient.from('payments').insert({
        payment_number: paymentNumber,
        entity_type: 'vendor',
        vendor_id: vendor.id,
        reference_type: 'purchase',
        reference_id: purchase.id,
        amount: paidAmount,
        payment_type: 'credit', // payment sent to vendor
        payment_method: dto.paymentMethod || 'cash',
        notes: `خریداری انوائس #${invoiceNo} کی پیشگی یا نقد ادائیگی`,
        created_by: userId || null,
      });
    }

    return {
      success: true,
      purchase: {
        ...purchase,
        items: itemsToInsert,
      },
      vendor: {
        id: vendor.id,
        name: vendor.name,
        companyName: vendor.company_name,
        oldBalance: oldVendorBalance,
        newBalance: newVendorBalance,
      },
      stockUpdates,
    };
  }

  /**
   * List purchases with filters & pagination
   */
  async findAll(query: QueryPurchasesDto) {
    const adminClient = this.supabaseService.getAdminClient();
    const page = query.page || 1;
    const limit = query.limit || 50;
    const offset = (page - 1) * limit;

    let supabaseQuery = adminClient
      .from('purchases')
      .select('*, vendors(id, name, company_name, city, phone), purchase_items(*, products(name, urdu_name, unit))', {
        count: 'exact',
      });

    if (query.vendorId) {
      supabaseQuery = supabaseQuery.eq('vendor_id', query.vendorId);
    }

    if (query.startDate) {
      supabaseQuery = supabaseQuery.gte('purchase_date', query.startDate);
    }

    if (query.endDate) {
      supabaseQuery = supabaseQuery.lte('purchase_date', query.endDate);
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      supabaseQuery = supabaseQuery.or(`invoice_no.ilike.%${q}%,notes.ilike.%${q}%`);
    }

    supabaseQuery = supabaseQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await supabaseQuery;

    if (error) {
      this.logger.error(`Failed to fetch purchases: ${error.message}`);
      throw new BadRequestException(`خریداری لسٹ لانے میں مسئلہ پیش آیا: ${error.message}`);
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
   * Find single purchase with items & vendor details
   */
  async findOne(id: string) {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = await adminClient
      .from('purchases')
      .select('*, vendors(*), purchase_items(*, products(*))')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`خریداری انوائس نہیں ملی (ID: ${id})`);
    }

    return data;
  }

  /**
   * Purchase summary KPIs
   */
  async getSummaryStats() {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: purchases, error } = await adminClient
      .from('purchases')
      .select('total_amount, paid_amount, balance_due, purchase_date');

    if (error) {
      this.logger.error(`Failed to get purchase stats: ${error.message}`);
      throw new BadRequestException(`خریداری سٹیٹس لانے میں مسئلہ: ${error.message}`);
    }

    const allPurchases = purchases || [];
    const totalCount = allPurchases.length;
    const totalPurchased = allPurchases.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
    const totalPaid = allPurchases.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0);
    const totalBalanceDue = allPurchases.reduce((sum, p) => sum + Number(p.balance_due || 0), 0);

    // Today's purchases
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayPurchases = allPurchases.filter((p) => p.purchase_date === todayStr);
    const todayPurchasedAmount = todayPurchases.reduce(
      (sum, p) => sum + Number(p.total_amount || 0),
      0,
    );

    return {
      totalCount,
      totalPurchased,
      totalPaid,
      totalBalanceDue,
      todayPurchasedAmount,
    };
  }
}
