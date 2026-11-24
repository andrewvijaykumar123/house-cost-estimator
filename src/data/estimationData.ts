import {
  BOQCategory,
  BOQTemplateItem,
  CityTierSpec,
  ProjectConfig,
  QualityTierSpec,
} from '../types';

export const QUALITY_TIERS: QualityTierSpec[] = [
  {
    id: 'basic',
    label: 'Budget Friendly',
    tagline: 'Simple, sturdy & economical',
    approxRatePerSqFt: 1650,
    badgeColor: 'bg-stone-100 text-stone-700 border-stone-200',
    specs: [
      'Standard quality cement & steel',
      'Red brick walls & ceramic floor tiles',
      'Simple flush doors & aluminium windows',
      'Standard interior paint & basic bathroom fittings',
    ],
  },
  {
    id: 'standard',
    label: 'Standard Home',
    tagline: 'Most popular · Great quality & value',
    approxRatePerSqFt: 2050,
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    specs: [
      'Top-brand cement (UltraTech/ACC) & strong steel',
      'Good quality vitrified tiles for all rooms',
      'UPVC sliding windows & wooden main door frame',
      'Branded bathroom fittings (Jaquar/Hindware) & smooth paint',
    ],
  },
  {
    id: 'premium',
    label: 'Premium Home',
    tagline: 'Modern, upgraded look & branded fittings',
    approxRatePerSqFt: 2550,
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
    specs: [
      'Top-grade steel & extra waterproofing protection',
      'Large-size vitrified tiles or granite flooring',
      'Teakwood main door & sound-reducing UPVC windows',
      'Modular switches (Legrand/Schneider) & premium bathware',
    ],
  },
  {
    id: 'luxury',
    label: 'Luxury Villa',
    tagline: 'Designer finishes & high-end materials',
    approxRatePerSqFt: 3300,
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    specs: [
      'Italian marble & wooden flooring options',
      'False ceiling with mood lighting & smart switches',
      'Designer teakwood doors & large glass windows',
      'Luxury bathware (Kohler/Grohe) & designer exterior',
    ],
  },
];

export const CITY_TIERS: CityTierSpec[] = [
  {
    id: 'tier1',
    label: 'Metro City',
    examples: 'Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune',
    multiplier: 1.12,
  },
  {
    id: 'tier2',
    label: 'Big City',
    examples: 'Jaipur, Kochi, Coimbatore, Indore, Lucknow, Chandigarh',
    multiplier: 1.0,
  },
  {
    id: 'tier3',
    label: 'Town / Smaller City',
    examples: 'District towns, suburbs & smaller cities',
    multiplier: 0.9,
  },
];

export const CATEGORY_META: Record<
  BOQCategory,
  { label: string; shortLabel: string; color: string; bgLight: string }
> = {
  civil: {
    label: 'Structure & Foundation',
    shortLabel: 'Structure (Cement, Steel, Bricks)',
    color: '#C2410C',
    bgLight: 'bg-orange-50 text-orange-800',
  },
  finishing: {
    label: 'Interiors & Finishing',
    shortLabel: 'Tiles, Doors, Windows & Paint',
    color: '#0F766E',
    bgLight: 'bg-teal-50 text-teal-800',
  },
  mep: {
    label: 'Plumbing & Electrical',
    shortLabel: 'Plumbing, Bathrooms & Wiring',
    color: '#2563EB',
    bgLight: 'bg-blue-50 text-blue-800',
  },
  labor: {
    label: 'Construction Labor',
    shortLabel: 'Workers & Site Supervision',
    color: '#78716C',
    bgLight: 'bg-stone-100 text-stone-700',
  },
};

