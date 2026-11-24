import React from 'react';
import {
  Car,
  CheckCircle2,
  Clock,
  Download,
  Droplets,
  FileSpreadsheet,
  HelpCircle,
  Home,
  Layers,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  CATEGORY_META,
  CITY_TIERS,
  QUALITY_TIERS,
} from '../data/estimationData';
import {
  BOQCategory,
  CalculationResult,
  ProjectConfig,
} from '../types';
import {
  formatINR,
  formatINRCompact,
  formatNumberIN,
} from '../utils/formatters';

interface EstimatorTabProps {
  project: ProjectConfig;
  result: CalculationResult;
  onChange: (updater: (prev: ProjectConfig) => ProjectConfig) => void;
  onDownloadPDF: () => void;
  onDownloadCSV: () => void;
}

const QUICK_PLOT_PRESETS = [
  { label: '20×30 Plot', plotArea: 600, builtUp: 450, parking: 120 },
  { label: '30×40 Plot', plotArea: 1200, builtUp: 900, parking: 250 },
  { label: '30×50 Plot', plotArea: 1500, builtUp: 1100, parking: 300 },
  { label: '40×60 Plot', plotArea: 2400, builtUp: 1600, parking: 400 },
];

const FLOOR_OPTIONS = [
  { count: 1, title: '1 Floor', subtitle: 'Ground only' },
  { count: 2, title: '2 Floors', subtitle: 'Ground + 1st' },
  { count: 3, title: '3 Floors', subtitle: 'Ground + 2' },
  { count: 4, title: '4 Floors', subtitle: 'Ground + 3' },
];

const CITY_HINTS: Record<string, string> = {
  tier1: 'Slightly higher labor & transport cost',
  tier2: 'Average Indian construction cost',
  tier3: 'More affordable local labor rates',
};

