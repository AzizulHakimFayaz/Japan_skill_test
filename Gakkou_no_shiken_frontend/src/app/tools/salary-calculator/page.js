'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calculator,
  Home,
  ChevronRight,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Building2,
  MapPin,
  Clock,
  Coins,
  ArrowRight,
  Info,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

const SECTORS = [
  { id: 'caregiving', name: 'Caregiving (介護 Kaigo)', baseHourly: 1150, bonusMonthly: 15000, desc: 'Highest government subsidies & overtime opportunities.' },
  { id: 'food_service', name: 'Food Service (外食 Gaishoku)', baseHourly: 1120, bonusMonthly: 10000, desc: 'Fast-paced restaurant and kitchen environment.' },
  { id: 'agriculture', name: 'Agriculture (農業 Nougyou)', baseHourly: 1020, bonusMonthly: 5000, desc: 'Subsidized rural dorms and farm produce benefits.' },
  { id: 'construction', name: 'Construction (建設 Kensetsu)', baseHourly: 1250, bonusMonthly: 18000, desc: 'Higher hourly base wage with allowances.' },
  { id: 'building_cleaning', name: 'Building Cleaning (ビルクリーニング)', baseHourly: 1080, bonusMonthly: 8000, desc: 'Regular stable shift hours in hotels and commercial towers.' },
  { id: 'hospitality', name: 'Hospitality / Hotel (宿泊 Shukuhaku)', baseHourly: 1100, bonusMonthly: 10000, desc: 'Japanese customer service and front desk operations.' },
];

const PREFECTURES = [
  { id: 'tokyo', name: 'Tokyo (東京)', minWage: 1163, rentEst: 45000 },
  { id: 'kanagawa', name: 'Kanagawa / Yokohama (神奈川)', minWage: 1162, rentEst: 40000 },
  { id: 'osaka', name: 'Osaka (大阪)', minWage: 1114, rentEst: 35000 },
  { id: 'aichi', name: 'Aichi / Nagoya (愛知)', minWage: 1077, rentEst: 32000 },
  { id: 'saitama', name: 'Saitama (埼玉)', minWage: 1078, rentEst: 32000 },
  { id: 'chiba', name: 'Chiba (千葉)', minWage: 1076, rentEst: 30000 },
  { id: 'fukuoka', name: 'Fukuoka (福岡)', minWage: 992, rentEst: 28000 },
  { id: 'other', name: 'Regional / Other Prefectures', minWage: 953, rentEst: 25000 },
];

// 1 JPY = ~0.82 BDT (Approximate rate)
const JPY_TO_BDT_RATE = 0.82;

