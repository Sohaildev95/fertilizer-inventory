'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../../../lib/language-context';
import { apiRequest } from '../../../lib/api-client';
import {
  DEFAULT_BROADCAST_TEMPLATES,
  BroadcastMessageTemplate,
  BroadcastRecipient,
  BroadcastCampaign,
} from '@fertilizer/shared';
import {
  Megaphone,
  Send,
  MessageSquare,
  Users,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Smartphone,
  MapPin,
  RefreshCw,
  Search,
  ExternalLink,
  Check,
  Building2,
  Clock,
  Filter,
  FileSpreadsheet,
  Coins,
  Sprout,
  PlusCircle,
  Loader2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

export default function BroadcastPage() {
  const { isUrdu } = useLanguage();

  // Stats state
  const [stats, setStats] = useState<{
    totalFarmers: number;
    debtorsCount: number;
    totalDebt: number;
    totalVillages: number;
    totalCampaigns: number;
    villages: string[];
  }>({
    totalFarmers: 0,
    debtorsCount: 0,
    totalDebt: 0,
    totalVillages: 0,
    totalCampaigns: 0,
    villages: [],
  });

  // Audience & Filter State
  const [audienceType, setAudienceType] = useState<
    'all_farmers' | 'debtors_only' | 'village' | 'crop_farmers'
  >('all_farmers');
  const [selectedVillage, setSelectedVillage] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Template & Message Composer State
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('stock_arrival');
  const [campaignTitle, setCampaignTitle] = useState('سونا یوریا و ڈی اے پی نیا سٹاک آمد');
  const [messageText, setMessageText] = useState(
    DEFAULT_BROADCAST_TEMPLATES[0]?.defaultUrdu || '',
  );
  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'both'>('whatsapp');

  // Recipients State
  const [recipients, setRecipients] = useState<BroadcastRecipient[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState(false);
  const [sentMap, setSentMap] = useState<Record<string, boolean>>({});

  // Campaigns History State
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>([]);
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);

  // Copy Feedback
  const [copiedNumbers, setCopiedNumbers] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Load High-level Stats
  const loadStats = useCallback(async () => {
    try {
      const res = await apiRequest<any>('/campaigns/stats');
      if (res) {
        setStats(res);
      }
    } catch (err) {
      console.warn('Failed to load broadcast stats:', err);
    }
  }, []);

  // Load Past Campaigns
  const loadCampaigns = useCallback(async () => {
    try {
      const res = await apiRequest<BroadcastCampaign[]>('/campaigns');
      if (res) {
        setCampaigns(res);
      }
    } catch (err) {
      console.warn('Failed to load past campaigns:', err);
    }
  }, []);

  // Load Target Recipients
  const loadRecipients = useCallback(async () => {
    setIsLoadingRecipients(true);
    try {
      const params = new URLSearchParams();
      params.set('audienceType', audienceType);
      if (audienceType === 'village' && selectedVillage !== 'all') {
        params.set('village', selectedVillage);
      }
      if (audienceType === 'crop_farmers' && selectedCrop !== 'all') {
        params.set('crop', selectedCrop);
      }
      params.set('messageTemplate', messageText);

      const res = await apiRequest<BroadcastRecipient[]>(`/campaigns/recipients?${params.toString()}`);
      if (res) {
        setRecipients(res);
      }
    } catch (err) {
      console.warn('Failed to load recipients:', err);
    } finally {
      setIsLoadingRecipients(false);
    }
  }, [audienceType, selectedVillage, selectedCrop, messageText]);

  useEffect(() => {
    loadStats();
    loadCampaigns();
  }, [loadStats, loadCampaigns]);

  useEffect(() => {
    loadRecipients();
  }, [loadRecipients]);

  // Handle template selection
  const handleSelectTemplate = (template: BroadcastMessageTemplate) => {
    setSelectedTemplateKey(template.key);
    setCampaignTitle(template.titleUrdu);
    setMessageText(template.defaultUrdu);
  };

  // Insert variable into message
  const insertVariable = (variable: string) => {
    setMessageText((prev) => `${prev} ${variable}`);
  };

  // Filter recipients by search query
  const displayedRecipients = useMemo(() => {
    if (!searchQuery.trim()) return recipients;
    const q = searchQuery.toLowerCase().trim();
    return recipients.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        (r.village && r.village.toLowerCase().includes(q)),
    );
  }, [recipients, searchQuery]);

  // Selected Count & Total Balance of Recipients
  const selectedRecipients = useMemo(() => {
    return recipients.filter((r) => r.selected);
  }, [recipients]);

  const selectedTotalBalance = useMemo(() => {
    return selectedRecipients.reduce((sum, r) => sum + (r.balance || 0), 0);
  }, [selectedRecipients]);

  // Toggle recipient selection
  const toggleSelectRecipient = (id: string) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)),
    );
  };

  const toggleSelectAll = (select: boolean) => {
    setRecipients((prev) => prev.map((r) => ({ ...r, selected: select })));
  };

  // Copy Comma-Separated Numbers for WhatsApp Broadcast or Telco Portals
  const copyAllNumbers = () => {
    const numbers = selectedRecipients
      .map((r) => r.phone.replace(/[^0-9]/g, ''))
      .filter((p) => p.length >= 10);

    const formatted = numbers.join(', ');
    navigator.clipboard.writeText(formatted);
    setCopiedNumbers(true);
    setTimeout(() => setCopiedNumbers(false), 2500);
  };

  // Copy Message Text
  const copyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Mark recipient as sent
  const handleMarkSent = (id: string, whatsappLink?: string) => {
    setSentMap((prev) => ({ ...prev, [id]: true }));
    if (whatsappLink) {
      window.open(whatsappLink, '_blank', 'noopener,noreferrer');
    }
  };

  // Record Campaign in History
  const handleSaveCampaign = async () => {
    if (!messageText.trim()) return;
    setIsSavingCampaign(true);
    try {
      const res = await apiRequest<BroadcastCampaign>('/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          title: campaignTitle.trim() || 'فصلی براڈکاسٹ پیغام',
          channel,
          audienceType,
          filterVillage: audienceType === 'village' ? selectedVillage : undefined,
          filterCrop: audienceType === 'crop_farmers' ? selectedCrop : undefined,
          messageText,
          recipientIds: selectedRecipients.map((r) => r.id),
        }),
      });

      if (res) {
        setCampaigns((prev) => [res, ...prev]);
        loadStats();
        alert(isUrdu ? 'براڈکاسٹ مہم کامیابی سے ریکارڈ کر لی گئی ہے!' : 'Campaign recorded successfully!');
      }
    } catch (err: any) {
      alert(`خرابی: ${err?.message || 'Failed to save campaign'}`);
    } finally {
      setIsSavingCampaign(false);
    }
  };

  // Download CSV for Bulk SMS Gateway
  const handleDownloadCsv = () => {
    const params = new URLSearchParams();
    params.set('audienceType', audienceType);
    if (audienceType === 'village' && selectedVillage !== 'all') {
      params.set('village', selectedVillage);
    }
    if (audienceType === 'crop_farmers' && selectedCrop !== 'all') {
      params.set('crop', selectedCrop);
    }
    params.set('messageTemplate', messageText);

    window.open(`/api/v1/campaigns/export-csv?${params.toString()}`, '_blank');
  };

  // Character & SMS Count Calculation
  const charCount = messageText.length;
  const isUrduUnicode = /[\u0600-\u06FF]/.test(messageText);
  const smsMaxPerSegment = isUrduUnicode ? 70 : 160;
  const smsSegments = Math.ceil(charCount / smsMaxPerSegment) || 1;

  const formatCurrency = (amt: number) => `Rs. ${(amt || 0).toLocaleString()}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header with Title & Quick Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-2xl sm:text-3xl font-black text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
                {isUrdu ? 'پیغامات و بلک براڈکاسٹ سینٹر' : 'Bulk WhatsApp & SMS Broadcast Center'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                1-Click WhatsApp
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isUrdu
                ? 'کھاد کا نیا سٹاک آمد، سرکاری ریٹ لسٹ، فصلی ریکوری اور زرعی مشورے کسانوں کے موبائل پر ارسال کریں'
                : 'Broadcast stock arrivals, official fertilizer rate updates, crop harvest recovery, and pest alerts to farmers.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={copyAllNumbers}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-xs"
            title={isUrdu ? 'تمام موبائل نمبرز کوما کے ساتھ کاپی کریں' : 'Copy All Numbers'}
          >
            {copiedNumbers ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedNumbers ? (isUrdu ? 'نمبرز کاپی ہو گئے' : 'Copied!') : isUrdu ? 'تمام نمبرز کاپی' : 'Copy Numbers'}</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            title={isUrdu ? 'ٹیلی کام پورٹل کے لیے CSV فائل ڈاؤن لوڈ کریں' : 'Export CSV'}
          >
            <Download className="w-4 h-4" />
            <span>{isUrdu ? 'CSV ڈاؤن لوڈ (SMS پورٹل)' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 High-Impact KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reachable Farmers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'کل رجسٹرڈ کسان (موبائل)' : 'Reachable Farmers'}
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">
            {stats.totalFarmers}{' '}
            <span className="text-sm font-normal text-slate-500">{isUrdu ? 'کسان' : 'Farmers'}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? 'جن کے درست موبائل نمبرز محفوظ ہیں' : 'With valid mobile contact numbers'}
          </p>
        </div>

        {/* Active Debtors */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'واجب الادا ادھار والے کسان' : 'Pending Debtors'}
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 font-mono">
            {stats.debtorsCount}{' '}
            <span className="text-sm font-normal text-slate-500">{isUrdu ? 'کھاتے دار' : 'Debtors'}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? `کل بقایا: ${formatCurrency(stats.totalDebt)}` : `Total Debt: ${formatCurrency(stats.totalDebt)}`}
          </p>
        </div>

        {/* Covered Villages */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'منسلک چکس و دیہات' : 'Villages Covered'}
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-700 font-mono">
            {stats.totalVillages}{' '}
            <span className="text-sm font-normal text-slate-500">{isUrdu ? 'چک / موزہ' : 'Villages'}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? 'علاقہ وائز براڈکاسٹ کے لیے تیار' : 'Available for village targeting'}
          </p>
        </div>

        {/* Total Campaigns */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isUrdu ? 'بھیجے گئے پیغامات مہمات' : 'Broadcast Campaigns'}
            </span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-700 font-mono">
            {stats.totalCampaigns}{' '}
            <span className="text-sm font-normal text-slate-500">{isUrdu ? 'مہمات' : 'Campaigns'}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isUrdu ? 'موسمی اعلانات و ریکوری پیغامات' : 'Recorded seasonal broadcasts'}
          </p>
        </div>
      </div>

      {/* 3. Main Broadcast Studio (Split Screen: Left = Audience & Composer, Right = Phone Preview & Recipient Queue) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Selector & Message Composer */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Target Audience Selector */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-base font-bold text-slate-900 flex items-center gap-2 ${isUrdu ? 'font-urdu' : ''}`}>
                <Users className="w-5 h-5 text-emerald-600" />
                <span>{isUrdu ? 'مرحلہ ۱: ہدف کسان منتخب کریں' : 'Step 1: Select Target Audience'}</span>
              </h3>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                {selectedRecipients.length} / {recipients.length} {isUrdu ? 'منتخب' : 'Selected'}
              </span>
            </div>

            {/* Audience Segments Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setAudienceType('all_farmers')}
                className={`p-3 rounded-xl text-xs font-bold border transition text-center ${
                  audienceType === 'all_farmers'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                👥 {isUrdu ? 'تمام کسان' : 'All Farmers'}
              </button>

              <button
                onClick={() => setAudienceType('debtors_only')}
                className={`p-3 rounded-xl text-xs font-bold border transition text-center ${
                  audienceType === 'debtors_only'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                ⚠️ {isUrdu ? 'صرف بقایا ادھار' : 'Debtors Only'}
              </button>

              <button
                onClick={() => setAudienceType('village')}
                className={`p-3 rounded-xl text-xs font-bold border transition text-center ${
                  audienceType === 'village'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                🏡 {isUrdu ? 'چک / علاقہ وائز' : 'By Village'}
              </button>

              <button
                onClick={() => setAudienceType('crop_farmers')}
                className={`p-3 rounded-xl text-xs font-bold border transition text-center ${
                  audienceType === 'crop_farmers'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                🌾 {isUrdu ? 'فصل کے لحاظ سے' : 'By Crop'}
              </button>
            </div>

            {/* Village Filter dropdown if village selected */}
            {audienceType === 'village' && (
              <div className="pt-2 animate-in fade-in">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isUrdu ? 'چک / موزہ منتخب کریں:' : 'Select Village / Chak:'}
                </label>
                <Select value={selectedVillage} onValueChange={setSelectedVillage}>
                  <SelectTrigger className="w-full bg-slate-50 border-slate-300 text-sm h-[42px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 z-[120]">
                    <SelectItem value="all">{isUrdu ? 'تمام چکس' : 'All Villages'}</SelectItem>
                    {stats.villages.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Crop Filter dropdown if crop selected */}
            {audienceType === 'crop_farmers' && (
              <div className="pt-2 animate-in fade-in">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isUrdu ? 'فصل منتخب کریں:' : 'Select Crop:'}
                </label>
                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger className="w-full bg-slate-50 border-slate-300 text-sm h-[42px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 z-[120]">
                    <SelectItem value="all">{isUrdu ? 'تمام فصلیں' : 'All Crops'}</SelectItem>
                    <SelectItem value="wheat">🌾 گندم (Wheat)</SelectItem>
                    <SelectItem value="cotton">☁️ کپاس (Cotton)</SelectItem>
                    <SelectItem value="rice">🌱 دھان / چاول (Rice)</SelectItem>
                    <SelectItem value="maize">🌽 مکئی (Maize/Corn)</SelectItem>
                    <SelectItem value="potato">🥔 آلو (Potato)</SelectItem>
                    <SelectItem value="sugarcane">🎋 کماد (Sugarcane)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Selected stats summary bar */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                {isUrdu ? 'منتخب شدہ کسانوں کا کل ادھار:' : 'Total Debt of Selected Farmers:'}
              </span>
              <span className="font-mono font-black text-rose-600 text-sm">
                {formatCurrency(selectedTotalBalance)}
              </span>
            </div>
          </div>

          {/* Step 2: Message & Template Composer */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className={`text-base font-bold text-slate-900 flex items-center gap-2 ${isUrdu ? 'font-urdu' : ''}`}>
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>{isUrdu ? 'مرحلہ ۲: پیغام اور ٹیمپلیٹ تیار کریں' : 'Step 2: Compose Broadcast Message'}</span>
              </h3>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setChannel('whatsapp')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    channel === 'whatsapp' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => setChannel('sms')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    channel === 'sms' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  SMS
                </button>
                <button
                  onClick={() => setChannel('both')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    channel === 'both' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Both
                </button>
              </div>
            </div>

            {/* Campaign Subject / Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isUrdu ? 'مہم کا عنوان / شناخت*' : 'Campaign Title / Subject*'}
              </label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                placeholder={isUrdu ? 'مثلاً: سونا یوریا نیا سٹاک آمد' : 'e.g. Sona Urea Arrival Alert'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Quick Template Selector Chips */}
            <div>
              <span className="block text-xs font-semibold text-slate-600 mb-2">
                {isUrdu ? 'تیار شدہ زرعی ٹیمپلیٹس (1-Click Load):' : 'Pre-built Agri Message Templates:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEFAULT_BROADCAST_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.key}
                    onClick={() => handleSelectTemplate(tmpl as any)}
                    className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition ${
                      selectedTemplateKey === tmpl.key
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-slate-50/60 hover:bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{tmpl.icon}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate">
                        {isUrdu ? tmpl.titleUrdu : tmpl.title}
                      </span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {tmpl.defaultUrdu}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Variable Pills to insert in text */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-600">
                  {isUrdu ? 'خودکار ویری ایبلز (کلک کر کے شامل کریں):' : 'Insert Dynamic Personalization:'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isUrdu ? 'ہر کسان کے نام اور ادھار سے تبدیل ہوگا' : 'Auto-replaced per farmer'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => insertVariable('{کِسان کا نام}')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition"
                >
                  + {'{کِسان کا نام}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('{بقایا ادھار}')}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200 transition"
                >
                  + {'{بقایا ادھار}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('{چک/موزہ}')}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition"
                >
                  + {'{چک/موزہ}'}
                </button>
                <button
                  type="button"
                  onClick={() => insertVariable('{دکان کا نام}')}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 transition"
                >
                  + {'{دکان کا نام}'}
                </button>
              </div>
            </div>

            {/* Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  {isUrdu ? 'پیغام کی عبارت*' : 'Message Body (Urdu / English)*'}
                </label>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  <span>{charCount} chars</span>
                  <span>•</span>
                  <span>{smsSegments} SMS</span>
                </div>
              </div>
              <textarea
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                dir="rtl"
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm leading-relaxed text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-sans"
                placeholder={isUrdu ? 'یہاں پیغام کی تفصیل لکھیں...' : 'Write broadcast announcement...'}
              />
            </div>

            {/* Save & Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={copyMessage}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? (isUrdu ? 'عبارت کاپی ہو گئی' : 'Copied') : isUrdu ? 'عبارت کاپی' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveCampaign}
                disabled={isSavingCampaign || !messageText.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                {isSavingCampaign ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isUrdu ? 'مہم ریکارڈ و محفوظ کریں' : 'Save Broadcast Record'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: WhatsApp Mobile Preview & Quick Launch Queue */}
        <div className="lg:col-span-5 space-y-6">
          {/* Phone Preview Bubble */}
          <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-300">
                  {isUrdu ? 'موبائل واٹس ایپ پیش منظر (Live Preview)' : 'Live WhatsApp Preview'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">AgriBroadcast</span>
            </div>

            {/* WhatsApp Chat Bubble */}
            <div className="py-4">
              <div className="bg-[#0b141a] p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold border-b border-slate-800 pb-1.5">
                  <Sprout className="w-4 h-4" />
                  <span>پنجاب کھاد ایجنسی (آفیشل)</span>
                </div>
                <div
                  dir="rtl"
                  className="bg-[#005c4b] text-white p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm font-sans whitespace-pre-wrap"
                >
                  {messageText
                    .replace(/\{کِسان کا نام\}|\{name\}/gi, 'چوہدری نذیر احمد')
                    .replace(/\{چک\/موزہ\}|\{village\}/gi, 'چک 45/12L')
                    .replace(/\{بقایا ادھار\}|\{balance\}/gi, 'Rs. 345,000')
                    .replace(/\{دکان کا نام\}|\{shop\}/gi, 'پنجاب کھاد ایجنسی')}
                  <span className="block text-[10px] text-emerald-200 text-left mt-1.5 font-mono">
                    12:30 PM ✓✓
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              {isUrdu
                ? 'کسان کے موبائل پر نام اور بقایا رقم خود بخود تبدیل ہو کر موصول ہوگی'
                : 'Variables are dynamically replaced with actual customer data.'}
            </p>
          </div>

          {/* Quick Stats on Queue */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">
                {isUrdu ? 'ارسال کے لیے تیار کسان:' : 'Target Farmers in Queue:'}
              </span>
              <span className="text-xl font-black font-mono text-slate-900">
                {selectedRecipients.length}{' '}
                <span className="text-xs font-normal text-slate-400">/ {recipients.length}</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">
                {isUrdu ? 'ارسال شدہ اسٹیٹس:' : 'Sent via 1-Click:'}
              </span>
              <span className="text-base font-bold font-mono text-emerald-600">
                {Object.keys(sentMap).length} {isUrdu ? 'مکمل' : 'Sent'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Recipients Interactive Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className={`text-base font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'کسان وصول کنندگان کی لسٹ و ڈائریکٹ لنک' : 'Recipients Queue & 1-Click WhatsApp Launch'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu
                ? 'ہر کسان کے سامنے واٹس ایپ بٹن دبا کر فوری پیغام ارسال کریں'
                : 'Click WhatsApp button next to any farmer to launch pre-filled message instantly.'}
            </p>
          </div>

          {/* Search Input & Select All */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isUrdu ? 'کسان، فون یا چک تلاش کریں...' : 'Search farmer or village...'}
                className="pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 text-xs w-48 sm:w-60 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={() => toggleSelectAll(selectedRecipients.length !== recipients.length)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              {selectedRecipients.length === recipients.length
                ? isUrdu
                  ? 'سب ان سلیکٹ کریں'
                  : 'Deselect All'
                : isUrdu
                ? 'سب منتخب کریں'
                : 'Select All'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4 w-10 text-center">✓</th>
                <th className="py-3 px-4">{isUrdu ? 'زمیندار کا نام' : 'Farmer Name'}</th>
                <th className="py-3 px-4">{isUrdu ? 'موبائل نمبر' : 'Phone'}</th>
                <th className="py-3 px-4">{isUrdu ? 'چک / موزہ' : 'Village'}</th>
                <th className="py-3 px-4">{isUrdu ? 'موجودہ فصل' : 'Crop'}</th>
                <th className="py-3 px-4 text-right">{isUrdu ? 'واجب الادا ادھار' : 'Khata Balance'}</th>
                <th className="py-3 px-4 text-center">{isUrdu ? 'براہِ راست ارسال' : '1-Click Send'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {isLoadingRecipients ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    <p className="text-xs font-semibold">{isUrdu ? 'کسان لسٹ لوڈ ہو رہی ہے...' : 'Loading recipient list...'}</p>
                  </td>
                </tr>
              ) : displayedRecipients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs font-semibold">
                    {isUrdu ? 'کوئی کسان نہیں ملا' : 'No matching farmers found.'}
                  </td>
                </tr>
              ) : (
                displayedRecipients.map((farmer) => {
                  const isSent = !!sentMap[farmer.id];
                  return (
                    <tr
                      key={farmer.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        farmer.selected ? '' : 'opacity-50 bg-slate-50/40'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={farmer.selected}
                          onChange={() => toggleSelectRecipient(farmer.id)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {farmer.name}
                        {farmer.fatherName && (
                          <span className="block text-[11px] font-normal text-slate-400">
                            {isUrdu ? `ولد: ${farmer.fatherName}` : `S/O: ${farmer.fatherName}`}
                          </span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {farmer.phone}
                      </td>

                      {/* Village */}
                      <td className="py-3 px-4 text-slate-600">
                        {farmer.village}
                      </td>

                      {/* Crop */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                          {farmer.currentCrop || 'گندم و مکئی'}
                        </span>
                      </td>

                      {/* Balance */}
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={farmer.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                          {farmer.balance > 0 ? formatCurrency(farmer.balance) : 'Rs. 0 (صاف)'}
                        </span>
                      </td>

                      {/* 1-Click Action Buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* WhatsApp Button */}
                          <button
                            type="button"
                            onClick={() => handleMarkSent(farmer.id, farmer.whatsappLink)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs ${
                              isSent
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                            title={isUrdu ? 'واٹس ایپ پر پیغام بھیجیں' : 'Send WhatsApp Message'}
                          >
                            {isSent ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <Send className="w-3.5 h-3.5" />}
                            <span>{isSent ? (isUrdu ? 'ارسال شدہ' : 'Sent') : 'WhatsApp'}</span>
                          </button>

                          {/* SMS URI Link */}
                          {farmer.smsUri && (
                            <a
                              href={farmer.smsUri}
                              className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                              title={isUrdu ? 'بذریعہ موبائل ایس ایم ایس بھیجیں' : 'Send Normal SMS'}
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Past Campaigns History */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-base font-bold text-slate-900 ${isUrdu ? 'font-urdu' : ''}`}>
              {isUrdu ? 'سابقہ براڈکاسٹ پیغامات کی ہسٹری' : 'Broadcast Campaigns History'}
            </h3>
            <p className="text-xs text-slate-500">
              {isUrdu ? 'پہلے ارسال کردہ مہمات اور ان کی تاریخ' : 'Record of past announcements sent to farmers.'}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono">
            {campaigns.length} Recorded
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((cmp) => (
            <div
              key={cmp.id}
              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 truncate">
                  {cmp.title}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase font-mono">
                  {cmp.channel}
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200/60 font-sans" dir="rtl">
                {cmp.messageText}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {cmp.createdAt ? new Date(cmp.createdAt).toLocaleDateString('en-GB') : 'Recently'}
                </span>
                <span className="font-bold text-emerald-700">
                  {cmp.totalRecipients} {isUrdu ? 'کسانوں کو ارسال' : 'Recipients'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

