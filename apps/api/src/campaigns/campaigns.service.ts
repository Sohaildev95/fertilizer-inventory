import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import {
  BroadcastCampaign,
  BroadcastRecipient,
  DEFAULT_BROADCAST_TEMPLATES,
} from '@fertilizer/shared';
import { CreateCampaignDto } from './dto/create-campaign.dto.js';
import { QueryRecipientsDto } from './dto/query-recipients.dto.js';

// Fallback demo farmers if database has not populated them yet
const DEMO_FARMERS = [
  {
    id: 'cst-1',
    name: 'چوہدری نذیر احمد',
    fatherName: 'برکت علی وٹو',
    phone: '0300-7654321',
    village: 'چک 45/12L، چیچہ وطنی',
    currentCrop: 'گندم (Wheat)',
    balance: 345000,
    creditLimit: 500000,
  },
  {
    id: 'cst-2',
    name: 'ملک محمد اسلم کھوکھر',
    fatherName: 'حاجی بشیر احمد',
    phone: '0301-4455667',
    village: 'چک 88/9L، ساہیوال روڈ',
    currentCrop: 'کپاس (Cotton)',
    balance: 1420000,
    creditLimit: 1500000,
  },
  {
    id: 'cst-3',
    name: 'میاں طارق جاوید ارائیں',
    fatherName: 'میاں محمد شریف',
    phone: '0321-8899771',
    village: 'قبولہ شریف، تحصیل عارف والا',
    currentCrop: 'دھان / چاول (Rice)',
    balance: 185000,
    creditLimit: 600000,
  },
  {
    id: 'cst-4',
    name: 'رانا خرم شہزاد',
    fatherName: 'رانا محمد اکرم',
    phone: '0345-6677889',
    village: 'ٹھٹھہ صادق آباد، تحصیل خانیوال',
    currentCrop: 'کماد (Sugarcane)',
    balance: 0,
    creditLimit: 800000,
  },
  {
    id: 'cst-5',
    name: 'سردار اللہ دتہ کھوکھر',
    fatherName: 'سردار بہادر خان',
    phone: '0302-3344556',
    village: 'بستی ملوک، ملتان بائی پاس',
    currentCrop: 'گندم و مکئی',
    balance: 790000,
    creditLimit: 1200000,
  },
  {
    id: 'cst-6',
    name: 'حاجی منظور حسین ڈوگر',
    fatherName: 'نور محمد ڈوگر',
    phone: '0300-9988112',
    village: 'چک 45/12L، چیچہ وطنی',
    currentCrop: 'آلو (Potato)',
    balance: 520000,
    creditLimit: 1000000,
  },
];

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  // In-memory campaign storage for persistence across requests
  private campaigns: BroadcastCampaign[] = [
    {
      id: 'cmp-1',
      title: 'گندم سیزن یوریا و ڈی اے پی نئی گاڑی آمد',
      channel: 'both',
      audienceType: 'all_farmers',
      messageText:
        'محترم کسان بھائی! السلام علیکم، پنجاب کھاد ایجنسی پر سونا یوریا اور اینگرو ڈی اے پی کی نئی کھیپ گودام میں پہنچ چکی ہے۔ اپنا کوٹہ جلد از جلد حاصل کریں۔ شکریہ!',
      totalRecipients: 48,
      sentCount: 48,
      status: 'completed',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'cmp-2',
      title: 'فصلی ادھار کٹائی ریکوری یاد دہانی - ربیع',
      channel: 'whatsapp',
      audienceType: 'debtors_only',
      messageText:
        'محترم کسان صاحب! گندم کٹائی مکمل ہو چکی ہے۔ گزارش ہے کہ پنجاب کھاد ایجنسی تشریف لا کر اپنا فصلی کھاتہ کلیئر فرما لیں۔ شکریہ!',
      totalRecipients: 19,
      sentCount: 19,
      status: 'completed',
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Format Pakistani phone numbers to clean international format for WhatsApp and Telco SMS
   */
  private formatPhoneNumber(rawPhone: string): { international: string; local: string } {
    const digits = (rawPhone || '').replace(/[^0-9]/g, '');
    let international = digits;
    let local = digits;

    if (digits.startsWith('0')) {
      international = '92' + digits.slice(1);
      local = digits;
    } else if (digits.startsWith('92')) {
      international = digits;
      local = '0' + digits.slice(2);
    } else if (digits.length === 10) {
      international = '92' + digits;
      local = '0' + digits;
    }

    return { international, local };
  }

  /**
   * Helper to replace placeholders like {name}, {village}, {balance}
   */
  private personalizeMessage(template: string, farmer: any): string {
    return template
      .replace(/\{کِسان کا نام\}|\{name\}/gi, farmer.name || 'محترم کسان')
      .replace(/\{چک\/موزہ\}|\{village\}/gi, farmer.village || '')
      .replace(
        /\{بقایا ادھار\}|\{balance\}/gi,
        farmer.balance ? `Rs. ${Number(farmer.balance).toLocaleString()}` : 'Rs. 0',
      )
      .replace(/\{دکان کا نام\}|\{shop\}/gi, 'پنجاب کھاد ایجنسی');
  }

  /**
   * 1. Get predefined templates
   */
  getTemplates() {
    return DEFAULT_BROADCAST_TEMPLATES;
  }

  /**
   * 2. Get high-level broadcast statistics
   */
  async getStats() {
    const recipients = await this.getRecipients({});
    const totalFarmers = recipients.length;
    const debtorsCount = recipients.filter((r) => r.balance > 0).length;
    const totalDebt = recipients.reduce((sum, r) => sum + (r.balance || 0), 0);

    const villagesSet = new Set(recipients.map((r) => r.village).filter(Boolean));
    const totalVillages = villagesSet.size;

    return {
      totalFarmers,
      debtorsCount,
      totalDebt,
      totalVillages,
      totalCampaigns: this.campaigns.length,
      villages: Array.from(villagesSet),
    };
  }

  /**
   * 3. Fetch and filter recipients based on audience segment
   */
  async getRecipients(query: QueryRecipientsDto): Promise<BroadcastRecipient[]> {
    const adminClient = this.supabaseService.getAdminClient();
    let rawCustomers: any[] = [];

    try {
      const { data, error } = await adminClient
        .from('customers')
        .select('*')
        .order('name', { ascending: true });

      if (!error && data && data.length > 0) {
        rawCustomers = data.map((c) => ({
          id: c.id,
          name: c.name,
          fatherName: c.notes?.match(/ولد:\s*([^|•\n]+)/)?.[1]?.trim(),
          phone: c.phone || '0300-0000000',
          village: c.village || 'چک لوکل',
          currentCrop: c.notes?.match(/فصل:\s*([^|•\n]+)/)?.[1]?.trim() || 'گندم و مکئی',
          balance: Number(c.current_balance || c.balance || 0),
          creditLimit: Number(c.credit_limit || 500000),
        }));
      } else {
        rawCustomers = DEMO_FARMERS;
      }
    } catch (err: any) {
      this.logger.warn(`Could not fetch from Supabase, using demo farmers: ${err?.message}`);
      rawCustomers = DEMO_FARMERS;
    }

    // Filter by audienceType
    let filtered = rawCustomers;
    const audienceType = query.audienceType || 'all_farmers';

    if (audienceType === 'debtors_only') {
      filtered = filtered.filter((c) => c.balance > 0);
    } else if (audienceType === 'village' && query.village && query.village !== 'all') {
      const vQuery = query.village.toLowerCase().trim();
      filtered = filtered.filter((c) => (c.village || '').toLowerCase().includes(vQuery));
    } else if (audienceType === 'crop_farmers' && query.crop && query.crop !== 'all') {
      const cQuery = query.crop.toLowerCase().trim();
      filtered = filtered.filter((c) => (c.currentCrop || '').toLowerCase().includes(cQuery));
    }

    const sampleMsg =
      query.messageTemplate ||
      'محترم {کِسان کا نام} صاحب! پنجاب کھاد ایجنسی کی طرف سے ضروری اطلاع موصول فرمائیں۔ شکریہ!';

    return filtered.map((c) => {
      const { international, local } = this.formatPhoneNumber(c.phone);
      const personalized = this.personalizeMessage(sampleMsg, c);
      const encoded = encodeURIComponent(personalized);

      const whatsappLink = international
        ? `https://wa.me/${international}?text=${encoded}`
        : undefined;

      const smsUri = local ? `sms:${local}?body=${encoded}` : undefined;

      return {
        id: c.id,
        name: c.name,
        fatherName: c.fatherName,
        phone: c.phone,
        village: c.village,
        currentCrop: c.currentCrop,
        balance: c.balance,
        creditLimit: c.creditLimit,
        selected: true,
        whatsappLink,
        smsUri,
        status: 'pending',
      };
    });
  }

  /**
   * 4. Create and save a new broadcast campaign
   */
  async createCampaign(dto: CreateCampaignDto): Promise<BroadcastCampaign> {
    const recipients = await this.getRecipients({
      audienceType: dto.audienceType,
      village: dto.filterVillage,
      crop: dto.filterCrop,
      messageTemplate: dto.messageText,
    });

    const finalRecipients = dto.recipientIds?.length
      ? recipients.filter((r) => dto.recipientIds!.includes(r.id))
      : recipients;

    const newCampaign: BroadcastCampaign = {
      id: `cmp-${Date.now().toString().slice(-6)}`,
      title: dto.title,
      channel: dto.channel,
      audienceType: dto.audienceType,
      filterVillage: dto.filterVillage,
      filterCrop: dto.filterCrop,
      messageText: dto.messageText,
      totalRecipients: finalRecipients.length,
      sentCount: finalRecipients.length, // queued or dispatched
      status: 'completed',
      createdAt: new Date().toISOString(),
      recipients: finalRecipients,
    };

    this.campaigns.unshift(newCampaign);
    return newCampaign;
  }

  /**
   * 5. List all past broadcast campaigns
   */
  async listCampaigns(): Promise<BroadcastCampaign[]> {
    return this.campaigns;
  }

  /**
   * 6. Generate CSV string for Pakistani SMS Portals (Jazz / Zong / Telenor)
   */
  async exportCsv(query: QueryRecipientsDto): Promise<string> {
    const recipients = await this.getRecipients(query);
    const headers = ['Farmer Name', 'Mobile Number', 'Village', 'Current Balance', 'Current Crop', 'Personalized Message'];

    const rows = recipients.map((r) => {
      const msg = this.personalizeMessage(query.messageTemplate || '', r);
      return [
        `"${r.name.replace(/"/g, '""')}"`,
        `"${this.formatPhoneNumber(r.phone).local}"`,
        `"${(r.village || '').replace(/"/g, '""')}"`,
        r.balance || 0,
        `"${(r.currentCrop || '').replace(/"/g, '""')}"`,
        `"${msg.replace(/"/g, '""')}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  }
}

