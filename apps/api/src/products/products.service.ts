import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { QueryProductsDto } from './dto/query-products.dto.js';
import { AdjustStockDto } from './dto/adjust-stock.dto.js';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new product (Fertilizer, Seeds, Pesticides)
   */
  async create(dto: CreateProductDto, userId?: string) {
    const adminClient = this.supabaseService.getAdminClient();

    // Auto-generate SKU if omitted
    const sku =
      dto.sku?.trim() ||
      `PRD-${dto.companyName.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const initialStock = dto.initialStock ?? 0;

    const { data: product, error } = await adminClient
      .from('products')
      .insert({
        name: dto.name.trim(),
        urdu_name: dto.urduName?.trim() || null,
        sku: sku,
        category_id: dto.categoryId || null,
        company_name: dto.companyName.trim(),
        unit: dto.unit || 'bag_50kg',
        cost_price: dto.costPrice,
        sale_price: dto.salePrice,
        min_sale_price: dto.minSalePrice || dto.costPrice,
        current_stock: initialStock,
        min_stock_alert: dto.minStockAlert ?? 10,
        rack_location: dto.rackLocation?.trim() || null,
        batch_number: dto.batchNumber?.trim() || null,
        expiry_date: dto.expiryDate || null,
        barcode: dto.barcode?.trim() || null,
        description: dto.description?.trim() || null,
        is_active: true,
      })
      .select('*, category:categories(id, name, urdu_name, slug)')
      .single();

    if (error) {
      this.logger.error(`Failed to create product: ${error.message}`);
      throw new BadRequestException(`Product banane mein masla aya: ${error.message}`);
    }

    // Record initial stock movement if quantity > 0
    if (initialStock > 0) {
      await adminClient.from('stock_movements').insert({
        product_id: product.id,
        movement_type: 'adjustment',
        quantity: initialStock,
        previous_stock: 0,
        new_stock: initialStock,
        reason: 'ابتدائی اسٹاک اندراج (Opening Stock Entry)',
        created_by: userId || null,
      });
    }

    return {
      success: true,
      data: product,
      message: 'Product kamyabi se shamil ho gaya',
    };
  }

  /**
   * List all products with advanced filtering and pagination
   */
  async findAll(query: QueryProductsDto) {
    const client = this.supabaseService.getAdminClient();
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let dbQuery = client
      .from('products')
      .select('*, category:categories(id, name, urdu_name, slug)', { count: 'exact' });

    // Active status filter
    if (query.isActive !== undefined) {
      dbQuery = dbQuery.eq('is_active', query.isActive);
    }

    // Category filter
    if (query.categoryId) {
      dbQuery = dbQuery.eq('category_id', query.categoryId);
    }

    // Company filter
    if (query.company) {
      dbQuery = dbQuery.ilike('company_name', `%${query.company}%`);
    }

    // Search query (matches name, urdu_name, sku, or company_name)
    if (query.search) {
      const term = query.search.trim();
      dbQuery = dbQuery.or(
        `name.ilike.%${term}%,urdu_name.ilike.%${term}%,sku.ilike.%${term}%,company_name.ilike.%${term}%`,
      );
    }

    // Sorting
    const sortField = query.sortBy || 'created_at';
    const isAscending = query.sortOrder === 'asc';
    dbQuery = dbQuery.order(sortField, { ascending: isAscending });

    // Pagination
    dbQuery = dbQuery.range(from, to);

    const { data: products, count, error } = await dbQuery;

    if (error) {
      this.logger.error(`Failed to list products: ${error.message}`);
      throw new BadRequestException(`Products list karne mein masla aya: ${error.message}`);
    }

    // Filter low stock if requested in memory/view
    let filteredProducts = products || [];
    if (query.lowStock) {
      filteredProducts = filteredProducts.filter(
        (p) => Number(p.current_stock) <= Number(p.min_stock_alert),
      );
    }

    return {
      success: true,
      data: filteredProducts,
      total: count ?? filteredProducts.length,
      page,
      limit,
      totalPages: Math.ceil((count ?? filteredProducts.length) / limit),
    };
  }

  /**
   * Get single product by ID with category and recent stock movements
   */
  async findOne(id: string) {
    const client = this.supabaseService.getAdminClient();

    const { data: product, error } = await client
      .from('products')
      .select('*, category:categories(id, name, urdu_name, slug)')
      .eq('id', id)
      .single();

    if (error || !product) {
      throw new NotFoundException(`Product ID ${id} nahi mila`);
    }

    // Fetch recent 10 stock movements
    const { data: movements } = await client
      .from('stock_movements')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      success: true,
      data: {
        ...product,
        recentMovements: movements || [],
      },
    };
  }

  /**
   * Update product details
   */
  async update(id: string, dto: UpdateProductDto) {
    const adminClient = this.supabaseService.getAdminClient();

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updatePayload.name = dto.name.trim();
    if (dto.urduName !== undefined) updatePayload.urdu_name = dto.urduName.trim() || null;
    if (dto.sku !== undefined) updatePayload.sku = dto.sku.trim();
    if (dto.categoryId !== undefined) updatePayload.category_id = dto.categoryId || null;
    if (dto.companyName !== undefined) updatePayload.company_name = dto.companyName.trim();
    if (dto.unit !== undefined) updatePayload.unit = dto.unit;
    if (dto.costPrice !== undefined) updatePayload.cost_price = dto.costPrice;
    if (dto.salePrice !== undefined) updatePayload.sale_price = dto.salePrice;
    if (dto.minSalePrice !== undefined) updatePayload.min_sale_price = dto.minSalePrice;
    if (dto.minStockAlert !== undefined) updatePayload.min_stock_alert = dto.minStockAlert;
    if (dto.rackLocation !== undefined) updatePayload.rack_location = dto.rackLocation?.trim() || null;
    if (dto.batchNumber !== undefined) updatePayload.batch_number = dto.batchNumber?.trim() || null;
    if (dto.expiryDate !== undefined) updatePayload.expiry_date = dto.expiryDate || null;
    if (dto.barcode !== undefined) updatePayload.barcode = dto.barcode?.trim() || null;
    if (dto.description !== undefined) updatePayload.description = dto.description?.trim() || null;
    if (dto.isActive !== undefined) updatePayload.is_active = dto.isActive;

    const { data: updated, error } = await adminClient
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select('*, category:categories(id, name, urdu_name, slug)')
      .single();

    if (error) {
      this.logger.error(`Failed to update product ${id}: ${error.message}`);
      throw new BadRequestException(`Product update karne mein masla aya: ${error.message}`);
    }

    return {
      success: true,
      data: updated,
      message: 'Product kamyabi se update ho gaya',
    };
  }

  /**
   * Soft-delete / deactivate product
   */
  async remove(id: string) {
    const adminClient = this.supabaseService.getAdminClient();

    const { data: product, error } = await adminClient
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Product deactivate karne mein masla aya: ${error.message}`);
    }

    return {
      success: true,
      data: product,
      message: 'Product deactivate ho gaya',
    };
  }

  /**
   * Adjust inventory stock (Damages, Spoilage, Audit Corrections, Stock In)
   */
  async adjustStock(id: string, dto: AdjustStockDto, userId?: string) {
    const adminClient = this.supabaseService.getAdminClient();

    // 1. Fetch current stock
    const { data: product, error: fetchErr } = await adminClient
      .from('products')
      .select('id, name, urdu_name, current_stock')
      .eq('id', id)
      .single();

    if (fetchErr || !product) {
      throw new NotFoundException(`Product ${id} nahi mila`);
    }

    const previousStock = Number(product.current_stock || 0);
    const newStock = previousStock + dto.quantity;

    if (newStock < 0) {
      throw new BadRequestException(
        `Stock manfi (negative) nahi ho sakta. Mojooda stock: ${previousStock}, adjustment: ${dto.quantity}`,
      );
    }

    // 2. Update product stock
    const { data: updatedProduct, error: updateErr } = await adminClient
      .from('products')
      .update({
        current_stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) {
      throw new BadRequestException(`Stock update fail ho gaya: ${updateErr.message}`);
    }

    // 3. Record audit trail in stock_movements
    const { error: movementErr } = await adminClient.from('stock_movements').insert({
      product_id: id,
      movement_type: dto.movementType,
      quantity: dto.quantity,
      previous_stock: previousStock,
      new_stock: newStock,
      reason: dto.reason || 'Manual stock adjustment',
      created_by: userId || null,
    });

    if (movementErr) {
      this.logger.warn(`Failed to log stock movement: ${movementErr.message}`);
    }

    return {
      success: true,
      data: {
        product: updatedProduct,
        previousStock,
        newStock,
        difference: dto.quantity,
      },
      message: `Stock kamyabi se adjust ho gaya. Naya stock: ${newStock}`,
    };
  }

  /**
   * List all fertilizer categories for UI dropdowns
   */
  async getCategories() {
    const client = this.supabaseService.getAdminClient();
    const { data: categories, error } = await client
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new BadRequestException(`Categories fetch fail: ${error.message}`);
    }

    return {
      success: true,
      data: categories || [],
    };
  }

  /**
   * Get stock movement audit trail for a product
   */
  async getMovements(id: string) {
    const client = this.supabaseService.getAdminClient();
    const { data: movements, error } = await client
      .from('stock_movements')
      .select('*, profile:profiles(full_name)')
      .eq('product_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(`Movements fetch fail: ${error.message}`);
    }

    return {
      success: true,
      data: movements || [],
    };
  }

  /**
   * Get Inventory Analytics & KPI Summary
   */
  async getStats() {
    const client = this.supabaseService.getAdminClient();

    const { data: products, error } = await client
      .from('products')
      .select('current_stock, cost_price, sale_price, min_stock_alert, is_active')
      .eq('is_active', true);

    if (error) {
      throw new BadRequestException(`Stats calculation fail: ${error.message}`);
    }

    let totalProducts = products?.length || 0;
    let totalStockBags = 0;
    let lowStockCount = 0;
    let totalAssetValue = 0;
    let totalRetailValue = 0;

    for (const p of products || []) {
      const stock = Number(p.current_stock || 0);
      const cost = Number(p.cost_price || 0);
      const sale = Number(p.sale_price || 0);
      const alert = Number(p.min_stock_alert || 0);

      totalStockBags += stock;
      totalAssetValue += stock * cost;
      totalRetailValue += stock * sale;

      if (stock <= alert) {
        lowStockCount++;
      }
    }

    return {
      success: true,
      data: {
        totalProducts,
        totalStockBags,
        lowStockCount,
        totalAssetValue,
        totalRetailValue,
        potentialProfit: totalRetailValue - totalAssetValue,
      },
    };
  }
}
