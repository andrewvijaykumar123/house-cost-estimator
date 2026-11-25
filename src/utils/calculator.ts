import {
  BOQ_TEMPLATE_ITEMS,
  CITY_TIERS,
  STAGE_TEMPLATES,
} from '../data/estimationData';
import {
  BOQCategory,
  CalculatedBOQItem,
  CalculationResult,
  ProjectConfig,
  StageCashflowItem,
} from '../types';

export function calculateEstimate(project: ProjectConfig): CalculationResult {
  const citySpec =
    CITY_TIERS.find((c) => c.id === project.cityTier) ?? CITY_TIERS[1];
  const cityMultiplier = citySpec.multiplier;

  const perFloorArea =
    project.areaInputMode === 'direct'
      ? Math.max(100, project.builtUpAreaPerFloor)
      : Math.max(100, Math.round((project.plotArea * project.coveragePercent) / 100));

  const floors = Math.max(1, Math.min(6, Math.round(project.floors)));
  const totalBuiltUpArea = perFloorArea * floors;
  const parkingArea = Math.max(0, project.parkingArea);
  // Parking/stilt area typically costs ~60% of enclosed habitable built-up area
  const effectiveArea = totalBuiltUpArea + parkingArea * 0.6;

  const boqItems: CalculatedBOQItem[] = BOQ_TEMPLATE_ITEMS.map((tpl) => {
    const extraFloorBonus =
      tpl.floorSteelBonus && floors > 1 ? tpl.floorSteelBonus * (floors - 1) : 0;
    const qtyPerSqFt = Number((tpl.qtyPerSqFt + extraFloorBonus).toFixed(2));
    const quantity = effectiveArea * qtyPerSqFt;

    const baseTierRate = tpl.defaultRates[project.qualityTier];
    const defaultRate = Math.round(
      tpl.scalesWithCity ? baseTierRate * cityMultiplier : baseTierRate
    );

    const hasCustom =
      typeof project.customRates[tpl.id] === 'number' &&
      Number.isFinite(project.customRates[tpl.id]);
    const appliedRate = hasCustom ? Math.max(0, project.customRates[tpl.id]) : defaultRate;

    return {
      id: tpl.id,
      name: tpl.name,
      category: tpl.category,
      unit: tpl.unit,
      qtyPerSqFt,
      quantity,
      defaultRate,
      appliedRate,
      isCustomRate: hasCustom && appliedRate !== defaultRate,
      totalCost: quantity * appliedRate,
      description: tpl.description,
    };
  });

  const categoryTotals: Record<BOQCategory, number> = {
    civil: 0,
    finishing: 0,
    mep: 0,
    labor: 0,
  };

  for (const item of boqItems) {
    categoryTotals[item.category] += item.totalCost;
  }

  const constructionCost =
    categoryTotals.civil +
    categoryTotals.finishing +
    categoryTotals.mep +
    categoryTotals.labor;

  const materialCost =
    categoryTotals.civil + categoryTotals.finishing + categoryTotals.mep;
  const laborCost = categoryTotals.labor;

  const compoundWall = project.addOns.compoundWallEnabled
    ? Math.max(0, project.addOns.compoundWallRft) *
      Math.max(0, project.addOns.compoundWallRate)
    : 0;

  const waterSump = project.addOns.waterSumpEnabled
    ? Math.max(0, project.addOns.waterSumpLitres) *
      Math.max(0, project.addOns.waterSumpRatePerLitre)
    : 0;

  const overheadTank = project.addOns.overheadTankEnabled
    ? Math.max(0, project.addOns.overheadTankLitres ?? 0) *
      Math.max(0, project.addOns.overheadTankRatePerLitre ?? 18)
    : 0;

  const terraceTiles = project.addOns.terraceTilesEnabled
    ? Math.max(0, project.addOns.terraceTilesSqFt ?? 0) *
      Math.max(0, project.addOns.terraceTilesRatePerSqFt ?? 95)
    : 0;

  const borewell = project.addOns.borewellEnabled
    ? Math.max(0, project.addOns.borewellCost)
    : 0;

  const septicTank = project.addOns.septicTankEnabled
    ? Math.max(0, project.addOns.septicTankCost)
    : 0;

  const totalDirectAddOns =
    compoundWall +
    waterSump +
    overheadTank +
    terraceTiles +
    borewell +
    septicTank;

  const subtotalBeforeSoftCosts = constructionCost + totalDirectAddOns;
  const architectFee =
    (constructionCost * Math.max(0, project.addOns.architectFeePercent)) / 100;
  const contingencyFee =
    (subtotalBeforeSoftCosts * Math.max(0, project.addOns.contingencyPercent)) / 100;

  const grandTotal = subtotalBeforeSoftCosts + architectFee + contingencyFee;

  const effectiveRatePerSqFt =
    effectiveArea > 0 ? constructionCost / effectiveArea : 0;
  const grossArea = totalBuiltUpArea + parkingArea;
  const allInRatePerSqFt = grossArea > 0 ? grandTotal / grossArea : 0;

  // Estimate duration in months based on built-up area & floor count (typical Indian residential timeline)
  const baseMonths = 5.5 + (totalBuiltUpArea / 650) * 1.4 + (floors - 1) * 1.3;
  const estimatedMonths = Math.max(6, Math.min(28, Math.round(baseMonths)));

  let runningMonth = 0;
  let cumulativeCost = 0;

  const stages: StageCashflowItem[] = STAGE_TEMPLATES.map((tpl, idx) => {
    const isLast = idx === STAGE_TEMPLATES.length - 1;
    const rawDuration = estimatedMonths * tpl.durationWeight;
    const durationMonths = isLast
      ? Math.max(1, Number((estimatedMonths - runningMonth).toFixed(1)))
      : Math.max(0.5, Number(rawDuration.toFixed(1)));

    const startMonth = Number(runningMonth.toFixed(1));
    const endMonth = Number((runningMonth + durationMonths).toFixed(1));
    runningMonth = endMonth;

    const cost = (grandTotal * tpl.percentage) / 100;
    cumulativeCost += cost;

    return {
      id: tpl.id,
      stageNumber: tpl.stageNumber,
      name: tpl.name,
      percentage: tpl.percentage,
      startMonth,
      endMonth,
      durationMonths,
      cost,
      cumulativeCost,
      milestones: tpl.milestones,
    };
  });

  return {
    totalBuiltUpArea,
    parkingArea,
    effectiveArea,
    boqItems,
    categoryTotals,
    constructionCost,
    materialCost,
    laborCost,
    addOnsBreakdown: {
      compoundWall,
      waterSump,
      overheadTank,
      terraceTiles,
      borewell,
      septicTank,
      totalDirectAddOns,
    },
    architectFee,
    contingencyFee,
    grandTotal,
    effectiveRatePerSqFt,
    allInRatePerSqFt,
    estimatedMonths,
    stages,
  };
}
