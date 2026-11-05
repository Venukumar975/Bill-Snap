import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  Globe, 
  ChevronRight, 
  ChevronLeft,
  ShoppingCart,
  ShoppingBag, 
  Utensils, 
  Zap, 
  Receipt, 
  Car, 
  Film, 
  HeartPulse, 
  Sparkles,
  PieChart
} from 'lucide-react';

// Category icon & color theme mapping (Aligned with HCI mental models)
const CATEGORY_STYLES = {
  Food: {
    icon: Utensils,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    barColor: 'bg-amber-500',
    hex: '#f59e0b'
  },
  Groceries: {
    icon: ShoppingCart,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    barColor: 'bg-emerald-500',
    hex: '#10b981'
  },
  Utilities: {
    icon: Zap,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
    barColor: 'bg-sky-500',
    hex: '#0ea5e9'
  },
  Shopping: {
    icon: ShoppingBag,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    barColor: 'bg-purple-500',
    hex: '#a855f7'
  },
  Travel: {
    icon: Car,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    barColor: 'bg-blue-500',
    hex: '#3b82f6'
  },
  // Alias for legacy bills
  Transport: {
    icon: Car,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    barColor: 'bg-blue-500',
    hex: '#3b82f6'
  },
  Health: {
    icon: HeartPulse,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    barColor: 'bg-teal-500',
    hex: '#14b8a6'
  },
  // Alias for legacy bills
  Healthcare: {
    icon: HeartPulse,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    barColor: 'bg-teal-500',
    hex: '#14b8a6'
  },
  Entertainment: {
    icon: Film,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    barColor: 'bg-indigo-500',
    hex: '#6366f1'
  },
  Other: {
    icon: Receipt,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    barColor: 'bg-slate-400',
    hex: '#94a3b8'
  }
};

function getCategoryStyle(category) {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES.Other;
}

