import { CATEGORY_META, CITY_TIERS, QUALITY_TIERS } from '../data/estimationData';
import { BOQCategory, CalculationResult, ProjectConfig } from '../types';

export function formatINR(amount: number): string {
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rounded);
}

export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakhs`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return formatINR(amount);
}

export function formatNumberIN(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function getFloorLabel(floors: number): string {
  if (floors <= 1) return '1 Floor (Ground only)';
  return `${floors} Floors (Ground + ${floors - 1})`;
}

export function exportEstimateToCSV(
  project: ProjectConfig,
  result: CalculationResult
): void {
  const tierLabel =
    QUALITY_TIERS.find((t) => t.id === project.qualityTier)?.label ??
    project.qualityTier;
  const cityLabel =
    CITY_TIERS.find((c) => c.id === project.cityTier)?.label ??
    project.cityTier;

  const rows: string[][] = [
    ['Home Budget Calculator — Construction Cost Estimate'],
    ['Home Plan Name', project.name || 'My New Home'],
    ['Generated On', new Date().toLocaleDateString('en-IN')],
    [],
    ['HOME DETAILS', ''],
    ['Total Living Area', `${result.totalBuiltUpArea} sq. ft.`],
    ['Number of Floors', getFloorLabel(project.floors)],
    ['Covered Car Parking', `${result.parkingArea} sq. ft.`],
    ['Finish Quality', tierLabel],
    ['City Type', cityLabel],
    ['Estimated Build Time', `~${result.estimatedMonths} months`],
    [],
    ['COST BREAKDOWN', 'Details', 'Estimated Cost (INR)'],
  ];

  (Object.keys(CATEGORY_META) as BOQCategory[]).forEach((cat) => {
    rows.push([
      CATEGORY_META[cat].label,
      CATEGORY_META[cat].shortLabel,
      String(Math.round(result.categoryTotals[cat])),
    ]);
  });

  rows.push([
    'Base House Construction Subtotal',
    `~Rs. ${Math.round(result.effectiveRatePerSqFt)} / sq. ft.`,
    String(Math.round(result.constructionCost)),
  ]);

  rows.push([]);
  rows.push(['OPTIONAL EXTRAS & BUFFER', 'Details', 'Estimated Cost (INR)']);

  if (project.addOns.compoundWallEnabled) {
    rows.push([
      'Boundary Wall & Main Gate',
      `${project.addOns.compoundWallRft} ft`,
      String(Math.round(result.addOnsBreakdown.compoundWall)),
    ]);
  }
  if (project.addOns.waterSumpEnabled) {
    rows.push([
      'Underground Water Tank (Sump)',
      `${project.addOns.waterSumpLitres} Litres`,
      String(Math.round(result.addOnsBreakdown.waterSump)),
    ]);
  }
  if (project.addOns.overheadTankEnabled) {
    rows.push([
      'Overhead Water Tank',
      `${project.addOns.overheadTankLitres} Litres`,
      String(Math.round(result.addOnsBreakdown.overheadTank)),
    ]);
  }
  if (project.addOns.terraceTilesEnabled) {
    rows.push([
      'Terrace Floor Tiles',
      `${project.addOns.terraceTilesSqFt} sq. ft.`,
      String(Math.round(result.addOnsBreakdown.terraceTiles)),
    ]);
  }
  if (project.addOns.borewellEnabled) {
    rows.push([
      'Borewell & Water Motor',
      'Drilling + submersible pump',
      String(Math.round(result.addOnsBreakdown.borewell)),
    ]);
  }
  if (project.addOns.septicTankEnabled) {
    rows.push([
      'Septic Tank',
      'Standard residential capacity',
      String(Math.round(result.addOnsBreakdown.septicTank)),
    ]);
  }
  if (result.architectFee > 0) {
    rows.push([
      'Architect & Plan Approvals',
      `${project.addOns.architectFeePercent}%`,
      String(Math.round(result.architectFee)),
    ]);
  }
  if (result.contingencyFee > 0) {
    rows.push([
      'Extra Safety Buffer',
      `${project.addOns.contingencyPercent}%`,
      String(Math.round(result.contingencyFee)),
    ]);
  }

  rows.push([]);
  rows.push([
    'TOTAL ESTIMATED HOME BUDGET',
    formatINRCompact(result.grandTotal),
    String(Math.round(result.grandTotal)),
  ]);
  rows.push([
    'Expected Budget Range (±5%)',
    `${formatINRCompact(result.grandTotal * 0.95)} - ${formatINRCompact(result.grandTotal * 1.05)}`,
    '',
  ]);

  rows.push([]);
  rows.push(['APPROX. KEY MATERIALS NEEDED', 'Quantity', 'Unit']);
  const keyIds = ['cement', 'steel', 'bricks', 'sand'];
  for (const id of keyIds) {
    const item = result.boqItems.find((i) => i.id === id);
    if (item) {
      rows.push([
        item.name,
        id === 'steel'
          ? (item.quantity / 1000).toFixed(1)
          : String(Math.round(item.quantity)),
        id === 'steel' ? 'Tonnes' : item.unit,
      ]);
    }
  }

  const csvContent = rows
    .map((r) =>
      r
        .map((cell) => {
          // Prefix formula-like text so spreadsheets treat it as a literal (CSV injection).
          const raw = String(cell);
          const text = /^-?\d+(\.\d+)?$/.test(raw) ? raw : raw.replace(/^[=+\-@\t\r]/, "'$&");
          return `"${text.replace(/"/g, '""')}"`;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName =
    (project.name || 'home-budget')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'home-budget';
  link.href = url;
  link.download = `${safeName}-estimate.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