export const BOQ_TEMPLATE_ITEMS: BOQTemplateItem[] = [
  // Civil & Structural
  {
    id: 'cement',
    name: 'Cement (50 kg Bags)',
    category: 'civil',
    unit: 'Bags',
    qtyPerSqFt: 0.42,
    defaultRates: { basic: 380, standard: 410, premium: 435, luxury: 460 },
    description: 'For foundation, concrete, brickwork & plastering',
    scalesWithCity: true,
  },
  {
    id: 'steel',
    name: 'TMT Steel',
    category: 'civil',
    unit: 'kg',
    qtyPerSqFt: 3.8,
    floorSteelBonus: 0.25,
    defaultRates: { basic: 64, standard: 68, premium: 74, luxury: 78 },
    description: 'Steel rods for pillars, beams & roof slabs',
    scalesWithCity: false,
  },
  {
    id: 'sand',
    name: 'Sand',
    category: 'civil',
    unit: 'cft',
    qtyPerSqFt: 1.85,
    defaultRates: { basic: 58, standard: 68, premium: 76, luxury: 85 },
    description: 'For concrete mixing & wall plastering',
    scalesWithCity: true,
  },
  {
    id: 'aggregate',
    name: 'Crushed Stone (Jelly)',
    category: 'civil',
    unit: 'cft',
    qtyPerSqFt: 1.35,
    defaultRates: { basic: 42, standard: 48, premium: 54, luxury: 60 },
    description: 'For concrete pillars, foundation & roof',
    scalesWithCity: true,
  },
  {
    id: 'bricks',
    name: 'Bricks / Blocks',
    category: 'civil',
    unit: 'Nos',
    qtyPerSqFt: 8.5,
    defaultRates: { basic: 9, standard: 11, premium: 13, luxury: 15 },
    description: 'Red bricks or lightweight blocks for walls',
    scalesWithCity: true,
  },
  {
    id: 'waterproofing',
    name: 'Waterproofing & Anti-Termite',
    category: 'civil',
    unit: 'sq. ft.',
    qtyPerSqFt: 1.0,
    defaultRates: { basic: 25, standard: 40, premium: 60, luxury: 95 },
    description: 'Protects foundation, bathrooms & terrace from dampness',
    scalesWithCity: true,
  },

  // Finishing
  {
    id: 'flooring',
    name: 'Flooring & Wall Tiles',
    category: 'finishing',
    unit: 'sq. ft.',
    qtyPerSqFt: 1.3,
    defaultRates: { basic: 65, standard: 105, premium: 165, luxury: 290 },
    description: 'Room flooring, kitchen & bathroom wall tiles',
    scalesWithCity: false,
  },
  {
    id: 'doors_windows',
    name: 'Doors, Windows & Grills',
    category: 'finishing',
    unit: 'sq. ft.',
    qtyPerSqFt: 1.0,
    defaultRates: { basic: 135, standard: 195, premium: 275, luxury: 410 },
    description: 'Main door, room doors, windows & safety grills',
    scalesWithCity: true,
  },
  {
    id: 'paint',
    name: 'Wall Putty & Paint',
    category: 'finishing',
    unit: 'Litres',
    qtyPerSqFt: 0.18,
    defaultRates: { basic: 280, standard: 410, premium: 560, luxury: 780 },
    description: 'Smooth wall putty, primer, inside & outside paint',
    scalesWithCity: false,
  },
  {
    id: 'kitchen_counter',
    name: 'Kitchen Counter & Railings',
    category: 'finishing',
    unit: 'sq. ft.',
    qtyPerSqFt: 1.0,
    defaultRates: { basic: 55, standard: 85, premium: 135, luxury: 245 },
    description: 'Granite kitchen platform, sink & staircase railings',
    scalesWithCity: true,
  },

  // MEP
  {
    id: 'plumbing',
    name: 'Plumbing & Bathroom Fittings',
    category: 'mep',
    unit: 'sq. ft.',
    qtyPerSqFt: 1.0,
    defaultRates: { basic: 95, standard: 135, premium: 195, luxury: 290 },
    description: 'Water pipes, overhead tank, taps, showers & toilets',
    scalesWithCity: false,
  },
  {
    id: 'electrical',
    name: 'Electrical Wiring & Switches',
    category: 'mep',
    unit: 'sq. ft.',
    qtyPerSqFt: 1.0,
    defaultRates: { basic: 85, standard: 120, premium: 175, luxury: 265 },
    description: 'Copper wiring, safety MCB box & modular switches',
    scalesWithCity: false,
  },

  // Labor
  {
    id: 'civil_labor',
    name: 'Structure & Masonry Labor',
    category: 'labor',
    unit: 'sq. ft.',
    qtyPerSqFt: 1.0,
    defaultRates: { basic: 260, standard: 300, premium: 340, luxury: 400 },
    description: 'Masons, helpers, steel & concrete workers',
    scalesWithCity: true,
  },
  {
    id: 'finishing_labor',
    name: 'Finishing, Plumbing & Painting Labor',
    category: 'labor',
    unit: 'sq. ft.',
    qtyPerSqFt: 1.0,
    defaultRates: { basic: 135, standard: 175, premium: 220, luxury: 295 },
    description: 'Tile layers, carpenters, plumbers, electricians & painters',
    scalesWithCity: true,
  },
];

