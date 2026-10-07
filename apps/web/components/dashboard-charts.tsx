'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Package,
  Sparkles,
  Box,
} from 'lucide-react';
import { useLanguage } from '../lib/language-context';

// 1. Weekly Sales & Khata Data
const WEEKLY_SALES_DATA_EN = [
  { day: 'Mon', cash: 140000, credit: 95000, bags: 55 },
  { day: 'Tue', cash: 210000, credit: 130000, bags: 78 },
  { day: 'Wed', cash: 185000, credit: 110000, bags: 64 },
  { day: 'Thu', cash: 290000, credit: 165000, bags: 102 },
  { day: 'Fri', cash: 320000, credit: 190000, bags: 115 },
  { day: 'Sat', cash: 410000, credit: 240000, bags: 148 },
  { day: 'Sun', cash: 285400, credit: 155000, bags: 96 },
];

const WEEKLY_SALES_DATA_UR = [
  { day: 'پیر', cash: 140000, credit: 95000, bags: 55 },
  { day: 'منگل', cash: 210000, credit: 130000, bags: 78 },
  { day: 'بدھ', cash: 185000, credit: 110000, bags: 64 },
  { day: 'جمعرات', cash: 290000, credit: 165000, bags: 102 },
  { day: 'جمعہ', cash: 320000, credit: 190000, bags: 115 },
  { day: 'ہفتہ', cash: 410000, credit: 240000, bags: 148 },
  { day: 'اتوار', cash: 285400, credit: 155000, bags: 96 },
];

// 2. Fertilizer Category Share Data (Pie Chart)
const FERTILIZER_PIE_DATA = [
  {
    nameEn: 'Sona Urea (یوریا)',
    nameUr: 'سونا یوریا کھاد',
    value: 42,
    bags: 640,
    color: '#059669', // Emerald
  },
  {
    nameEn: 'Engro DAP (ڈی اے پی)',
    nameUr: 'اینگرو ڈی اے پی',
    value: 28,
    bags: 420,
    color: '#0284c7', // Sky Blue
  },
  {
    nameEn: 'SOP Potash (پوٹاش)',
    nameUr: 'پوٹاش کھاد (SOP)',
    value: 16,
    bags: 240,
    color: '#d97706', // Amber
  },
  {
    nameEn: 'Sprays & Seeds (سپرے)',
    nameUr: 'زرعی ادویات و بیج',
    value: 14,
    bags: 210,
    color: '#7c3aed', // Violet
  },
];

// 3D Cylinder Extrusion Layers for Fertilizer Share Chart
const DEPTH_LAYERS = [
  {
    z: -16,
    opacity: 0.6,
    colors: ['#022c22', '#082f49', '#451a03', '#2e1065'], // deepest base
  },
  {
    z: -12,
    opacity: 0.75,
    colors: ['#064e3b', '#075985', '#78350f', '#4c1d95'], // lower cylinder rim
  },
  {
    z: -8,
    opacity: 0.9,
    colors: ['#047857', '#0369a1', '#b45309', '#6d28d9'], // mid cylinder rim
  },
  {
    z: -4,
    opacity: 0.95,
    colors: ['#059669', '#0284c7', '#d97706', '#7c3aed'], // upper cylinder rim
  },
];

// 3. Monthly Farmer Recovery vs New Credit (Bar Chart)
const MONTHLY_RECOVERY_DATA_EN = [
  { month: 'May', recovery: 1850000, newCredit: 2100000 },
  { month: 'Jun', recovery: 2400000, newCredit: 2300000 },
  { month: 'Jul', recovery: 2150000, newCredit: 1950000 },
  { month: 'Aug', recovery: 2900000, newCredit: 2600000 },
  { month: 'Sep', recovery: 3200000, newCredit: 2800000 },
  { month: 'Oct', recovery: 1420000, newCredit: 1150000 },
];

const MONTHLY_RECOVERY_DATA_UR = [
  { month: 'مئی', recovery: 1850000, newCredit: 2100000 },
  { month: 'جون', recovery: 2400000, newCredit: 2300000 },
  { month: 'جولائی', recovery: 2150000, newCredit: 1950000 },
  { month: 'اگست', recovery: 2900000, newCredit: 2600000 },
  { month: 'ستمبر', recovery: 3200000, newCredit: 2800000 },
  { month: 'اکتوبر', recovery: 1420000, newCredit: 1150000 },
];