export default function CategoryBreakdownModal({
  isOpen,
  onClose,
  bills = [],
  onSelectCategory,
  activeFilterCategory = null
}) {
  const [timeframe, setTimeframe] = useState('month'); // 'month' or 'all'
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current, -1 = last month, etc.

  // Target date based on month offset
  const activeDate = useMemo(() => {
    const d = new Date();
    d.setDate(1); // prevent 31st overflow bug
    d.setMonth(d.getMonth() + monthOffset);
    return d;
  }, [monthOffset]);

  // Formatted active month label (e.g. "November 2026")
  const activeMonthLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(activeDate);
  }, [activeDate]);

  const isCurrentMonth = monthOffset === 0;

  // Filter bills by timeframe & active month
  const filteredBills = useMemo(() => {
    if (timeframe === 'all') return bills;

    const targetYear = activeDate.getFullYear();
    const targetMonth = activeDate.getMonth(); // 0-indexed

    return bills.filter((b) => {
      // Check date string first
      if (b.date) {
        // Handle YYYY-MM-DD
        const parts = b.date.split('-');
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          if (y === targetYear && m === targetMonth) return true;
        }
        // Handle DD/MM/YYYY
        const slashParts = b.date.split('/');
        if (slashParts.length === 3) {
          const y = parseInt(slashParts[2], 10);
          const m = parseInt(slashParts[1], 10) - 1;
          if (y === targetYear && m === targetMonth) return true;
        }
      }

      // Fallback to createdAt or savedAt timestamp
      const timestamp = b.savedAt || b.createdAt;
      if (timestamp) {
        const d = new Date(timestamp);
        if (d.getFullYear() === targetYear && d.getMonth() === targetMonth) {
          return true;
        }
      }

      return false;
    });
  }, [bills, timeframe, activeDate]);

  // Aggregate spending by category
  const { totalSpend, primaryCurrency, categoriesData } = useMemo(() => {
    let total = 0;
    const catMap = {};

    filteredBills.forEach((b) => {
      const amt = Number(b.totalAmount) || 0;
      total += amt;
      const cat = b.category || 'Other';
      if (!catMap[cat]) {
        catMap[cat] = {
          category: cat,
          totalAmount: 0,
          count: 0
        };
      }
      catMap[cat].totalAmount += amt;
      catMap[cat].count += 1;
    });

    const categoriesArray = Object.values(catMap).map((item) => ({
      ...item,
      percentage: total > 0 ? (item.totalAmount / total) * 100 : 0
    }));

    // Sort by highest spending first
    categoriesArray.sort((a, b) => b.totalAmount - a.totalAmount);

    const currency = filteredBills[0]?.currency || bills[0]?.currency || '₹';

    return {
      totalSpend: total,
      primaryCurrency: currency,
      categoriesData: categoriesArray
    };
  }, [filteredBills, bills]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Dimmed Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Bottom Sheet Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[88vh] z-10 overflow-hidden animate-slide-up border border-slate-200/80">
        
        {/* Drag Handle Bar */}
        <div className="w-full flex justify-center pt-2.5 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-200" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">Spending by Category</h2>
              <p className="text-[10px] text-slate-400 font-medium">Monthly spending breakdown</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-3.5 space-y-4">
          
          {/* Timeframe Toggle Pills */}
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setTimeframe('month')}
              className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                timeframe === 'month'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>This Month</span>
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`flex-1 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                timeframe === 'all'
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>All Time ({bills.length})</span>
            </button>
          </div>

          {/* Aggregate Spending Card for Selected Period */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-1">
              {timeframe === 'month' ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setMonthOffset((prev) => prev - 1)}
                    className="w-5 h-5 rounded-md hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 flex items-center justify-center transition active:scale-90"
                    title="Previous month"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    {activeMonthLabel}
                  </span>
                  <button
                    onClick={() => setMonthOffset((prev) => prev + 1)}
                    disabled={isCurrentMonth}
                    className="w-5 h-5 rounded-md hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 disabled:opacity-25 disabled:pointer-events-none flex items-center justify-center transition active:scale-90"
                    title="Next month"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {!isCurrentMonth && (
                    <button
                      onClick={() => setMonthOffset(0)}
                      className="text-[10px] font-bold text-indigo-600 hover:underline ml-0.5"
                    >
                      (Today)
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Recorded Spending
                </span>
              )}
              <span className="text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
                {filteredBills.length} {filteredBills.length === 1 ? 'bill' : 'bills'}
              </span>
            </div>

            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {primaryCurrency} {totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            {/* Multi-colored Segmented Proportion Bar */}
            {totalSpend > 0 && categoriesData.length > 0 && (
              <div className="mt-3">
                <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex">
                  {categoriesData.map((cat) => {
                    const style = getCategoryStyle(cat.category);
                    return (
                      <div
                        key={cat.category}
                        style={{ width: `${cat.percentage}%` }}
                        className={`${style.barColor} transition-all duration-300 first:rounded-l-full last:rounded-r-full`}
                        title={`${cat.category}: ${cat.percentage.toFixed(1)}%`}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Empty State when no bills for current timeframe */}
          {categoriesData.length === 0 ? (
            <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-700 mb-1">
                No bills recorded for {timeframe === 'month' ? activeMonthLabel : 'this filter'}
              </p>
              <p className="text-[11px] text-slate-400 mb-3">
                Switch to All Time or navigate months to see your spending history.
              </p>
              {timeframe === 'month' && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setTimeframe('all')}
                    className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-indigo-700 active:scale-95 transition"
                  >
                    View All Time ({bills.length} bills)
                  </button>
                  {!isCurrentMonth && (
                    <button
                      onClick={() => setMonthOffset(0)}
                      className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs hover:bg-slate-50 active:scale-95 transition"
                    >
                      Current Month
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Category Items List */
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                Categories ({categoriesData.length})
              </p>

              {categoriesData.map((item) => {
                const style = getCategoryStyle(item.category);
                const IconComponent = style.icon;
                const isSelected = activeFilterCategory === item.category;

                return (
                  <button
                    key={item.category}
                    onClick={() => {
                      if (onSelectCategory) {
                        onSelectCategory(item.category);
                      }
                      onClose();
                    }}
                    className={`w-full flex flex-col p-3 rounded-2xl border text-left transition group active:scale-98 ${
                      isSelected 
                        ? 'bg-indigo-50/60 border-indigo-300 shadow-xs' 
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl ${style.bgColor} ${style.color} flex items-center justify-center shrink-0`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            {item.category}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {item.count} {item.count === 1 ? 'bill' : 'bills'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-900">
                            {primaryCurrency} {item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] font-bold text-indigo-600">
                            {item.percentage.toFixed(1)}%
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
                      </div>
                    </div>

                    {/* Progress Bar for Category */}
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        className={`h-full ${style.barColor} rounded-full`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer / Guidance */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Tap any category to filter your bills list
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
