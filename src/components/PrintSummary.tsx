import React from 'react';
import { CATEGORY_META, CITY_TIERS, QUALITY_TIERS } from '../data/estimationData';
import { BOQCategory, CalculationResult, ProjectConfig } from '../types';
import {
  formatINR,
  formatINRCompact,
  formatNumberIN,
  getFloorLabel,
} from '../utils/formatters';

interface PrintSummaryProps {
  project: ProjectConfig;
  result: CalculationResult;
}

export const PrintSummary: React.FC<PrintSummaryProps> = ({
  project,
  result,
}) => {
  const tierLabel =
    QUALITY_TIERS.find((t) => t.id === project.qualityTier)?.label ??
    project.qualityTier;
  const cityLabel =
    CITY_TIERS.find((c) => c.id === project.cityTier)?.label ??
    project.cityTier;

  const cementItem = result.boqItems.find((i) => i.id === 'cement');
  const steelItem = result.boqItems.find((i) => i.id === 'steel');
  const sandItem = result.boqItems.find((i) => i.id === 'sand');
  const bricksItem = result.boqItems.find((i) => i.id === 'bricks');

  const extrasRows: { label: string; detail: string; amount: number }[] = [];
  if (project.addOns.compoundWallEnabled) {
    extrasRows.push({
      label: 'Boundary Wall & Main Gate',
      detail: `${formatNumberIN(project.addOns.compoundWallRft)} ft`,
      amount: result.addOnsBreakdown.compoundWall,
    });
  }
  if (project.addOns.waterSumpEnabled) {
    extrasRows.push({
      label: 'Underground Water Tank (Sump)',
      detail: `${formatNumberIN(project.addOns.waterSumpLitres)} Litres`,
      amount: result.addOnsBreakdown.waterSump,
    });
  }
  if (project.addOns.overheadTankEnabled) {
    extrasRows.push({
      label: 'Overhead Water Tank',
      detail: `${formatNumberIN(project.addOns.overheadTankLitres)} Litres`,
      amount: result.addOnsBreakdown.overheadTank,
    });
  }
  if (project.addOns.terraceTilesEnabled) {
    extrasRows.push({
      label: 'Terrace Floor Tiles',
      detail: `${formatNumberIN(project.addOns.terraceTilesSqFt)} sq. ft.`,
      amount: result.addOnsBreakdown.terraceTiles,
    });
  }
  if (project.addOns.borewellEnabled) {
    extrasRows.push({
      label: 'Borewell & Water Motor',
      detail: 'Drilling + submersible pump',
      amount: result.addOnsBreakdown.borewell,
    });
  }
  if (project.addOns.septicTankEnabled) {
    extrasRows.push({
      label: 'Septic Tank',
      detail: 'Standard residential capacity',
      amount: result.addOnsBreakdown.septicTank,
    });
  }
  if (result.architectFee > 0) {
    extrasRows.push({
      label: 'Architect & Plan Approvals',
      detail: `${project.addOns.architectFeePercent}%`,
      amount: result.architectFee,
    });
  }
  if (result.contingencyFee > 0) {
    extrasRows.push({
      label: 'Extra Safety Buffer',
      detail: `${project.addOns.contingencyPercent}%`,
      amount: result.contingencyFee,
    });
  }

  return (
    <div className="print-only hidden text-stone-900">
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-stone-900 pb-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            Home Construction Budget Estimate
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Plan: <strong>{project.name || 'My New Home'}</strong>
          </p>
        </div>
        <div className="text-right text-xs text-stone-500">
          <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
          <div className="mt-0.5 font-semibold text-stone-800">
            {tierLabel} · {cityLabel}
          </div>
        </div>
      </div>

      {/* Key Summary Box */}
      <div className="mt-5 grid grid-cols-4 gap-3 rounded-xl border border-stone-300 bg-stone-50 p-4">
        <div>
          <div className="text-[10px] uppercase font-bold text-stone-500">
            Estimated Budget
          </div>
          <div className="mt-1 font-display text-lg font-extrabold text-stone-900">
            {formatINRCompact(result.grandTotal)}
          </div>
          <div className="font-mono-num text-[11px] text-stone-600">
            {formatINR(result.grandTotal)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-stone-500">
            Home Size
          </div>
          <div className="mt-1 font-mono-num text-base font-bold">
            {formatNumberIN(result.totalBuiltUpArea)} sq. ft.
          </div>
          <div className="text-[11px] text-stone-600">
            {getFloorLabel(project.floors)}
            {result.parkingArea > 0
              ? ` + ${formatNumberIN(result.parkingArea)} sft parking`
              : ''}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-stone-500">
            Approx. Rate
          </div>
          <div className="mt-1 font-mono-num text-base font-bold">
            ₹{formatNumberIN(Math.round(result.effectiveRatePerSqFt))}/sq.ft.
          </div>
          <div className="text-[11px] text-stone-600">
            Range: {formatINRCompact(result.grandTotal * 0.95)} –{' '}
            {formatINRCompact(result.grandTotal * 1.05)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-stone-500">
            Est. Build Time
          </div>
          <div className="mt-1 font-mono-num text-base font-bold">
            ~{result.estimatedMonths} Months
          </div>
          <div className="text-[11px] text-stone-600">Typical pace</div>
        </div>
      </div>

      {/* House Construction Breakdown */}
      <h2 className="mt-6 mb-2 font-display text-sm font-bold uppercase tracking-wider text-stone-700">
        1. Main House Construction Cost
      </h2>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-stone-400 bg-stone-100 text-left">
            <th className="py-2 px-2">Category</th>
            <th className="py-2 px-2">What’s Included</th>
            <th className="py-2 px-2 text-right">Estimated Cost</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-200">
          {(Object.keys(CATEGORY_META) as BOQCategory[]).map((cat) => (
            <tr key={cat}>
              <td className="py-2 px-2 font-semibold">
                {CATEGORY_META[cat].label}
              </td>
              <td className="py-2 px-2 text-stone-600">
                {CATEGORY_META[cat].shortLabel}
              </td>
              <td className="py-2 px-2 text-right font-mono-num font-semibold">
                {formatINR(result.categoryTotals[cat])}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-stone-400 font-bold">
          <tr>
            <td colSpan={2} className="py-2 px-2 text-right">
              Base House Construction Subtotal
            </td>
            <td className="py-2 px-2 text-right font-mono-num">
              {formatINR(result.constructionCost)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Optional Extras */}
      {extrasRows.length > 0 && (
        <>
          <h2 className="mt-6 mb-2 font-display text-sm font-bold uppercase tracking-wider text-stone-700">
            2. Selected Optional Extras & Safety Buffer
          </h2>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-400 bg-stone-100 text-left">
                <th className="py-2 px-2">Item</th>
                <th className="py-2 px-2">Details</th>
                <th className="py-2 px-2 text-right">Estimated Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {extrasRows.map((row) => (
                <tr key={row.label}>
                  <td className="py-1.5 px-2 font-medium">{row.label}</td>
                  <td className="py-1.5 px-2 text-stone-600">{row.detail}</td>
                  <td className="py-1.5 px-2 text-right font-mono-num font-semibold">
                    {formatINR(row.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Grand Total Bar */}
      <div className="mt-5 flex items-center justify-between rounded-xl bg-stone-900 px-4 py-3 text-white">
        <span className="font-display text-sm font-bold uppercase tracking-wide">
          Total Estimated Home Budget
        </span>
        <span className="font-mono-num text-lg font-extrabold">
          {formatINR(result.grandTotal)} ({formatINRCompact(result.grandTotal)})
        </span>
      </div>

      {/* Key Materials */}
      <h2 className="mt-6 mb-2 font-display text-sm font-bold uppercase tracking-wider text-stone-700">
        3. Approximate Key Materials Needed
      </h2>
      <div className="grid grid-cols-4 gap-3 text-xs">
        <div className="rounded-lg border border-stone-200 p-3">
          <div className="text-stone-500">Cement Bags</div>
          <div className="mt-1 font-mono-num text-sm font-bold">
            ~{formatNumberIN(Math.round(cementItem?.quantity ?? 0))} Bags
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 p-3">
          <div className="text-stone-500">Steel Rods</div>
          <div className="mt-1 font-mono-num text-sm font-bold">
            ~{((steelItem?.quantity ?? 0) / 1000).toFixed(1)} Tonnes
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 p-3">
          <div className="text-stone-500">Bricks</div>
          <div className="mt-1 font-mono-num text-sm font-bold">
            ~{formatNumberIN(Math.round(bricksItem?.quantity ?? 0))}
          </div>
        </div>
        <div className="rounded-lg border border-stone-200 p-3">
          <div className="text-stone-500">Sand</div>
          <div className="mt-1 font-mono-num text-sm font-bold">
            ~{formatNumberIN(Math.round(sandItem?.quantity ?? 0))} cu.ft.
          </div>
        </div>
      </div>

      <p className="mt-6 border-t border-stone-200 pt-2 text-[10px] text-stone-500">
        Note: This is a planning estimate based on average Indian construction
        market rates. Final costs may vary based on exact architectural design,
        soil condition, and chosen material brands.
      </p>
    </div>
  );
};
