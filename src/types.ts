export type QualityTierId = 'basic' | 'standard' | 'premium' | 'luxury';
export type CityTierId = 'tier1' | 'tier2' | 'tier3';
export type AreaInputMode = 'direct' | 'plot';
export type BOQCategory = 'civil' | 'finishing' | 'mep' | 'labor';
export type ActiveTab = 'estimator' | 'boq' | 'cashflow' | 'compare';

export interface AddOnsConfig {
  compoundWallEnabled: boolean;
  compoundWallRft: number;
  compoundWallRate: number;
  waterSumpEnabled: boolean;
  waterSumpLitres: number;
  waterSumpRatePerLitre: number;
  overheadTankEnabled: boolean;
  overheadTankLitres: number;
  overheadTankRatePerLitre: number;
  terraceTilesEnabled: boolean;
  terraceTilesSqFt: number;
  terraceTilesRatePerSqFt: number;
  borewellEnabled: boolean;
  borewellCost: number;
  septicTankEnabled: boolean;
  septicTankCost: number;
  architectFeePercent: number;
  contingencyPercent: number;
}

export interface ProjectConfig {
  id: string;
  name: string;
  locationNote: string;
  areaInputMode: AreaInputMode;
  builtUpAreaPerFloor: number; // sq. ft.
  plotArea: number; // sq. ft.
  coveragePercent: number; // e.g., 70%
  floors: number; // 1 = G, 2 = G+1, 3 = G+2, etc.
  parkingArea: number; // sq. ft. (calculated at 60% of standard rate)
  qualityTier: QualityTierId;
  cityTier: CityTierId;
  customRates: Record<string, number>; // BOQ item id -> custom unit rate
  addOns: AddOnsConfig;
  updatedAt: string;
}

export interface QualityTierSpec {
  id: QualityTierId;
  label: string;
  tagline: string;
  approxRatePerSqFt: number;
  specs: string[];
  badgeColor: string;
}

export interface CityTierSpec {
  id: CityTierId;
  label: string;
  examples: string;
  multiplier: number;
}

export interface BOQTemplateItem {
  id: string;
  name: string;
  category: BOQCategory;
  unit: string;
  qtyPerSqFt: number;
  floorSteelBonus?: number; // extra kg per sq ft per additional floor
  defaultRates: Record<QualityTierId, number>;
  description: string;
  scalesWithCity: boolean;
}

export interface CalculatedBOQItem {
  id: string;
  name: string;
  category: BOQCategory;
  unit: string;
  qtyPerSqFt: number;
  quantity: number;
  defaultRate: number;
  appliedRate: number;
  isCustomRate: boolean;
  totalCost: number;
  description: string;
}

export interface StageCashflowItem {
  id: string;
  stageNumber: number;
  name: string;
  percentage: number;
  startMonth: number;
  endMonth: number;
  durationMonths: number;
  cost: number;
  cumulativeCost: number;
  milestones: string[];
}

export interface CalculationResult {
  totalBuiltUpArea: number;
  parkingArea: number;
  effectiveArea: number; // built-up + 0.6 * parking
  boqItems: CalculatedBOQItem[];
  categoryTotals: Record<BOQCategory, number>;
  constructionCost: number; // sum of BOQ items
  materialCost: number; // civil + finishing + mep
  laborCost: number; // labor
  addOnsBreakdown: {
    compoundWall: number;
    waterSump: number;
    overheadTank: number;
    terraceTiles: number;
    borewell: number;
    septicTank: number;
    totalDirectAddOns: number;
  };
  architectFee: number;
  contingencyFee: number;
  grandTotal: number;
  effectiveRatePerSqFt: number; // constructionCost / effectiveArea
  allInRatePerSqFt: number; // grandTotal / (totalBuiltUpArea + parkingArea)
  estimatedMonths: number;
  stages: StageCashflowItem[];
}
