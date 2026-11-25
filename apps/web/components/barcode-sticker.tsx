'use client';

import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';

/**
 * ISO/IEC 15417 Code 128B Encoding Table (Values 0..106)
 * Each pattern string represents alternating bar/space widths (1..4 units).
 */
const CODE128_PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
];

function encodeCode128B(input: string): { bars: Array<{ x: number; w: number }>; totalWidth: number } {
  const sanitized = (input || 'SKU-000')
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      return code >= 32 && code <= 126 ? ch : '-';
    })
    .join('');

  const START_B = 104;
  const STOP = 106;
  const codes: number[] = [START_B];
  let checksum = START_B;

  for (let i = 0; i < sanitized.length; i++) {
    const val = sanitized.charCodeAt(i) - 32;
    codes.push(val);
    checksum += val * (i + 1);
  }
  codes.push(checksum % 103);
  codes.push(STOP);

  const quietZone = 8;
  let cursor = quietZone;
  const bars: Array<{ x: number; w: number }> = [];

  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code] || CODE128_PATTERNS[0]!;
    for (let i = 0; i < pattern.length; i++) {
      const width = Number(pattern[i]);
      const isBar = i % 2 === 0;
      if (isBar) {
        bars.push({ x: cursor, w: width });
      }
      cursor += width;
    }
  }

  return { bars, totalWidth: cursor + quietZone };
}

export function Code128Barcode({
  value,
  height = 42,
  showText = true,
  className = '',
}: {
  value: string;
  height?: number;
  showText?: boolean;
  className?: string;
}) {
  const { bars, totalWidth } = useMemo(() => encodeCode128B(value), [value]);

  return (
    <div className={`flex flex-col items-center bg-white ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${height}`}
        className="w-full max-w-[200px]"
        style={{ height: `${height}px` }}
        preserveAspectRatio="none"
        aria-label={`Barcode ${value}`}
      >
        <rect x={0} y={0} width={totalWidth} height={height} fill="#ffffff" />
        {bars.map((bar, idx) => (
          <rect key={idx} x={bar.x} y={0} width={bar.w} height={height} fill="#000000" />
        ))}
      </svg>
      {showText && (
        <span className="text-[10px] font-mono font-bold tracking-widest text-slate-900 mt-0.5 select-all">
          {value}
        </span>
      )}
    </div>
  );
}

export function QrCodeSvg({
  value,
  size = 64,
  className = '',
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const [svgMarkup, setSvgMarkup] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toString(value || 'SKU-000', {
      type: 'svg',
      margin: 1,
      width: size,
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((svg) => {
        if (active) setSvgMarkup(svg);
      })
      .catch(() => {
        if (active) setSvgMarkup('');
      });
    return () => {
      active = false;
    };
  }, [value, size]);

  if (!svgMarkup) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-[9px] text-slate-400 ${className}`}
      >
        QR
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`bg-white flex-shrink-0 [&>svg]:w-full [&>svg]:h-full ${className}`}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}

export interface StickerProduct {
  id: string;
  name: string;
  urdu_name?: string;
  sku: string;
  company_name: string;
  unit: string;
  sale_price: number;
  batch_number?: string;
  expiry_date?: string;
  rack_location?: string;
}

export interface StickerOptions {
  mode: 'barcode' | 'qr' | 'both';
  showShopName: boolean;
  showPrice: boolean;
  showBatch: boolean;
  showRack: boolean;
  shopName?: string;
  isUrdu?: boolean;
}

export function ProductStickerCard({
  product,
  options,
  compact = false,
}: {
  product: StickerProduct;
  options: StickerOptions;
  compact?: boolean;
}) {
  const qrPayload = `${product.sku}|${product.name}|Rs.${product.sale_price}|${product.batch_number || 'STD'}`;

  return (
    <div
      className={`bg-white text-slate-950 border border-dashed border-slate-400 rounded-lg flex flex-col justify-between break-inside-avoid ${
        compact ? 'p-2 text-[10px]' : 'p-3 text-xs'
      }`}
    >
      {/* Top Shop & Brand Header */}
      <div className="border-b border-slate-200 pb-1 mb-1">
        {options.showShopName && (
          <div className="flex items-center justify-between text-[9px] font-bold text-emerald-800 uppercase tracking-tight">
            <span>{options.shopName || (options.isUrdu ? 'پنجاب کھاد ایجنسی' : 'Punjab Fertilizer Agency')}</span>
            <span className="text-slate-500 font-mono truncate max-w-[85px]">{product.company_name}</span>
          </div>
        )}
        <div className="font-extrabold text-slate-900 leading-tight truncate mt-0.5">
          {options.isUrdu && product.urdu_name ? product.urdu_name : product.name}
        </div>
      </div>

      {/* Middle: Barcode / QR Code */}
      <div className="flex items-center justify-center gap-2 py-1">
        {(options.mode === 'barcode' || options.mode === 'both') && (
          <div className="flex-1 min-w-0">
            <Code128Barcode
              value={product.sku}
              height={compact ? 30 : 38}
              showText={true}
            />
          </div>
        )}

        {(options.mode === 'qr' || options.mode === 'both') && (
          <QrCodeSvg value={qrPayload} size={compact ? 44 : 56} />
        )}
      </div>

      {options.mode === 'qr' && (
        <div className="text-center text-[9px] font-mono font-bold text-slate-800 -mt-0.5 mb-0.5">
          {product.sku}
        </div>
      )}

      {/* Bottom Price, Batch, Rack */}
      <div className="border-t border-slate-200 pt-1 mt-0.5 flex items-center justify-between gap-1 text-[9px]">
        <div className="flex flex-col min-w-0">
          {options.showBatch && (product.batch_number || product.expiry_date) && (
            <span className="font-mono text-slate-600 truncate">
              {product.batch_number ? `B:${product.batch_number}` : ''}
              {product.expiry_date ? ` E:${product.expiry_date}` : ''}
            </span>
          )}
          {options.showRack && product.rack_location && (
            <span className="text-slate-500 truncate">{product.rack_location}</span>
          )}
        </div>

        {options.showPrice && (
          <span className="font-mono font-black text-slate-950 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 flex-shrink-0 text-[11px]">
            Rs. {Number(product.sale_price || 0).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
