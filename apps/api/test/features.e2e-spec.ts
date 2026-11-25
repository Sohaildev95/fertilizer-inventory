import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

describe('Fertilizer Inventory Functional Endpoints (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1 should return API health info', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1').expect(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('Products endpoints return inventory catalog, categories, and stats', async () => {
    const [listRes, catRes, statsRes] = await Promise.all([
      request(app.getHttpServer()).get('/api/v1/products?limit=20').expect(200),
      request(app.getHttpServer()).get('/api/v1/products/categories').expect(200),
      request(app.getHttpServer()).get('/api/v1/products/stats').expect(200),
    ]);
    expect(listRes.body).toHaveProperty('data');
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(catRes.body).toBeDefined();
    expect(statsRes.body).toBeDefined();
  });

  it('Customers endpoints return farmers, stats, and Fasli Udhaar forecast', async () => {
    const [custRes, statsRes, fasliRes] = await Promise.all([
      request(app.getHttpServer()).get('/api/v1/customers?limit=20').expect(200),
      request(app.getHttpServer()).get('/api/v1/customers/stats/summary').expect(200),
      request(app.getHttpServer()).get('/api/v1/customers/fasli-udhaar/forecast').expect(200),
    ]);
    expect(custRes.body).toHaveProperty('data');
    expect(statsRes.body).toHaveProperty('totalUdhar');
    expect(fasliRes.body).toHaveProperty('summary');
    expect(fasliRes.body.summary).toHaveProperty('rabiTotal');
    expect(fasliRes.body.summary).toHaveProperty('kharifTotal');
    expect(Array.isArray(fasliRes.body.forecast)).toBe(true);
  });

  it('Sales, Purchases, Vendors, Portal & Expenses endpoints respond cleanly', async () => {
    const [salesToday, salesList, purStats, vendStats, portalDash, expStats] =
      await Promise.all([
        request(app.getHttpServer()).get('/api/v1/sales/stats/today').expect(200),
        request(app.getHttpServer()).get('/api/v1/sales?limit=10').expect(200),
        request(app.getHttpServer()).get('/api/v1/purchases/stats/summary').expect(200),
        request(app.getHttpServer()).get('/api/v1/vendors/stats/summary').expect(200),
        request(app.getHttpServer()).get('/api/v1/vendors/portal/dashboard').expect(200),
        request(app.getHttpServer()).get('/api/v1/expenses/stats/summary').expect(200),
      ]);
    expect(salesToday.body).toBeDefined();
    expect(salesList.body).toBeDefined();
    expect(purStats.body).toBeDefined();
    expect(vendStats.body).toBeDefined();
    expect(portalDash.body).toBeDefined();
    expect(expStats.body).toBeDefined();
  });

  it('Reports endpoints return P&L, Roznamcha, Stock Valuation, Market Udhar & Per-Bag Margins', async () => {
    const [plRes, rozRes, stockRes, udharRes, marginsRes] = await Promise.all([
      request(app.getHttpServer()).get('/api/v1/reports/profit-loss?timeRange=this_month').expect(200),
      request(app.getHttpServer()).get('/api/v1/reports/roznamcha').expect(200),
      request(app.getHttpServer()).get('/api/v1/reports/stock-valuation').expect(200),
      request(app.getHttpServer()).get('/api/v1/reports/market-udhar').expect(200),
      request(app.getHttpServer()).get('/api/v1/reports/per-bag-margins?timeRange=this_month').expect(200),
    ]);
    expect(plRes.body).toHaveProperty('summary');
    expect(rozRes.body).toHaveProperty('summary');
    expect(stockRes.body).toHaveProperty('summary');
    expect(udharRes.body).toHaveProperty('summary');
    expect(marginsRes.body).toHaveProperty('summary');
    expect(typeof marginsRes.body.summary.averageProfitPerBag).toBe('number');
    expect(marginsRes.body.summary).toHaveProperty('cashVsCredit');
    expect(Array.isArray(marginsRes.body.companyWise)).toBe(true);
    expect(Array.isArray(marginsRes.body.productMargins)).toBe(true);
    expect(marginsRes.body.productMargins.length).toBeGreaterThan(0);
  });

  it('Campaigns endpoints return templates, stats, WhatsApp links, campaign creation & CSV export', async () => {
    const tmplRes = await request(app.getHttpServer())
      .get('/api/v1/campaigns/templates')
      .expect(200);
    expect(Array.isArray(tmplRes.body)).toBe(true);
    expect(tmplRes.body.length).toBeGreaterThanOrEqual(5);

    const statsRes = await request(app.getHttpServer())
      .get('/api/v1/campaigns/stats')
      .expect(200);
    expect(statsRes.body.totalFarmers).toBeGreaterThan(0);

    const recRes = await request(app.getHttpServer())
      .get('/api/v1/campaigns/recipients?audienceType=debtors_only')
      .expect(200);
    expect(Array.isArray(recRes.body)).toBe(true);
    for (const r of recRes.body) {
      expect(r.balance).toBeGreaterThan(0);
      expect(r.whatsappLink).toContain('https://wa.me/');
    }

    await request(app.getHttpServer())
      .post('/api/v1/campaigns')
      .send({ title: 'Missing message' })
      .expect(400);

    const createRes = await request(app.getHttpServer())
      .post('/api/v1/campaigns')
      .send({
        title: 'Test Urea Arrival Alert',
        channel: 'whatsapp',
        audienceType: 'all_farmers',
        messageText: 'محترم کسان بھائی! سونا یوریا پہنچ چکی ہے۔',
      })
      .expect(201);
    expect(createRes.body).toHaveProperty('id');

    const csvRes = await request(app.getHttpServer())
      .get('/api/v1/campaigns/export-csv?audienceType=all_farmers')
      .expect(200);
    expect(csvRes.headers['content-type']).toContain('text/csv');
    expect(csvRes.text).toContain('Farmer Name,Mobile Number,Village');
  });
});