export default function SalaryCalculatorPage() {
  const [selectedSectorId, setSelectedSectorId] = useState('caregiving');
  const [selectedPrefectureId, setSelectedPrefectureId] = useState('tokyo');
  const [overtimeHours, setOvertimeHours] = useState(25);
  const [housingType, setHousingType] = useState('company_dorm'); // 'company_dorm' | 'private_apartment'

  const sector = SECTORS.find((s) => s.id === selectedSectorId) || SECTORS[0];
  const prefecture = PREFECTURES.find((p) => p.id === selectedPrefectureId) || PREFECTURES[0];

  // Base Hourly Wage is whichever is higher between Sector base and Prefecture minimum wage
  const effectiveHourlyWage = Math.max(sector.baseHourly, prefecture.minWage);

  // Regular Hours (160h/month = 40h/week * 4 weeks)
  const regularHours = 160;
  const baseSalary = effectiveHourlyWage * regularHours;

  // Overtime Hours (1.25x statutory rate)
  const overtimeRate = effectiveHourlyWage * 1.25;
  const overtimePay = Math.round(overtimeRate * overtimeHours);

  // Gross Salary
  const grossMonthlySalary = baseSalary + overtimePay + sector.bonusMonthly;

  // Statutory Deductions
  const healthInsurance = Math.round(grossMonthlySalary * 0.049); // ~4.9%
  const welfarePension = Math.round(grossMonthlySalary * 0.0915); // ~9.15%
  const employmentInsurance = Math.round(grossMonthlySalary * 0.006); // ~0.6%
  const incomeTax = Math.round(grossMonthlySalary * 0.035); // ~3.5%
  const residentTax = Math.round(grossMonthlySalary * 0.045); // ~4.5% (approx)
  const totalTaxes = healthInsurance + welfarePension + employmentInsurance + incomeTax + residentTax;

  // Rent & Living Expenses
  const estimatedRent = housingType === 'company_dorm' ? Math.round(prefecture.rentEst * 0.55) : prefecture.rentEst;
  const estimatedFoodAndUtilities = 32000;
  const totalLivingExpenses = estimatedRent + estimatedFoodAndUtilities;

  // Net Take-Home (手取り) & Estimated Remittance Savings
  const netTakeHomeSalary = grossMonthlySalary - totalTaxes;
  const estimatedMonthlySavings = Math.max(0, netTakeHomeSalary - totalLivingExpenses);

  // BDT Conversions
  const grossBDT = Math.round(grossMonthlySalary * JPY_TO_BDT_RATE);
  const netTakeHomeBDT = Math.round(netTakeHomeSalary * JPY_TO_BDT_RATE);
  const savingsBDT = Math.round(estimatedMonthlySavings * JPY_TO_BDT_RATE);

  return (
    <div className="space-y-6 sm:space-y-10 animate-fade-in max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-japan-red dark:hover:text-rose-400 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href="/tools" className="hover:text-japan-red dark:hover:text-rose-400">
          Tools
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-bold">Salary Calculator</span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Specified Skilled Worker (特定技能1号)</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
          Japan SSW Salary &amp; Living Cost Calculator (給与計算)
        </h1>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
          Estimate your monthly income in Japan (JPY) and Bangladesh Taka (৳), overtime pay, statutory taxes, rent, and potential monthly savings.
        </p>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sector Selector */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>1. Select Your SSW Skill Sector</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SECTORS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSectorId(sec.id)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                    selectedSectorId === sec.id
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="text-xs font-black">{sec.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium line-clamp-1">
                    {sec.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prefecture & Region Selector */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
            <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-japan-red" />
              <span>2. Select Japanese Prefecture (Work Location)</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PREFECTURES.map((pref) => (
                <button
                  key={pref.id}
                  onClick={() => setSelectedPrefectureId(pref.id)}
                  className={`p-2.5 rounded-xl text-center border transition-all text-xs font-bold cursor-pointer ${
                    selectedPrefectureId === pref.id
                      ? 'bg-rose-50 dark:bg-rose-950/60 border-japan-red text-japan-red dark:text-rose-300 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {pref.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Overtime & Housing Sliders */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Estimated Monthly Overtime (残業)</span>
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono font-black text-sm">
                  {overtimeHours} Hours/month
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="5"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>0 Hours (No Overtime)</span>
                <span>20 Hours (Average)</span>
                <span>45 Hours (Legal Limit)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white block">
                Housing Option
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHousingType('company_dorm')}
                  className={`p-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                    housingType === 'company_dorm'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div>Company Dormitory (寮)</div>
                  <div className="text-[10px] font-normal text-slate-400 mt-0.5">Subsidized (~¥{Math.round(prefecture.rentEst * 0.55).toLocaleString()}/mo)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setHousingType('private_apartment')}
                  className={`p-3 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                    housingType === 'private_apartment'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div>Private Apartment (アパート)</div>
                  <div className="text-[10px] font-normal text-slate-400 mt-0.5">Full Rent (~¥{prefecture.rentEst.toLocaleString()}/mo)</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Summary Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Highlights Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-japan-navy text-white border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Monthly Net Savings to Bangladesh
              </span>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
                ৳ {savingsBDT.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-300 font-semibold">
                (≈ ¥{estimatedMonthlySavings.toLocaleString()} JPY saved per month)
              </div>
            </div>

            {/* Income & Take-Home Quick Stats */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Salary (総支給)</span>
                <div className="text-base font-black text-white font-mono">¥{grossMonthlySalary.toLocaleString()}</div>
                <div className="text-[10px] text-amber-300 font-bold">≈ ৳{grossBDT.toLocaleString('en-IN')}</div>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Take-Home (手取り)</span>
                <div className="text-base font-black text-white font-mono">¥{netTakeHomeSalary.toLocaleString()}</div>
                <div className="text-[10px] text-emerald-300 font-bold">≈ ৳{netTakeHomeBDT.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Base Salary (160h @ ¥{effectiveHourlyWage}/h):</span>
                <span className="font-mono font-bold text-white">¥{baseSalary.toLocaleString()}</span>
              </div>
              {overtimeHours > 0 && (
                <div className="flex justify-between text-indigo-300">
                  <span>Overtime Pay ({overtimeHours}h @ 1.25x):</span>
                  <span className="font-mono font-bold">¥{overtimePay.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-rose-300 pt-1 border-t border-slate-800/80">
                <span>Social Insurance &amp; Taxes (~22%):</span>
                <span className="font-mono font-bold">-¥{totalTaxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>Rent &amp; Utilities:</span>
                <span className="font-mono font-bold">-¥{estimatedRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>Food &amp; Daily Living:</span>
                <span className="font-mono font-bold">-¥{estimatedFoodAndUtilities.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Japan Pension Refund Benefit Note */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-3xl p-5 space-y-2.5 text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2 font-black text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Lump-Sum Pension Refund (脱退一時金)</span>
            </div>
            <p className="leading-relaxed text-[11px] text-emerald-800 dark:text-emerald-300">
              Foreign SSW workers who return to Bangladesh after working up to 5 years can claim a <strong>Lump-Sum Pension Refund</strong>, returning roughly <strong>¥800,000 – ¥1,500,000+ (৳7–12+ Lakhs)</strong> of paid pension contributions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