// 4. Top Fast Moving Fertilizers
const TOP_FERTILIZERS = [
  {
    nameEn: 'Sona Urea 50kg (FFC)',
    nameUr: 'سونا یوریا (ایف ایف سی)',
    sold: 480,
    stock: 215,
    target: 500,
    pct: 96,
    color: '#059669',
  },
  {
    nameEn: 'Engro Zorawar DAP 50kg',
    nameUr: 'اینگرو زورآور ڈی اے پی',
    sold: 310,
    stock: 84,
    target: 350,
    pct: 88,
    color: '#0284c7',
  },
  {
    nameEn: 'Sarsabz CAN Gwarah 50kg',
    nameUr: 'سرسبز کین گوارا کھاد',
    sold: 195,
    stock: 140,
    target: 250,
    pct: 78,
    color: '#d97706',
  },
  {
    nameEn: 'Fauji SOP Potash 50kg',
    nameUr: 'فوجی پوٹاش (SOP)',
    sold: 135,
    stock: 45,
    target: 180,
    pct: 75,
    color: '#dc2626',
  },
  {
    nameEn: 'Belt Expert 100ml (Bayer)',
    nameUr: 'بیلٹ ایکسپرٹ کیڑے مار سپرے',
    sold: 95,
    stock: 60,
    target: 120,
    pct: 79,
    color: '#7c3aed',
  },
];

