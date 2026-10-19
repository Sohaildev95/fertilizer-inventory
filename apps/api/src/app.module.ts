import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProductsModule } from './products/products.module.js';
import { CustomersModule } from './customers/customers.module.js';
import { SalesModule } from './sales/sales.module.js';
import { VendorsModule } from './vendors/vendors.module.js';
import { PurchasesModule } from './purchases/purchases.module.js';
import { ExpensesModule } from './expenses/expenses.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Supabase (Global)
    SupabaseModule,

    // Auth Module
    AuthModule,

    // Products & Inventory Module
    ProductsModule,

    // Customers & Zamindar Khata Module
    CustomersModule,

    // POS Counter Sales & Invoicing Module
    SalesModule,

    // Vendors & Suppliers Module
    VendorsModule,

    // Purchases & Stock-In Module
    PurchasesModule,

    // Daily Shop Expenses Module
    ExpensesModule,

    // Financial Reports & Daily Roznamcha Module
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