export const EstimatorTab: React.FC<EstimatorTabProps> = ({
  project,
  result,
  onChange,
  onDownloadPDF,
  onDownloadCSV,
}) => {
  const pieData = (Object.keys(CATEGORY_META) as BOQCategory[]).map((cat) => ({
    name: CATEGORY_META[cat].label,
    shortDesc: CATEGORY_META[cat].shortLabel,
    value: Math.round(result.categoryTotals[cat]),
    color: CATEGORY_META[cat].color,
  }));

  const extrasTotal =
    result.addOnsBreakdown.totalDirectAddOns +
    result.architectFee +
    result.contingencyFee;

  if (extrasTotal > 0) {
    pieData.push({
      name: 'Extras & Safety Buffer',
      shortDesc: 'Wall, tank, approvals & buffer',
      value: Math.round(extrasTotal),
      color: '#D97706',
    });
  }

  const cementItem = result.boqItems.find((i) => i.id === 'cement');
  const steelItem = result.boqItems.find((i) => i.id === 'steel');
  const sandItem = result.boqItems.find((i) => i.id === 'sand');
  const bricksItem = result.boqItems.find((i) => i.id === 'bricks');

  const materialPct =
    result.constructionCost > 0
      ? Math.round((result.materialCost / result.constructionCost) * 100)
      : 0;
  const laborPct = 100 - materialPct;

  const lowEstimate = result.grandTotal * 0.95;
  const highEstimate = result.grandTotal * 1.05;

  const applyPlotPreset = (preset: (typeof QUICK_PLOT_PRESETS)[number]) => {
    onChange((p) => ({
      ...p,
      plotArea: preset.plotArea,
      builtUpAreaPerFloor: preset.builtUp,
      parkingArea: preset.parking,
      coveragePercent: Math.round((preset.builtUp / preset.plotArea) * 100),
      addOns: {
        ...p.addOns,
        terraceTilesSqFt: preset.builtUp,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Friendly Welcome Strip */}
      <div className="rounded-2xl border border-orange-200/70 bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-white px-5 py-4">
        <h1 className="font-display text-lg sm:text-xl font-extrabold text-stone-900">
          How much will it cost to build your house?
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-stone-600">
          Choose your home size, quality style, and optional extras below — your
          estimated budget updates instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: 3 Simple Steps */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          {/* STEP 1: Size & Floors */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-700 font-display text-sm font-extrabold">
                  1
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-stone-900">
                    Tell us about your home size
                  </h2>
                  <p className="text-xs text-stone-500">
                    Pick a common plot size or enter your own measurements
                  </p>
                </div>
              </div>

              <div className="inline-flex rounded-xl bg-stone-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() =>
                    onChange((p) => ({ ...p, areaInputMode: 'direct' }))
                  }
                  className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                    project.areaInputMode === 'direct'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  House Area
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange((p) => ({ ...p, areaInputMode: 'plot' }))
                  }
                  className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                    project.areaInputMode === 'plot'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  By Plot Size
                </button>
              </div>
            </div>

            {/* Quick Plot Presets */}
            <div className="mb-5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                Quick-fill common Indian plot sizes:
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_PLOT_PRESETS.map((preset) => {
                  const isActive =
                    project.builtUpAreaPerFloor === preset.builtUp &&
                    project.plotArea === preset.plotArea;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPlotPreset(preset)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'border border-stone-200 bg-stone-50 text-stone-700 hover:border-orange-300 hover:bg-orange-50/50'
                      }`}
                    >
                      {preset.label}{' '}
                      <span className="opacity-75">
                        ({formatNumberIN(preset.plotArea)} sq.ft.)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {project.areaInputMode === 'direct' ? (
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-stone-800 flex items-center gap-1.5">
                      <Home className="h-4 w-4 text-orange-600" />
                      Living Area per Floor (sq. ft.)
                    </label>
                    <span className="font-mono-num text-sm font-bold text-orange-700">
                      {formatNumberIN(project.builtUpAreaPerFloor)} sq. ft.
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={400}
                      max={3500}
                      step={50}
                      value={Math.min(
                        3500,
                        Math.max(400, project.builtUpAreaPerFloor)
                      )}
                      onChange={(e) =>
                        onChange((p) => ({
                          ...p,
                          builtUpAreaPerFloor: Number(e.target.value),
                        }))
                      }
                      className="flex-1 accent-orange-600 cursor-pointer"
                    />
                    <input
                      type="number"
                      min={200}
                      max={10000}
                      step={50}
                      value={project.builtUpAreaPerFloor}
                      onChange={(e) =>
                        onChange((p) => ({
                          ...p,
                          builtUpAreaPerFloor: Math.max(
                            0,
                            Number(e.target.value)
                          ),
                        }))
                      }
                      className="w-28 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-mono-num text-sm font-bold text-stone-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-stone-500">
                    Tip: A typical 2BHK floor is ~900–1,100 sq. ft.; a 3BHK
                    floor is ~1,300–1,600 sq. ft.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-stone-800 mb-1.5">
                      Your Total Plot Size (sq. ft.)
                    </label>
                    <input
                      type="number"
                      min={300}
                      max={20000}
                      step={50}
                      value={project.plotArea}
                      onChange={(e) =>
                        onChange((p) => ({
                          ...p,
                          plotArea: Math.max(0, Number(e.target.value)),
                        }))
                      }
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 font-mono-num text-sm font-bold text-stone-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                    />
                    <p className="mt-1 text-[11px] text-stone-500">
                      Example: 30 ft × 40 ft = 1,200 sq. ft.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-semibold text-stone-800">
                        How much of the plot to build on?
                      </label>
                      <span className="font-mono-num text-xs font-bold text-orange-700">
                        {project.coveragePercent}% (
                        {formatNumberIN(
                          Math.round(
                            (project.plotArea * project.coveragePercent) / 100
                          )
                        )}{' '}
                        sq. ft.)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={90}
                      step={5}
                      value={project.coveragePercent}
                      onChange={(e) =>
                        onChange((p) => ({
                          ...p,
                          coveragePercent: Number(e.target.value),
                        }))
                      }
                      className="mt-3 w-full accent-orange-600 cursor-pointer"
                    />
                    <p className="mt-1 text-[11px] text-stone-500">
                      Usually 65%–75% is built; the rest is left open for light
                      & setbacks.
                    </p>
                  </div>
                </>
              )}

              {/* Number of Floors */}
              <div className="sm:col-span-2">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-stone-800 mb-2">
                  <Layers className="h-4 w-4 text-orange-600" />
                  How many floors do you want to build?
                </label>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {FLOOR_OPTIONS.map((fl) => {
                    const selected = project.floors === fl.count;
                    return (
                      <button
                        key={fl.count}
                        type="button"
                        onClick={() =>
                          onChange((p) => ({ ...p, floors: fl.count }))
                        }
                        className={`rounded-xl border p-3 text-left transition cursor-pointer ${
                          selected
                            ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                            : 'border-stone-200 bg-stone-50/70 text-stone-800 hover:bg-stone-100'
                        }`}
                      >
                        <div className="text-sm font-bold">{fl.title}</div>
                        <div
                          className={`text-[11px] ${
                            selected ? 'text-stone-300' : 'text-stone-500'
                          }`}
                        >
                          {fl.subtitle}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Car Parking */}
              <div className="sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-stone-800">
                    <Car className="h-4 w-4 text-stone-500" />
                    Covered Car Parking Space (sq. ft.)
                  </label>
                  <span className="text-xs text-stone-500">
                    Costs less per sq. ft. than rooms
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: 'No Parking', val: 0 },
                    { label: '1 Car (200 sq.ft.)', val: 200 },
                    { label: '1 Car + Bikes (250)', val: 250 },
                    { label: '2 Cars (400 sq.ft.)', val: 400 },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() =>
                        onChange((p) => ({ ...p, parkingArea: opt.val }))
                      }
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        project.parkingArea === opt.val
                          ? 'bg-teal-700 text-white'
                          : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <input
                    type="number"
                    min={0}
                    max={3000}
                    step={25}
                    value={project.parkingArea}
                    onChange={(e) =>
                      onChange((p) => ({
                        ...p,
                        parkingArea: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    aria-label="Custom parking area"
                    className="w-24 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 font-mono-num text-xs font-bold text-stone-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Plain-English Area Recap */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-stone-50 px-4 py-3 border border-stone-200/80 text-xs">
              <span className="text-stone-600">
                Total Living Area:{' '}
                <strong className="font-mono-num text-stone-900">
                  {formatNumberIN(result.totalBuiltUpArea)} sq. ft.
                </strong>{' '}
                across {project.floors}{' '}
                {project.floors === 1 ? 'floor' : 'floors'}
              </span>
              {result.parkingArea > 0 && (
                <span className="text-stone-600">
                  + Parking:{' '}
                  <strong className="font-mono-num text-stone-900">
                    {formatNumberIN(result.parkingArea)} sq. ft.
                  </strong>
                </span>
              )}
            </div>
          </section>

          {/* STEP 2: Quality & Location */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800 font-display text-sm font-extrabold">
                2
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-stone-900">
                  Choose your finish quality & city
                </h2>
                <p className="text-xs text-stone-500">
                  This sets the quality of tiles, paint, doors, bathrooms &
                  local labor rates
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {QUALITY_TIERS.map((tier) => {
                const selected = project.qualityTier === tier.id;
                const isPopular = tier.id === 'standard';
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() =>
                      onChange((p) => ({
                        ...p,
                        qualityTier: tier.id,
                        customRates: {},
                      }))
                    }
                    className={`relative text-left rounded-xl border p-4 transition cursor-pointer ${
                      selected
                        ? 'border-orange-500 bg-orange-50/40 ring-2 ring-orange-500/20'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-sm font-bold text-stone-900">
                          {tier.label}
                        </span>
                        {isPopular && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            <Sparkles className="h-2.5 w-2.5" />
                            Popular
                          </span>
                        )}
                      </div>
                      <span
                        className={`rounded-full border px-2 py-0.5 font-mono-num text-[11px] font-semibold ${tier.badgeColor}`}
                      >
                        ~₹{formatNumberIN(tier.approxRatePerSqFt)}/sq.ft.
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-stone-500">
                      {tier.tagline}
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {tier.specs.map((spec) => (
                        <li
                          key={spec}
                          className="flex items-start gap-1.5 text-xs text-stone-600"
                        >
                          <CheckCircle2
                            className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                              selected ? 'text-orange-600' : 'text-stone-400'
                            }`}
                          />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            {/* Where are you building? */}
            <div className="mt-6 pt-5 border-t border-stone-100">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-stone-800 mb-3">
                <MapPin className="h-4 w-4 text-orange-600" />
                Where are you building?
              </label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {CITY_TIERS.map((city) => {
                  const selected = project.cityTier === city.id;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() =>
                        onChange((p) => ({
                          ...p,
                          cityTier: city.id,
                          customRates: {},
                        }))
                      }
                      className={`rounded-xl border p-3.5 text-left transition cursor-pointer ${
                        selected
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 bg-stone-50/60 text-stone-800 hover:bg-stone-100'
                      }`}
                    >
                      <div className="text-sm font-bold">{city.label}</div>
                      <p
                        className={`mt-1 text-[11px] leading-snug ${
                          selected ? 'text-stone-300' : 'text-stone-500'
                        }`}
                      >
                        {city.examples}
                      </p>
                      <div
                        className={`mt-2 text-[11px] font-medium ${
                          selected ? 'text-orange-300' : 'text-teal-700'
                        }`}
                      >
                        {CITY_HINTS[city.id]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* STEP 3: Optional Extras */}
          <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-display text-sm font-extrabold">
                3
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-stone-900">
                  Add optional outside works & safety buffer
                </h2>
                <p className="text-xs text-stone-500">
                  Tick only what you need — these are separate from the main
                  house building cost
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Boundary Wall */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-stone-50/50 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.addOns.compoundWallEnabled}
                    onChange={(e) =>
                      onChange((p) => ({
                        ...p,
                        addOns: {
                          ...p.addOns,
                          compoundWallEnabled: e.target.checked,
                        },
                      }))
                    }
                    className="mt-0.5 h-4 w-4 rounded accent-orange-600"
                  />
                  <div>
                    <div className="text-sm font-bold text-stone-800">
                      Boundary Wall & Main Gate
                    </div>
                    <div className="text-xs text-stone-500">
                      Outer compound wall around your plot with iron gate
                    </div>
                  </div>
                </label>

                {project.addOns.compoundWallEnabled && (
                  <div className="flex items-center gap-2 ml-7 sm:ml-0">
                    <input
                      type="number"
                      min={0}
                      step={10}
                      value={project.addOns.compoundWallRft}
                      onChange={(e) =>
                        onChange((p) => ({
                          ...p,
                          addOns: {
                            ...p.addOns,
                            compoundWallRft: Math.max(
                              0,
                              Number(e.target.value)
                            ),
                          },
                        }))
                      }
                      className="w-20 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 font-mono-num text-xs font-bold text-stone-900"
                    />
                    <span className="text-xs text-stone-500">ft long</span>
                    <span className="font-mono-num text-xs font-bold text-stone-900 ml-2">
                      {formatINR(result.addOnsBreakdown.compoundWall)}
                    </span>
                  </div>
                )}
              </div>

              {/* Underground Water Tank */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-stone-50/50 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.addOns.waterSumpEnabled}
                    onChange={(e) =>
                      onChange((p) => ({
                        ...p,
                        addOns: {
                          ...p.addOns,
                          waterSumpEnabled: e.target.checked,
                        },
                      }))
                    }
                    className="mt-0.5 h-4 w-4 rounded accent-orange-600"
                  />
                  <div>
                    <div className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                      <Droplets className="h-4 w-4 text-teal-600" />
                      Underground Water Tank (Sump)
                    </div>
                    <div className="text-xs text-stone-500">
                      Concrete storage tank for daily water supply (8,000L is
                      ideal for a family)
                    </div>
                  </div>
                </label>

                {project.addOns.waterSumpEnabled && (
                  <div className="flex items-center gap-2 ml-7 sm:ml-0">
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={project.addOns.waterSumpLitres}
                      onChange={(e) =>
                        onChange((p) => ({
                          ...p,
                          addOns: {
                            ...p.addOns,
                            waterSumpLitres: Math.max(
                              0,
                              Number(e.target.value)
                            ),
                          },
                        }))
                      }
                      className="w-24 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 font-mono-num text-xs font-bold text-stone-900"
                    />
                    <span className="text-xs text-stone-500">Litres</span>
                    <span className="font-mono-num text-xs font-bold text-stone-900 ml-2">
                      {formatINR(result.addOnsBreakdown.waterSump)}
                    </span>
                  </div>
                )}
              </div>

              {/* Overhead Water Tank */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-stone-50/50 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.addOns.overheadTankEnabled}
                    onChange={(e) =>
                      onChange((p) => ({
                        ...p,
                        addOns: {
                          ...p.addOns,
                          overheadTankEnabled: e.target.checked,
                        },
                      }))
                    }
                    className="mt-0.5 h-4 w-4 rounded accent-orange-600"
                  />
                  <div>
                    <div className="text-sm font-bold text-stone-800 flex items-center gap-1.5">
                      <Droplets className="h-4 w-4 text-blue-600" />
                      Overhead Water Tank
                    </div>
                    <div className="text-xs text-stone-500">
                      Rooftop water tank with stand & connections (2,000L is
                      standard)
                    </div>
                  </div>
                </label>

                {project.addOns.overheadTankEnabled && (
                  <div className="flex items-center gap-2 ml-7 sm:ml-0">
                    <input
                      type="number"
                      min={0}
                      step={500}
                      value={project.addOns.overheadTankLitres}
                      onChange={(e) =>
                        onChange((p) => ({
                          ...p,
                          addOns: {
                            ...p.addOns,
                            overheadTankLitres: Math.max(
                              0,
                              Number(e.target.value)
                            ),
                          },
                        }))
                      }
                      className="w-24 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 font-mono-num text-xs font-bold text-stone-900"
                    />
                    <span className="text-xs text-stone-500">Litres</span>
                    <span className="font-mono-num text-xs font-bold text-stone-900 ml-2">
                      {formatINR(result.addOnsBreakdown.overheadTank)}
                    </span>
                  </div>
                )}
              </div>

              {/* Terrace Floor Tiles */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-stone-50/50 p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.addOns.terraceTilesEnabled}
                    onChange={(e) =>
                      onChange((p) => ({
                        ...p,
                        addOns: {
                          ...p.addOns,
                          terraceTilesEnabled: e.target.checked,
                        },
                      }))
                    }
                    className="mt-0.5 h-4 w-4 rounded accent-orange-600"
                  />
                  <div>
                    <div className="text-sm font-bold text-stone-800">
                      Terrace Floor Tiles
                    </div>
                    <div className="text-xs text-stone-500">
                      Heat-resistant & anti-skid tiles for the roof terrace
                      (₹{project.addOns.terraceTilesRatePerSqFt}/sq.ft.)
                    </div>
                  </div>
                </label>

                {project.addOns.terraceTilesEnabled && (
                  <div className="flex items-center gap-2 ml-7 sm:ml-0">
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={project.addOns.terraceTilesSqFt}
                      onChange={(e) =>
                        onChange((p) => ({
                          ...p,
                          addOns: {
                            ...p.addOns,
                            terraceTilesSqFt: Math.max(
                              0,
                              Number(e.target.value)
                            ),
                          },
                        }))
                      }
                      className="w-24 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 font-mono-num text-xs font-bold text-stone-900"
                    />
                    <span className="text-xs text-stone-500">sq.ft.</span>
                    <span className="font-mono-num text-xs font-bold text-stone-900 ml-2">
                      {formatINR(result.addOnsBreakdown.terraceTiles)}
                    </span>
                  </div>
                )}
              </div>

              {/* Borewell & Septic Tank */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex items-start gap-3 rounded-xl border border-stone-200/80 bg-stone-50/50 p-4 cursor-pointer hover:bg-stone-100/60 transition">
                  <input
                    type="checkbox"
                    checked={project.addOns.borewellEnabled}
                    onChange={(e) =>
                      onChange((p) => ({
                        ...p,
                        addOns: {
                          ...p.addOns,
                          borewellEnabled: e.target.checked,
                        },
                      }))
                    }
                    className="mt-0.5 h-4 w-4 rounded accent-orange-600"
                  />
                  <div>
                    <div className="text-sm font-bold text-stone-800">
                      Borewell & Water Motor
                    </div>
                    <div className="text-xs text-stone-500">
                      Drilling + submersible pump (~
                      {formatINRCompact(project.addOns.borewellCost)})
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-xl border border-stone-200/80 bg-stone-50/50 p-4 cursor-pointer hover:bg-stone-100/60 transition">
                  <input
                    type="checkbox"
                    checked={project.addOns.septicTankEnabled}
                    onChange={(e) =>
                      onChange((p) => ({
                        ...p,
                        addOns: {
                          ...p.addOns,
                          septicTankEnabled: e.target.checked,
                        },
                      }))
                    }
                    className="mt-0.5 h-4 w-4 rounded accent-orange-600"
                  />
                  <div>
                    <div className="text-sm font-bold text-stone-800">
                      Septic Tank
                    </div>
                    <div className="text-xs text-stone-500">
                      Needed if no city drainage (~
                      {formatINRCompact(project.addOns.septicTankCost)})
                    </div>
                  </div>
                </label>
              </div>

              {/* Architect & Safety Buffer */}
              <div className="grid grid-cols-1 gap-5 pt-3 sm:grid-cols-2">
                <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5 text-stone-500" />
                      Architect & Plan Approvals
                    </span>
                    <span className="font-mono-num text-xs font-bold text-orange-700">
                      {project.addOns.architectFeePercent}% (
                      {formatINRCompact(result.architectFee)})
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mb-2">
                    House drawings, 3D design & government permissions
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={project.addOns.architectFeePercent}
                    onChange={(e) =>
                      onChange((p) => ({
                        ...p,
                        addOns: {
                          ...p.addOns,
                          architectFeePercent: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-orange-600 cursor-pointer"
                  />
                </div>

                <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
                      Extra Safety Buffer
                    </span>
                    <span className="font-mono-num text-xs font-bold text-orange-700">
                      {project.addOns.contingencyPercent}% (
                      {formatINRCompact(result.contingencyFee)})
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mb-2">
                    Recommended 5% cushion for unexpected material price changes
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={15}
                    step={1}
                    value={project.addOns.contingencyPercent}
                    onChange={(e) =>
                      onChange((p) => ({
                        ...p,
                        addOns: {
                          ...p.addOns,
                          contingencyPercent: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full accent-orange-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Friendly Budget Summary */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24 space-y-5">
            {/* Hero Budget Card */}
            <div className="rounded-2xl bg-stone-900 p-6 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Your Estimated Home Budget
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-orange-300">
                  <Clock className="h-3 w-3" />
                  ~{result.estimatedMonths} months to build
                </span>
              </div>

              <div className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {formatINRCompact(result.grandTotal)}
              </div>
              <div className="mt-1 font-mono-num text-sm text-stone-300">
                Exact estimate: {formatINR(result.grandTotal)}
              </div>

              {/* Realistic Range */}
              <div className="mt-3 rounded-xl bg-white/8 px-3.5 py-2.5 text-xs text-stone-200">
                <span className="text-stone-400">Expected budget range: </span>
                <strong className="text-orange-300">
                  {formatINRCompact(lowEstimate)} –{' '}
                  {formatINRCompact(highEstimate)}
                </strong>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                <div>
                  <div className="text-[11px] text-stone-400">
                    Approx. Cost / sq. ft.
                  </div>
                  <div className="font-mono-num text-base font-bold text-white">
                    ₹{formatNumberIN(Math.round(result.effectiveRatePerSqFt))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-stone-400">
                    Total Living Area
                  </div>
                  <div className="font-mono-num text-base font-bold text-white">
                    {formatNumberIN(result.totalBuiltUpArea)}{' '}
                    <span className="text-xs font-normal text-stone-400">
                      sq.ft.
                    </span>
                  </div>
                </div>
              </div>

              {/* Simple Materials vs Labor Split */}
              <div className="mt-5">
                <div className="flex justify-between text-[11px] font-medium text-stone-300 mb-1.5">
                  <span>Materials ({materialPct}%)</span>
                  <span>Workers & Labor ({laborPct}%)</span>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="bg-orange-500 transition-all duration-300"
                    style={{ width: `${materialPct}%` }}
                  />
                  <div
                    className="bg-teal-400 transition-all duration-300"
                    style={{ width: `${laborPct}%` }}
                  />
                </div>
              </div>

              {/* Download Actions */}
              <div className="mt-5 grid grid-cols-2 gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onDownloadPDF}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-orange-500 transition cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={onDownloadCSV}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 px-3 py-2.5 text-xs font-semibold text-white hover:bg-white/15 transition cursor-pointer"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-teal-300" />
                  Download CSV
                </button>
              </div>
            </div>

            {/* Where Your Money Goes */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
              <h3 className="font-display text-sm font-bold text-stone-900 mb-1">
                Where your money goes
              </h3>
              <p className="text-xs text-stone-500 mb-3">
                Simple breakdown of your total house budget
              </p>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={74}
                      paddingAngle={2}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatINR(value), 'Est. Cost']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E7E5E4',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 space-y-2.5">
                {pieData.map((item) => {
                  const pct =
                    result.grandTotal > 0
                      ? Math.round((item.value / result.grandTotal) * 100)
                      : 0;
                  return (
                    <div
                      key={item.name}
                      className="flex items-start justify-between gap-2 text-xs"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span
                          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-stone-800 truncate">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-stone-400 truncate">
                            {item.shortDesc}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono-num font-bold text-stone-900">
                          {formatINRCompact(item.value)}
                        </div>
                        <div className="font-mono-num text-[11px] text-stone-400">
                          {pct}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rough Materials Needed */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-orange-600" />
                  Approx. Materials Needed
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl bg-stone-50 p-3 border border-stone-100">
                  <div className="text-[11px] text-stone-500">Cement Bags</div>
                  <div className="mt-0.5 font-mono-num text-sm font-bold text-stone-900">
                    ~{formatNumberIN(Math.round(cementItem?.quantity ?? 0))} Bags
                  </div>
                </div>
                <div className="rounded-xl bg-stone-50 p-3 border border-stone-100">
                  <div className="text-[11px] text-stone-500">Steel Rods</div>
                  <div className="mt-0.5 font-mono-num text-sm font-bold text-stone-900">
                    ~{((steelItem?.quantity ?? 0) / 1000).toFixed(1)} Tonnes
                  </div>
                </div>
                <div className="rounded-xl bg-stone-50 p-3 border border-stone-100">
                  <div className="text-[11px] text-stone-500">Bricks</div>
                  <div className="mt-0.5 font-mono-num text-sm font-bold text-stone-900">
                    ~{formatNumberIN(Math.round(bricksItem?.quantity ?? 0))}
                  </div>
                </div>
                <div className="rounded-xl bg-stone-50 p-3 border border-stone-100">
                  <div className="text-[11px] text-stone-500">Sand</div>
                  <div className="mt-0.5 font-mono-num text-sm font-bold text-stone-900">
                    ~{formatNumberIN(Math.round(sandItem?.quantity ?? 0))} cu.ft.
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-1.5 text-[11px] text-stone-500">
                <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                <span>
                  This is a planning estimate based on average Indian market
                  rates. Final cost depends on exact design, soil & brand
                  choices.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