// Custom Tooltip for Line/Area Chart
function CustomSalesTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const cash = payload.find((p: any) => p.dataKey === 'cash')?.value || 0;
    const credit = payload.find((p: any) => p.dataKey === 'credit')?.value || 0;
    const total = cash + credit;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[190px]">
        <p className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-emerald-400 font-mono text-[11px]">Rs. {total.toLocaleString()}</span>
        </p>
        <div className="flex items-center justify-between text-emerald-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            نقد (Cash):
          </span>
          <span className="font-mono font-bold">Rs. {cash.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-amber-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            ادھار (Credit):
          </span>
          <span className="font-mono font-bold">Rs. {credit.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
}

// Custom Tooltip for Recovery Bar Chart
function CustomRecoveryTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const recovery = payload.find((p: any) => p.dataKey === 'recovery')?.value || 0;
    const newCredit = payload.find((p: any) => p.dataKey === 'newCredit')?.value || 0;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[200px]">
        <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">
          {label} کا ماہانہ کھاتہ
        </p>
        <div className="flex items-center justify-between text-emerald-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            کسانوں سے وصولی:
          </span>
          <span className="font-mono font-bold">Rs. {recovery.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-rose-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            نیا ادھار دیا گیا:
          </span>
          <span className="font-mono font-bold">Rs. {newCredit.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
}

export function DashboardCharts() {
  const { isUrdu } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove3D = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!is3D) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 24; // -12 to +12 deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -18; // -9 to +9 deg
    setMouseTilt({ x, y });
  };

  const handleMouseLeave3D = () => {
    setMouseTilt({ x: 0, y: 0 });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        <div className="h-[360px] bg-slate-100 rounded-2xl" />
        <div className="h-[360px] bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  const weeklyData = isUrdu ? WEEKLY_SALES_DATA_UR : WEEKLY_SALES_DATA_EN;
  const monthlyData = isUrdu ? MONTHLY_RECOVERY_DATA_UR : MONTHLY_RECOVERY_DATA_EN;

  return (
    <div className="space-y-6">
      {/* ========================================================
          UPPER ROW: 7-Day Trend (Area/Line) + Fertilizer Share (Pie)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: 7-Day Revenue Trend (Line & Area Chart) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3c3b3f 0%, #605c3c 100%)',
            color: '#ffffff',
          }}
          className="lg:col-span-7 rounded-2xl p-6 shadow-lg border border-white/10 hover:shadow-xl transition"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-white/10 text-emerald-400 backdrop-blur-md border border-white/10">
                  <TrendingUp className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    {isUrdu ? 'ہفتہ وار فروخت کا گراف (نقد بنام ادھار)' : '7-Day Sales Trend (Cash vs Credit)'}
                  </h3>
                  <p className="text-xs text-white/80">
                    {isUrdu ? 'گزشتہ 7 دنوں میں دکان پر نقد وصولی اور ادھار کا تقابل' : 'Daily cash and credit transactions'}
                  </p>
                </div>
              </div>
            </div>

            {/* Badges / Legend Indicator */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {isUrdu ? 'نقد وصولی' : 'Cash'}
              </span>
              <span className="flex items-center gap-1.5 text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {isUrdu ? 'ادھار بکنگ' : 'Credit'}
              </span>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="creditGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.12)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="rgba(255, 255, 255, 0.75)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
                />
                <YAxis
                  stroke="rgba(255, 255, 255, 0.75)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `Rs.${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomSalesTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cash"
                  stroke="#34d399"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#cashGradient)"
                  name={isUrdu ? 'نقد' : 'Cash'}
                  isAnimationActive={true}
                  animationDuration={1200}
                />
                <Area
                  type="monotone"
                  dataKey="credit"
                  stroke="#fbbf24"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#creditGradient)"
                  name={isUrdu ? 'ادھار' : 'Credit'}
                  isAnimationActive={true}
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Fertilizer Category Sales Share (Donut / 3D Isometric Cylinder Chart) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0f3443 0%, #34e89e 100%)',
            color: '#ffffff',
          }}
          className="lg:col-span-5 rounded-2xl p-6 shadow-lg border border-white/10 hover:shadow-xl transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-white/15 text-white backdrop-blur-md border border-white/10">
                <PieIcon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-white text-base">
                  {isUrdu ? 'کھاد کی کیٹگری وار فروخت' : 'Fertilizer Category Share'}
                </h3>
                <p className="text-xs text-white/80">
                  {isUrdu ? 'یوریا، ڈی اے پی و دیگر کھادوں کا شیئر' : 'Volume share by product category'}
                </p>
              </div>
            </div>

            {/* 3D / 2D Toggle Switch & Bag Count */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIs3D(!is3D)}
                className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                  is3D
                    ? 'bg-white text-slate-900 border-white shadow-emerald-950/20 font-black'
                    : 'bg-white/15 text-white/90 border-white/20 hover:bg-white/25'
                }`}
                title={isUrdu ? '3D / 2D ویو تبدیل کریں' : 'Toggle 3D / 2D View'}
              >
                <Box className={`w-3.5 h-3.5 transition-transform ${is3D ? 'rotate-12 text-emerald-600' : ''}`} />
                <span>{is3D ? '3D View' : '2D View'}</span>
              </button>
              <span className="text-xs font-mono font-bold bg-white/15 text-white backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full">
                1,510 {isUrdu ? 'بوریاں' : 'Bags'}
              </span>
            </div>
          </div>

          {/* 3D Isometric Donut Stage */}
          <div
            onMouseMove={handleMouseMove3D}
            onMouseLeave={handleMouseLeave3D}
            className="relative h-[225px] w-full flex items-center justify-center select-none overflow-visible"
            style={{
              perspective: is3D ? '900px' : 'none',
            }}
          >
            {/* The 3D Rotator Wrapper */}
            <div
              className="relative w-[260px] h-[210px] flex items-center justify-center"
              style={{
                transformStyle: 'preserve-3d',
                transform: is3D
                  ? `rotateX(${50 + mouseTilt.y}deg) rotateZ(${-14 + mouseTilt.x}deg) scale(0.96)`
                  : 'rotateX(0deg) rotateZ(0deg) scale(1)',
                transition:
                  mouseTilt.x === 0 && mouseTilt.y === 0
                    ? 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    : 'transform 0.12s ease-out',
              }}
            >
              {/* 3D Realistic Ground Drop Shadow */}
              {is3D && (
                <div
                  className="absolute w-[220px] h-[150px] rounded-[50%] bg-black/45 blur-xl pointer-events-none transition-transform duration-300"
                  style={{
                    transform: 'translateZ(-28px) translateY(20px) scaleY(0.72)',
                  }}
                />
              )}

              {/* 3D Cylinder Extrusion Layers (Side Walls) */}
              {is3D &&
                DEPTH_LAYERS.map((layer, lIdx) => (
                  <div
                    key={`depth-layer-${lIdx}`}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{
                      transform: `translateZ(${layer.z}px)`,
                      opacity: layer.opacity,
                    }}
                    aria-hidden="true"
                  >
                    <PieChart width={260} height={210}>
                      <Pie
                        data={FERTILIZER_PIE_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={86}
                        paddingAngle={3}
                        dataKey="value"
                        isAnimationActive={false}
                      >
                        {FERTILIZER_PIE_DATA.map((_, index) => (
                          <Cell
                            key={`depth-cell-${lIdx}-${index}`}
                            fill={layer.colors[index % layer.colors.length]}
                            stroke="transparent"
                            strokeWidth={0}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </div>
                ))}

              {/* Top Face (Interactive Recharts Pie with Tooltip) */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: 'translateZ(0px)',
                }}
              >
                <PieChart width={260} height={210}>
                  <Tooltip
                    formatter={(value: any, name: any, item: any) => [
                      `${value}% (${item.payload.bags} ${isUrdu ? 'بوریاں' : 'Bags'})`,
                      isUrdu ? item.payload.nameUr : item.payload.nameEn,
                    ]}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    }}
                  />
                  <Pie
                    data={FERTILIZER_PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={86}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={true}
                    animationDuration={1200}
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                    onMouseLeave={() => setActivePieIndex(null)}
                  >
                    {FERTILIZER_PIE_DATA.map((entry, index) => (
                      <Cell
                        key={`top-cell-${index}`}
                        fill={entry.color}
                        stroke={activePieIndex === index ? '#ffffff' : 'rgba(255, 255, 255, 0.25)'}
                        strokeWidth={activePieIndex === index ? 3 : 1.5}
                        className="transition-all duration-300 cursor-pointer"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </div>

              {/* Floating Center 3D Holographic Core */}
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300"
                style={{
                  transform: is3D ? 'translateZ(26px)' : 'none',
                }}
              >
                <div className="w-[82px] h-[82px] rounded-full bg-slate-900/85 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col items-center justify-center text-center p-1 transition-all duration-200">
                  <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider truncate max-w-[72px]">
                    {activePieIndex !== null && FERTILIZER_PIE_DATA[activePieIndex]
                      ? (isUrdu ? FERTILIZER_PIE_DATA[activePieIndex]?.nameUr : FERTILIZER_PIE_DATA[activePieIndex]?.nameEn)
                      : (isUrdu ? 'ٹاپ کھاد' : 'Top Share')}
                  </span>
                  <span className="text-base font-black text-white font-mono leading-tight">
                    {activePieIndex !== null && FERTILIZER_PIE_DATA[activePieIndex]
                      ? `${FERTILIZER_PIE_DATA[activePieIndex]?.value}%`
                      : '42%'}
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-200/90 truncate max-w-[72px]">
                    {activePieIndex !== null && FERTILIZER_PIE_DATA[activePieIndex]
                      ? `${FERTILIZER_PIE_DATA[activePieIndex]?.bags} ${isUrdu ? 'بوریاں' : 'Bags'}`
                      : (isUrdu ? 'سونا یوریا' : 'Urea')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Interactive Legend Badges */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/15">
            {FERTILIZER_PIE_DATA.map((item, i) => (
              <div
                key={i}
                onMouseEnter={() => setActivePieIndex(i)}
                onMouseLeave={() => setActivePieIndex(null)}
                className={`flex items-center justify-between p-2 rounded-xl backdrop-blur-md border text-xs text-white transition-all cursor-pointer ${
                  activePieIndex === i
                    ? 'bg-white/25 border-white/40 shadow-md scale-[1.02]'
                    : 'bg-white/15 border-white/10 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform"
                    style={{
                      backgroundColor: item.color,
                      transform: activePieIndex === i ? 'scale(1.3)' : 'scale(1)',
                    }}
                  />
                  <span className="font-semibold text-white truncate">
                    {isUrdu ? item.nameUr : item.nameEn}
                  </span>
                </div>
                <span className="font-mono font-black text-emerald-200 flex-shrink-0">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================
          LOWER ROW: Monthly Recovery vs Credit (Bar) + Top Sellers
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 3: Monthly Farmer Recovery vs New Credit (Grouped Bar Chart) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <BarChart3 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {isUrdu ? 'ماہانہ کھاتہ: وصولی بمقابلہ نیا ادھار' : 'Monthly Recovery vs New Credit'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isUrdu ? 'کسانوں سے واپس آنے والی رقم بمقابلہ جاری کردہ نیا ادھار' : 'Khata collection rate vs new credit issued'}
                </p>
              </div>
            </div>

            {/* Badges / Legend */}
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {isUrdu ? 'وصولی (Recovery)' : 'Recovery'}
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {isUrdu ? 'نیا ادھار (New Credit)' : 'New Credit'}
              </span>
            </div>
          </div>

          {/* Bar Chart Canvas */}
          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `Rs.${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip content={<CustomRecoveryTooltip />} />
                <Bar
                  dataKey="recovery"
                  name={isUrdu ? 'وصولی' : 'Recovery'}
                  fill="#059669"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1200}
                />
                <Bar
                  dataKey="newCredit"
                  name={isUrdu ? 'نیا ادھار' : 'New Credit'}
                  fill="#e11d48"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Top Fast Selling Fertilizers with Progress Bars */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <Package className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {isUrdu ? 'ٹاپ فروخت کھادیں (ماہانہ ڈیمانڈ)' : 'Top Moving Fertilizers'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isUrdu ? 'زیادہ بکنے والی کھادیں اور موجودہ اسٹاک' : 'Highest velocity products & godown stock'}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {isUrdu ? 'فعال سیزن' : 'Rabi Season'}
            </span>
          </div>

          {/* List of Progress Bars */}
          <div className="space-y-3.5">
            {TOP_FERTILIZERS.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate">
                    {isUrdu ? item.nameUr : item.nameEn}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono font-black text-slate-900">
                      {item.sold} {isUrdu ? 'فروخت' : 'Sold'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({isUrdu ? `باقی: ${item.stock}` : `Stock: ${item.stock}`})
                    </span>
                  </div>
                </div>

                {/* Animated Bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${item.pct}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Footnote */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{isUrdu ? 'گودام کپیسٹی: 85% فل' : 'Godown Capacity: 85% Full'}</span>
            <span className="font-semibold text-emerald-600">
              {isUrdu ? 'اسٹاک ویلیو: Rs. 1.84 کروڑ' : 'Stock Value: Rs. 18.4M'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
