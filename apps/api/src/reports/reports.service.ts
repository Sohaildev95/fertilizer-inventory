import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { QueryReportsDto } from './dto/query-reports.dto.js';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Helper to resolve start & end date strings based on timeRange
   */
  private resolveDateRange(query: QueryReportsDto): {
    startDate: string;
    endDate: string;
    labelUrdu: string;
    labelEn: string;
  } {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (query.timeRange === 'today') {
      return {
        startDate: todayStr,
        endDate: todayStr,
        labelUrdu: 'صرف آج کا دن',
        labelEn: 'Today',
      };
    }

    if (query.timeRange === 'this_week') {
      const d = new Date(today);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
      d.setDate(diff);
      const startOfWeek = d.toISOString().slice(0, 10);
      return {
        startDate: startOfWeek,
        endDate: todayStr,
        labelUrdu: 'موجودہ ہفتہ',
        labelEn: 'This Week',
      };
    }

    if (query.timeRange === 'season') {
      // Rabi season typically runs Sept-March in Pakistan
      const startOfSeason = `${todayStr.slice(0, 4)}-09-01`;
      return {
        startDate: startOfSeason,
        endDate: todayStr,
        labelUrdu: 'سیزن ربیع ۲۰۲۶',
        labelEn: 'Rabi Season 2026',
      };
    }

    if (query.timeRange === 'custom' && query.startDate && query.endDate) {
      return {
        startDate: query.startDate,
        endDate: query.endDate,
        labelUrdu: `${query.startDate} تا ${query.endDate}`,
        labelEn: `${query.startDate} to ${query.endDate}`,
      };
    }

    // Default: 'this_month'
    const startOfMonth = `${todayStr.slice(0, 7)}-01`;
    return {
      startDate: startOfMonth,
      endDate: todayStr,
      labelUrdu: 'موجودہ ماہ',
      labelEn: 'This Month',
    };
  }

  /**
   * 1. Profit & Loss Statement (نفع و نقصان رپورٹ)
   */
  async getProfitAndLoss(query: QueryReportsDto) {
    const adminClient = this.supabaseService.getAdminClient();
    const { startDate, endDate, labelUrdu, labelEn } =
      this.resolveDateRange(query);

    // 1. Fetch sales within date range with line items and product details
    const { data: salesData, error: salesError } = await adminClient
      .from('sales')
      .select(
        `
        id,
        invoice_no,
        sale_date,
        total_amount,
        subtotal,
        discount,
        paid_amount,
        balance_due,
        customer_type,
        sale_items (
          id,
          product_id,
          quantity,
          unit_price,
          cost_price,
          total_price,
          profit,
          products (
            id,
            name,
            urdu_name,
            company_name,
            unit
          )
        )
      `,
      )
      .gte('sale_date', startDate)
      .lte('sale_date', endDate);

    if (salesError) {
      this.logger.error(`Failed to fetch sales for P&L: ${salesError.message}`);
      throw new BadRequestException(
        `سیلز رپورٹ لانے میں مسئلہ: ${salesError.message}`,
      );
    }

    // 2. Fetch expenses within date range
    const { data: expensesData, error: expError } = await adminClient
      .from('expenses')
      .select('*')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate);

    if (expError) {
      this.logger.error(`Failed to fetch expenses: ${expError.message}`);
      throw new BadRequestException(
        `اخراجات لانے میں مسئلہ: ${expError.message}`,
      );
    }

    const sales = salesData || [];
    const expenses = expensesData || [];

    // Financial calculations
    let totalRevenue = 0;
    let totalCOGS = 0; // Cost of Goods Sold
    let totalGrossProfit = 0;
    let totalBagsSold = 0;

    // Product-wise aggregation
    const productAggregation: Record<
      string,
      {
        id: string;
        name: string;
        urduName: string;
        company: string;
        unit: string;
        bagsSold: number;
        saleAmount: number;
        costAmount: number;
        profit: number;
      }
    > = {};

    for (const sale of sales) {
      totalRevenue += Number(sale.total_amount || 0);

      const items = (sale.sale_items as any[]) || [];
      for (const item of items) {
        const qty = Number(item.quantity || 0);
        const saleAmt = Number(item.total_price || 0);
        const costAmt = Number(item.cost_price || 0) * qty;
        const profit = Number(item.profit || saleAmt - costAmt);

        totalCOGS += costAmt;
        totalGrossProfit += profit;
        totalBagsSold += qty;

        const prodId = item.product_id;
        const prod = item.products || {};

        if (!productAggregation[prodId]) {
          productAggregation[prodId] = {
            id: prodId,
            name: prod.name || 'نامعلوم کھاد',
            urduName: prod.urdu_name || prod.name || 'کھاد',
            company: prod.company_name || 'لوکل ڈیلر',
            unit: prod.unit || 'بوری',
            bagsSold: 0,
            saleAmount: 0,
            costAmount: 0,
            profit: 0,
          };
        }

        productAggregation[prodId].bagsSold += qty;
        productAggregation[prodId].saleAmount += saleAmt;
        productAggregation[prodId].costAmount += costAmt;
        productAggregation[prodId].profit += profit;
      }
    }

    // Format product breakdown with margin %
    const productBreakdown = Object.values(productAggregation)
      .map((p) => ({
        ...p,
        marginPercent:
          p.saleAmount > 0
            ? ((p.profit / p.saleAmount) * 100).toFixed(1) + '%'
            : '0%',
      }))
      .sort((a, b) => b.profit - a.profit);

    // Total Operating Expenses
    const totalOperatingExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0,
    );

    // Net Profit after Operating Expenses
    const netProfit = totalGrossProfit - totalOperatingExpenses;
    const grossMarginPercent =
      totalRevenue > 0
        ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) + '%'
        : '0%';
    const netProfitMarginPercent =
      totalRevenue > 0
        ? ((netProfit / totalRevenue) * 100).toFixed(1) + '%'
        : '0%';

    return {
      period: {
        timeRange: query.timeRange || 'this_month',
        startDate,
        endDate,
        labelUrdu,
        labelEn,
      },
      summary: {
        totalRevenue,
        totalCOGS,
        totalGrossProfit,
        grossMarginPercent,
        totalOperatingExpenses,
        netProfit,
        netProfitMarginPercent,
        totalBagsSold,
        totalInvoices: sales.length,
      },
      productBreakdown,
    };
  }

  /**
   * 2. Daily Roznamcha (روزنامچہ کیش بک — Daily Cash Book)
   */
  async getRoznamcha(targetDateQuery?: string) {
    const adminClient = this.supabaseService.getAdminClient();
    const date = targetDateQuery || new Date().toISOString().slice(0, 10);

    // 1. Fetch cash sales of the day
    const { data: cashSales, error: salesErr } = await adminClient
      .from('sales')
      .select('id, invoice_no, walk_in_name, customer_id, paid_amount, created_at, payment_method, customers(name)')
      .eq('sale_date', date)
      .eq('payment_method', 'cash')
      .gt('paid_amount', 0);

    if (salesErr) {
      this.logger.error(`Roznamcha sales error: ${salesErr.message}`);
    }

    // 2. Fetch customer cash recovery payments
    const { data: customerRecoveries, error: recErr } = await adminClient
      .from('payments')
      .select('id, payment_number, amount, created_at, notes, payment_method, customer_id, customers(name)')
      .eq('entity_type', 'customer')
      .eq('payment_type', 'credit')
      .eq('payment_method', 'cash')
      .gte('created_at', `${date}T00:00:00.000Z`)
      .lte('created_at', `${date}T23:59:59.999Z`);

    if (recErr) {
      this.logger.error(`Roznamcha recovery error: ${recErr.message}`);
    }

    // 3. Fetch vendor cash payments
    const { data: vendorPayments, error: vendErr } = await adminClient
      .from('payments')
      .select('id, payment_number, amount, created_at, notes, payment_method, vendor_id, vendors(name)')
      .eq('entity_type', 'vendor')
      .eq('payment_method', 'cash')
      .gte('created_at', `${date}T00:00:00.000Z`)
      .lte('created_at', `${date}T23:59:59.999Z`);

    if (vendErr) {
      this.logger.error(`Roznamcha vendor payment error: ${vendErr.message}`);
    }

    // 4. Fetch daily cash expenses
    const { data: cashExpenses, error: expErr } = await adminClient
      .from('expenses')
      .select('*')
      .eq('expense_date', date)
      .eq('payment_method', 'cash');

    if (expErr) {
      this.logger.error(`Roznamcha expenses error: ${expErr.message}`);
    }

    // Build unified chronological transactions list
    const transactions: Array<{
      id: string;
      time: string;
      type: 'in' | 'out';
      categoryUrdu: string;
      categoryEn: string;
      description: string;
      partyName: string;
      amount: number;
      refNumber: string;
    }> = [];

    let totalCashIn = 0;
    let totalCashOut = 0;

    // Add cash sales
    for (const s of cashSales || []) {
      const amt = Number(s.paid_amount || 0);
      totalCashIn += amt;
      const party = (s.customers as any)?.name || s.walk_in_name || 'کاؤنٹر نقد کسان';
      const time = s.created_at ? new Date(s.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '12:00 PM';
      transactions.push({
        id: s.id,
        time,
        type: 'in',
        categoryUrdu: 'کاؤنٹر نقد سیل',
        categoryEn: 'Counter Cash Sale',
        description: `انوائس نمبر ${s.invoice_no}`,
        partyName: party,
        amount: amt,
        refNumber: s.invoice_no,
      });
    }

    // Add farmer recoveries
    for (const r of customerRecoveries || []) {
      const amt = Number(r.amount || 0);
      totalCashIn += amt;
      const party = (r.customers as any)?.name || 'رجسٹرڈ کسان';
      const time = r.created_at ? new Date(r.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '12:00 PM';
      transactions.push({
        id: r.id,
        time,
        type: 'in',
        categoryUrdu: 'کھاتہ سابقہ وصولی',
        categoryEn: 'Khata Recovery',
        description: r.notes || 'سابقہ ادھار کی نقد وصولی',
        partyName: party,
        amount: amt,
        refNumber: r.payment_number,
      });
    }

    // Add vendor cash payments
    for (const v of vendorPayments || []) {
      const amt = Number(v.amount || 0);
      totalCashOut += amt;
      const party = (v.vendors as any)?.name || 'کھاد کمپنی سپلائر';
      const time = v.created_at ? new Date(v.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '12:00 PM';
      transactions.push({
        id: v.id,
        time,
        type: 'out',
        categoryUrdu: 'سپلائر نقد ادائیگی',
        categoryEn: 'Vendor Cash Payment',
        description: v.notes || 'کمپنی بل کی ادائیگی',
        partyName: party,
        amount: amt,
        refNumber: v.payment_number,
      });
    }

    // Add cash expenses
    for (const e of cashExpenses || []) {
      const amt = Number(e.amount || 0);
      totalCashOut += amt;
      const time = e.created_at ? new Date(e.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '12:00 PM';
      transactions.push({
        id: e.id,
        time,
        type: 'out',
        categoryUrdu: 'دکان و گودام خرچہ',
        categoryEn: 'Shop Expense',
        description: e.title,
        partyName: e.category || 'متفرق خرچ',
        amount: amt,
        refNumber: `EXP-${e.id.slice(0, 6).toUpperCase()}`,
      });
    }

    // Sort transactions chronologically
    transactions.sort((a, b) => a.time.localeCompare(b.time));

    const netCashInHand = totalCashIn - totalCashOut;

    return {
      date,
      summary: {
        totalCashIn,
        totalCashOut,
        netCashInHand,
        inflowTransactionsCount: (cashSales?.length || 0) + (customerRecoveries?.length || 0),
        outflowTransactionsCount: (vendorPayments?.length || 0) + (cashExpenses?.length || 0),
      },
      inflows: {
        salesCash: (cashSales || []).reduce((sum, s) => sum + Number(s.paid_amount || 0), 0),
        recoveriesCash: (customerRecoveries || []).reduce((sum, r) => sum + Number(r.amount || 0), 0),
      },
      outflows: {
        vendorCash: (vendorPayments || []).reduce((sum, v) => sum + Number(v.amount || 0), 0),
        expensesCash: (cashExpenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0),
      },
      transactions,
    };
  }

  /**
   * 3. Godown Stock Valuation (اسٹاک مالیت رپورٹ)
   */
  async getStockValuation() {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: products, error } = await adminClient
      .from('products')
      .select('id, name, urdu_name, company_name, cost_price, sale_price, current_stock, min_stock_alert, unit')
      .order('current_stock', { ascending: false });

    if (error) {
      this.logger.error(`Stock valuation error: ${error.message}`);
      throw new BadRequestException(`اسٹاک رپورٹ لانے میں مسئلہ: ${error.message}`);
    }

    let totalBags = 0;
    let totalCostValuation = 0;
    let totalSaleValuation = 0;
    let lowStockCount = 0;

    const items = (products || []).map((p) => {
      const stock = Number(p.current_stock || 0);
      const cost = Number(p.cost_price || 0);
      const sale = Number(p.sale_price || 0);
      const costVal = stock * cost;
      const saleVal = stock * sale;
      const potentialProfit = saleVal - costVal;

      totalBags += stock;
      totalCostValuation += costVal;
      totalSaleValuation += saleVal;

      if (stock <= Number(p.min_stock_alert || 10)) {
        lowStockCount++;
      }

      return {
        id: p.id,
        name: p.name,
        urduName: p.urdu_name || p.name,
        company: p.company_name,
        currentStock: stock,
        unit: p.unit || 'بوری',
        costPrice: cost,
        salePrice: sale,
        costValuation: costVal,
        saleValuation: saleVal,
        potentialProfit,
        isLowStock: stock <= Number(p.min_stock_alert || 10),
      };
    });

    const potentialTotalProfit = totalSaleValuation - totalCostValuation;

    return {
      summary: {
        totalBags,
        totalCostValuation,
        totalSaleValuation,
        potentialTotalProfit,
        lowStockCount,
        productsCount: items.length,
      },
      items,
    };
  }

  /**
   * 4. Market Udhaar & Recovery Overview (مارکیٹ ادھار رپورٹ)
   */
  async getMarketUdhar() {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: customers, error } = await adminClient
      .from('customers')
      .select('id, name, phone, village, current_balance, credit_limit')
      .gt('current_balance', 0)
      .order('current_balance', { ascending: false });

    if (error) {
      this.logger.error(`Market udhar error: ${error.message}`);
      throw new BadRequestException(`ادھار رپورٹ لانے میں مسئلہ: ${error.message}`);
    }

    const totalUdhar = (customers || []).reduce(
      (sum, c) => sum + Number(c.current_balance || 0),
      0,
    );

    // Fetch top 5 recent recoveries
    const { data: recentRecoveries } = await adminClient
      .from('payments')
      .select('id, amount, created_at, payment_method, notes, customers(name, village)')
      .eq('entity_type', 'customer')
      .eq('payment_type', 'credit')
      .order('created_at', { ascending: false })
      .limit(6);

    const recoveriesFormatted = (recentRecoveries || []).map((r: any) => ({
      id: r.id,
      farmer: r.customers?.name || 'رجسٹرڈ زمیندار',
      chak: r.customers?.village || 'منڈی',
      amount: Number(r.amount || 0),
      method: r.payment_method === 'cash' ? 'کاؤنٹر نقد' : 'بینک آن لائن',
      date: r.created_at ? r.created_at.slice(0, 10) : '',
    }));

    return {
      summary: {
        totalUdhar,
        debtorsCount: (customers || []).length,
      },
      topDebtors: customers || [],
      recentRecoveries: recoveriesFormatted,
    };
  }
}
