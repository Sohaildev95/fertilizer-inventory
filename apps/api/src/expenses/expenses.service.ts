import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';
import { QueryExpensesDto } from './dto/query-expenses.dto.js';

export const EXPENSE_CATEGORIES_MAP: Record<
  string,
  { urdu: string; en: string }
> = {
  palledari: { urdu: 'پلے داری و لوڈنگ', en: 'Labour & Palledari' },
  transport: { urdu: 'لوکل ٹرانسپورٹ کرایہ', en: 'Local Freight / Carriage' },
  refreshment: { urdu: 'چائے، کھانا و مہمان', en: 'Tea & Refreshment' },
  rent: { urdu: 'دکان و گودام کرایہ', en: 'Shop & Godown Rent' },
  utilities: { urdu: 'بجلی و یوٹیلیٹیز', en: 'Electricity & Internet' },
  salary: { urdu: 'ملازمین تنخواہ و پیشگی', en: 'Staff Salary & Advance' },
  fuel: { urdu: 'پیٹرول و بائیک خرچ', en: 'Fuel & Travel' },
  misc: { urdu: 'متفرق و مرمت', en: 'Misc & Maintenance' },
  general: { urdu: 'عمومی دکان خرچہ', en: 'General Operating Expense' },
};

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Helper to format an expense row with voucher number and category meta
   */
  private formatExpense(row: any) {
    const cat = row.category?.toLowerCase() || 'general';
    const catMeta = EXPENSE_CATEGORIES_MAP[cat] || {
      urdu: 'متفرق خرچہ',
      en: 'Misc Expense',
    };

    // Extract paidBy if stored in notes format: "[Paid By: Name] Rest of notes"
    let paidBy = 'کاؤنٹر کیش';
    let cleanNotes = row.notes || '';
    if (cleanNotes && cleanNotes.startsWith('[Paid By:')) {
      const closingIdx = cleanNotes.indexOf(']');
      if (closingIdx !== -1) {
        paidBy = cleanNotes.substring(9, closingIdx).trim();
        cleanNotes = cleanNotes.substring(closingIdx + 1).trim();
      }
    }

    const year = (row.expense_date || '').slice(0, 4) || '2026';
    const shortId = (row.id || '').replace(/-/g, '').slice(0, 6).toUpperCase();
    const voucherNo = `VCH-${year}-${shortId}`;

    return {
      id: row.id,
      voucherNo,
      title: row.title,
      description: row.title,
      category: cat,
      categoryTitleUrdu: catMeta.urdu,
      categoryTitleEn: catMeta.en,
      amount: Number(row.amount) || 0,
      expenseDate: row.expense_date,
      date: row.expense_date,
      paymentMethod: row.payment_method || 'cash',
      paidBy,
      notes: cleanNotes,
      rawNotes: row.notes,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * List all expenses with filters and pagination
   */
  async findAll(query: QueryExpensesDto) {
    const adminClient = this.supabaseService.getAdminClient();
    const page = query.page || 1;
    const limit = query.limit || 50;
    const offset = (page - 1) * limit;

    let supabaseQuery = adminClient
      .from('expenses')
      .select('*', { count: 'exact' });

    if (query.category && query.category !== 'all') {
      supabaseQuery = supabaseQuery.eq('category', query.category);
    }

    if (query.paymentMethod && query.paymentMethod !== 'all') {
      supabaseQuery = supabaseQuery.eq('payment_method', query.paymentMethod);
    }

    if (query.startDate) {
      supabaseQuery = supabaseQuery.gte('expense_date', query.startDate);
    }

    if (query.endDate) {
      supabaseQuery = supabaseQuery.lte('expense_date', query.endDate);
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%${q}%,notes.ilike.%${q}%,category.ilike.%${q}%`,
      );
    }

    supabaseQuery = supabaseQuery
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await supabaseQuery;

    if (error) {
      this.logger.error(`Failed to fetch expenses: ${error.message}`);
      throw new BadRequestException(
        `اخراجات کی تفصیل لانے میں مسئلہ پیش آیا: ${error.message}`,
      );
    }

    const items = (data || []).map((row) => this.formatExpense(row));

    return {
      data: items,
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Get single expense details
   */
  async findOne(id: string) {
    const adminClient = this.supabaseService.getAdminClient();
    const { data, error } = await adminClient
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`خرچہ آئی ڈی "${id}" ریکارڈ میں نہیں ملا`);
    }

    return this.formatExpense(data);
  }

  /**
   * Create a new expense entry
   */
  async create(dto: CreateExpenseDto, userId?: string) {
    const adminClient = this.supabaseService.getAdminClient();

    const expenseDate =
      dto.expenseDate || new Date().toISOString().slice(0, 10);
    const paymentMethod = dto.paymentMethod || 'cash';

    // Pack paidBy into notes if provided
    let combinedNotes = dto.notes || '';
    if (dto.paidBy?.trim()) {
      combinedNotes = `[Paid By: ${dto.paidBy.trim()}] ${combinedNotes}`.trim();
    }

    const insertPayload = {
      title: dto.title.trim(),
      category: dto.category.toLowerCase().trim(),
      amount: Number(dto.amount),
      payment_method: paymentMethod,
      expense_date: expenseDate,
      notes: combinedNotes || null,
      created_by: userId || null,
    };

    const { data, error } = await adminClient
      .from('expenses')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to create expense: ${error.message}`);
      throw new BadRequestException(
        `خرچہ کا اندراج محفوظ کرنے میں خرابی: ${error.message}`,
      );
    }

    this.logger.log(
      `Expense recorded: ID ${data.id} - Amount: ${data.amount} - Category: ${data.category}`,
    );

    return this.formatExpense(data);
  }

  /**
   * Update an existing expense
   */
  async update(id: string, dto: UpdateExpenseDto) {
    const adminClient = this.supabaseService.getAdminClient();

    // Check existence
    await this.findOne(id);

    const updatePayload: Record<string, any> = {};
    if (dto.title !== undefined) updatePayload.title = dto.title.trim();
    if (dto.category !== undefined)
      updatePayload.category = dto.category.toLowerCase().trim();
    if (dto.amount !== undefined) updatePayload.amount = Number(dto.amount);
    if (dto.paymentMethod !== undefined)
      updatePayload.payment_method = dto.paymentMethod;
    if (dto.expenseDate !== undefined)
      updatePayload.expense_date = dto.expenseDate;

    if (dto.notes !== undefined || dto.paidBy !== undefined) {
      const existing = await this.findOne(id);
      const paidBy =
        dto.paidBy !== undefined ? dto.paidBy : existing.paidBy;
      const notes = dto.notes !== undefined ? dto.notes : existing.notes;
      let combinedNotes = notes || '';
      if (paidBy?.trim() && paidBy !== 'کاؤنٹر کیش') {
        combinedNotes = `[Paid By: ${paidBy.trim()}] ${combinedNotes}`.trim();
      }
      updatePayload.notes = combinedNotes || null;
    }

    const { data, error } = await adminClient
      .from('expenses')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error(`Failed to update expense: ${error.message}`);
      throw new BadRequestException(
        `خرچے کی تبدیلی محفوظ نہیں ہو سکی: ${error.message}`,
      );
    }

    return this.formatExpense(data);
  }

  /**
   * Delete an expense
   */
  async remove(id: string) {
    const adminClient = this.supabaseService.getAdminClient();

    // Verify it exists first
    const existing = await this.findOne(id);

    const { error } = await adminClient.from('expenses').delete().eq('id', id);

    if (error) {
      this.logger.error(`Failed to delete expense: ${error.message}`);
      throw new BadRequestException(
        `خرچہ ڈیلیٹ کرنے میں خرابی: ${error.message}`,
      );
    }

    this.logger.log(`Expense deleted: ${id}`);
    return {
      success: true,
      message: `خرچہ واؤچر "${existing.voucherNo}" کامیابی سے حذف کر دیا گیا`,
    };
  }

  /**
   * Real-time expense KPI summary & category breakdown
   */
  async getStatsSummary(queryDate?: string) {
    const adminClient = this.supabaseService.getAdminClient();

    const targetDate = queryDate || new Date().toISOString().slice(0, 10);
    const startOfMonth = `${targetDate.slice(0, 7)}-01`;

    // Fetch this month's expenses
    const { data: monthExpenses, error } = await adminClient
      .from('expenses')
      .select('*')
      .gte('expense_date', startOfMonth);

    if (error) {
      this.logger.error(`Failed to fetch stats: ${error.message}`);
      throw new BadRequestException(
        `اخراجات خلاصہ لانے میں مسئلہ: ${error.message}`,
      );
    }

    const allMonth = monthExpenses || [];

    // Today's expenses
    const todayExpenses = allMonth.filter(
      (e) => e.expense_date === targetDate,
    );
    const todayTotal = todayExpenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0,
    );

    // This month's total
    const monthTotal = allMonth.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0,
    );

    // Palledari total
    const palledariTotal = allMonth
      .filter((e) => e.category === 'palledari')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Cash Outflow
    const cashOutflow = allMonth
      .filter((e) => e.payment_method === 'cash')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Bank / Digital Outflow
    const bankOutflow = allMonth
      .filter((e) => e.payment_method !== 'cash')
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Category breakdown
    const categoryTotals: Record<string, { total: number; count: number }> = {};
    for (const exp of allMonth) {
      const cat = exp.category || 'general';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { total: 0, count: 0 };
      }
      categoryTotals[cat].total += Number(exp.amount || 0);
      categoryTotals[cat].count += 1;
    }

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([cat, data]) => {
        const meta = EXPENSE_CATEGORIES_MAP[cat] || {
          urdu: 'متفرق خرچہ',
          en: 'Misc Expense',
        };
        return {
          category: cat,
          categoryTitleUrdu: meta.urdu,
          categoryTitleEn: meta.en,
          total: data.total,
          count: data.count,
          percentage:
            monthTotal > 0
              ? Math.round((data.total / monthTotal) * 100)
              : 0,
        };
      })
      .sort((a, b) => b.total - a.total);

    return {
      todayDate: targetDate,
      todayTotal,
      todayCount: todayExpenses.length,
      monthTotal,
      monthCount: allMonth.length,
      palledariTotal,
      cashOutflow,
      bankOutflow,
      categoryBreakdown,
    };
  }
}