export interface StageTemplate {
  id: string;
  stageNumber: number;
  name: string;
  percentage: number;
  durationWeight: number;
  milestones: string[];
}

export const STAGE_TEMPLATES: StageTemplate[] = [
  {
    id: 'foundation',
    stageNumber: 1,
    name: 'Foundation',
    percentage: 14,
    durationWeight: 0.14,
    milestones: ['Excavation & footing'],
  },
  {
    id: 'plinth',
    stageNumber: 2,
    name: 'Plinth',
    percentage: 10,
    durationWeight: 0.1,
    milestones: ['Plinth beam & floor base'],
  },
  {
    id: 'superstructure',
    stageNumber: 3,
    name: 'Structure & Roof',
    percentage: 24,
    durationWeight: 0.26,
    milestones: ['Pillars, beams & roof slabs'],
  },
  {
    id: 'masonry',
    stageNumber: 4,
    name: 'Walls & Plastering',
    percentage: 16,
    durationWeight: 0.17,
    milestones: ['Brickwork & plastering'],
  },
  {
    id: 'flooring_joinery',
    stageNumber: 5,
    name: 'Flooring & Doors',
    percentage: 20,
    durationWeight: 0.18,
    milestones: ['Tiles, doors & windows'],
  },
  {
    id: 'mep_handover',
    stageNumber: 6,
    name: 'Painting & Handover',
    percentage: 16,
    durationWeight: 0.15,
    milestones: ['Paint, fittings & move-in'],
  },
];

export function createDefaultProject(): ProjectConfig {
  return {
    id: 'proj-default-standard',
    name: 'My New Home',
    locationNote: '',
    areaInputMode: 'direct',
    builtUpAreaPerFloor: 900,
    plotArea: 1200,
    coveragePercent: 75,
    floors: 2,
    parkingArea: 250,
    qualityTier: 'standard',
    cityTier: 'tier2',
    customRates: {},
    addOns: {
      compoundWallEnabled: true,
      compoundWallRft: 140,
      compoundWallRate: 1450,
      waterSumpEnabled: true,
      waterSumpLitres: 8000,
      waterSumpRatePerLitre: 25,
      overheadTankEnabled: true,
      overheadTankLitres: 2000,
      overheadTankRatePerLitre: 18,
      terraceTilesEnabled: false,
      terraceTilesSqFt: 900,
      terraceTilesRatePerSqFt: 95,
      borewellEnabled: false,
      borewellCost: 150000,
      septicTankEnabled: false,
      septicTankCost: 85000,
      architectFeePercent: 4,
      contingencyPercent: 5,
    },
    updatedAt: new Date().toISOString(),
  };
}
