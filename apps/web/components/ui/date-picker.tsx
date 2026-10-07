'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DatePickerProps {
  value?: string; // ISO string 'YYYY-MM-DD'
  onChange: (date: string) => void;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  popoverClassName?: string;
  required?: boolean;
  id?: string;
  minDate?: string;
  maxDate?: string;
}

const MONTH_NAMES_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Format YYYY-MM-DD into human readable date
 */
function formatDisplay(isoDate?: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = parseInt(parts[0] || '0', 10);
  const monthIdx = parseInt(parts[1] || '0', 10) - 1;
  const day = parseInt(parts[2] || '0', 10);

  if (isNaN(year) || isNaN(monthIdx) || isNaN(day) || monthIdx < 0 || monthIdx > 11) {
    return isoDate;
  }

  const dayStr = day < 10 ? `0${day}` : `${day}`;
  const monthStr = MONTH_NAMES_SHORT[monthIdx];
  return `${dayStr} ${monthStr} ${year}`;
}

/**
 * Format year, month (0-11), day into YYYY-MM-DD
 */
function toISODate(year: number, monthIdx: number, day: number): string {
  const m = monthIdx + 1 < 10 ? `0${monthIdx + 1}` : `${monthIdx + 1}`;
  const d = day < 10 ? `0${day}` : `${day}`;
  return `${year}-${m}-${d}`;
}

export function DatePicker({
  value,
  onChange,
  name,
  placeholder = 'تاریخ منتخب کریں...',
  disabled = false,
  className,
  popoverClassName,
  required = false,
  id,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'days' | 'months' | 'years'>('days');

  // Trigger element ref
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Parse initial active year/month
  const today = new Date();
  const initialDate = value ? new Date(value) : today;
  const [currentYear, setCurrentYear] = useState<number>(
    isNaN(initialDate.getFullYear()) ? today.getFullYear() : initialDate.getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    isNaN(initialDate.getMonth()) ? today.getMonth() : initialDate.getMonth()
  );

  // When value changes externally, sync current month/year
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0] || '0', 10);
        const m = parseInt(parts[1] || '0', 10) - 1;
        if (!isNaN(y) && !isNaN(m)) {
          setCurrentYear(y);
          setCurrentMonth(m);
        }
      }
    }
  }, [value]);

  // Position calculation for Portal Popover
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; placeAbove: boolean }>({
    top: 0,
    left: 0,
    width: 320,
    placeAbove: false,
  });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverHeight = 360; // approximate height of calendar
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceBelow < popoverHeight && rect.top > popoverHeight;

    const idealLeft =
      rect.left + 320 > window.innerWidth
        ? Math.max(12, rect.right - 320)
        : Math.max(12, rect.left);

    setCoords({
      top: placeAbove ? rect.top - popoverHeight - 6 : rect.bottom + 6,
      left: Math.min(idealLeft, window.innerWidth - 332),
      width: Math.max(300, rect.width),
      placeAbove,
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => updatePosition();
      window.addEventListener('resize', handleScrollOrResize);
      window.addEventListener('scroll', handleScrollOrResize, true);
      return () => {
        window.removeEventListener('resize', handleScrollOrResize);
        window.removeEventListener('scroll', handleScrollOrResize, true);
      };
    }
  }, [isOpen, updatePosition]);

  // Outside click listener
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
        setViewMode('days');
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Calendar Day Grid Calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      day: number;
      monthOffset: -1 | 0 | 1; // -1: prev month, 0: current, 1: next month
      dateString: string;
      isSelected: boolean;
      isToday: boolean;
    }> = [];

    const todayStr = toISODate(today.getFullYear(), today.getMonth(), today.getDate());

    // 1. Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = toISODate(prevYear, prevMonthIdx, dayNum);
      days.push({
        day: dayNum,
        monthOffset: -1,
        dateString: dateStr,
        isSelected: dateStr === value,
        isToday: dateStr === todayStr,
      });
    }

    // 2. Days of current month
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const dateStr = toISODate(currentYear, currentMonth, dayNum);
      days.push({
        day: dayNum,
        monthOffset: 0,
        dateString: dateStr,
        isSelected: dateStr === value,
        isToday: dateStr === todayStr,
      });
    }

    // 3. Trailing days for complete 35 or 42 grid
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = toISODate(nextYear, nextMonthIdx, dayNum);
      days.push({
        day: dayNum,
        monthOffset: 1,
        dateString: dateStr,
        isSelected: dateStr === value,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [currentYear, currentMonth, value, today]);

  // Handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSelectDate = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
    setViewMode('days');
  };

  const handleSelectToday = () => {
    const todayStr = toISODate(today.getFullYear(), today.getMonth(), today.getDate());
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    onChange(todayStr);
    setIsOpen(false);
    setViewMode('days');
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    setViewMode('days');
  };

  // Year Range for Year Selector
  const yearRange = useMemo(() => {
    const startYear = currentYear - 6;
    const years: number[] = [];
    for (let i = 0; i < 12; i++) {
      years.push(startYear + i);
    }
    return years;
  }, [currentYear]);

  return (
    <div className="relative w-full">
      {/* Hidden input for HTML forms and form state */}
      <input type="hidden" name={name} value={value || ''} required={required} />

      {/* 1. The Trigger Input Button */}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            updatePosition();
            setIsOpen((prev) => !prev);
            setViewMode('days');
          }
        }}
        className={cn(
          'w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl text-sm transition font-medium text-left select-none outline-none focus:ring-2 focus:ring-emerald-500',
          'bg-slate-800 border border-slate-700 text-white placeholder-slate-400 hover:border-slate-600',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'ring-2 ring-emerald-500 border-emerald-500',
          className
        )}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span
            className={cn(
              'truncate font-mono text-sm',
              value ? 'font-bold text-inherit' : 'text-slate-400 font-sans text-xs'
            )}
          >
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 text-slate-400">
          {value && !required && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-0.5 rounded-full hover:bg-slate-700 hover:text-white transition"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        </div>
      </button>

      {/* 2. Portal Popover Modal (MUI Style Dark Theme) */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: '320px',
              zIndex: 250,
            }}
            className={cn(
              'bg-slate-900 border border-slate-700/90 text-white rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150 select-none backdrop-blur-xl',
              popoverClassName
            )}
          >
            {/* Top Navigation & MUI Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              {/* Month & Year Title (Clickable like MUI DatePicker) */}
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'days' ? 'months' : 'days')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-white font-bold text-sm transition"
              >
                <span>
                  {MONTH_NAMES_EN[currentMonth]} {currentYear}
                </span>
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 text-emerald-400 transition-transform duration-200',
                    viewMode !== 'days' && 'rotate-180'
                  )}
                />
              </button>

              {/* Prev / Next Month Arrow Buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition active:scale-90"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition active:scale-90"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* VIEW 1: Standard Calendar Days Grid */}
            {viewMode === 'days' && (
              <div className="mt-3">
                {/* Week Day Names Header */}
                <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                  {DAY_NAMES.map((name, i) => (
                    <div
                      key={name}
                      className={cn(
                        'text-[11px] font-bold py-1',
                        i === 0 || i === 6 ? 'text-rose-400/80' : 'text-slate-400'
                      )}
                    >
                      {name}
                    </div>
                  ))}
                </div>

                {/* Days Grid (42 Cells) */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarDays.map((item, idx) => {
                    const isOtherMonth = item.monthOffset !== 0;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectDate(item.dateString)}
                        className={cn(
                          'h-8 w-8 mx-auto rounded-xl text-xs font-semibold flex items-center justify-center transition font-mono',
                          // Selected Day
                          item.isSelected
                            ? 'bg-emerald-600 text-white font-extrabold shadow-md shadow-emerald-600/40 ring-2 ring-emerald-400 scale-105'
                            : isOtherMonth
                            ? 'text-slate-600 hover:text-slate-400 hover:bg-slate-800/40'
                            : 'text-slate-200 hover:bg-slate-800 hover:text-white',
                          // Today's Day Indicator
                          item.isToday &&
                            !item.isSelected &&
                            'border border-emerald-500/70 text-emerald-400 font-bold'
                        )}
                      >
                        {item.day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 2: MUI Fast Month & Year Selector Grid */}
            {viewMode === 'months' && (
              <div className="mt-3 space-y-3">
                {/* Year Stepper Bar */}
                <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-800/80 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setCurrentYear((y) => y - 1)}
                    className="p-1 rounded-lg hover:bg-slate-700 text-slate-300"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-bold text-sm text-emerald-400">
                    {currentYear}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentYear((y) => y + 1)}
                    className="p-1 rounded-lg hover:bg-slate-700 text-slate-300"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 12 Months Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {MONTH_NAMES_SHORT.map((name, idx) => {
                    const isSelected = idx === currentMonth;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setCurrentMonth(idx);
                          setViewMode('days');
                        }}
                        className={cn(
                          'py-2 rounded-xl text-xs font-bold transition font-mono',
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                            : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white'
                        )}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Actions Footer */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={handleSelectToday}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 font-bold transition flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>آج (Today)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition"
                >
                  صاف کریں
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
                >
                  بند کریں
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
