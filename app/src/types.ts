export type ColorScheme = 'solid' | 'vertical' | 'horizontal' | 'diagonal';

export type IconType =
  | 'infantry'
  | 'cavalry'
  | 'chariot'
  | 'monster'
  | 'warMachine'
  | 'character'
  | 'cannon'
  | 'handgun'
  | 'twoHandedSword'
  | 'broadsword'
  | 'swordHilt'
  | 'dagger'
  | 'crossedSwords'
  | 'warAxe'
  | 'spears'
  | 'flangedMace'
  | 'flail'
  | 'halberd'
  | 'warhammer'
  | 'woodClub'
  | 'trident'
  | 'scythe'
  | 'glaive'
  | 'spikedMace'
  | 'vikingShield'
  | 'griffinShield'
  | 'checkedShield'
  | 'rosaShield'
  | 'dragonShield'
  | 'dwarfFace'
  | 'dwarfHelmet'
  | 'warPick'
  | 'miningPicks'
  | 'ironAnvil'
  | 'beerStein'
  | 'griffinSymbol'
  | 'eagleHead'
  | 'eagleEmblem'
  | 'crossedPistols'
  | 'polarStar'
  | 'jewelCrown'
  | 'elfHelmet'
  | 'crescentStaff'
  | 'stagHead'
  | 'pineTree'
  | 'raven'
  | 'treeBranch'
  | 'bowArrow'
  | 'arrow'
  | 'broadheadArrow'
  | 'arrowhead'
  | 'arrowCluster'
  | 'arrowFlights'
  | 'skull'
  | 'orcSkull'
  | 'crossedBones'
  | 'chaosStar'
  | 'dwarfHammer'
  | 'hammer'
  | 'anvil'
  | 'hammerAnvil'
  | 'roundShield'
  | 'phoenix'
  | 'ratClaw'
  | 'leaf'
  | 'vampireBat'
  | 'comet'
  | 'fleurDeLis'
  | 'ankh'
  | 'sunDisc'
  | 'spider';

export interface Unit {
  id: string;
  name: string;
  faction: string;
  colorMajor: string;
  colorMinor: string;
  colorScheme: ColorScheme;
  icon: IconType;
  baseWidthMm: number;
  baseDepthMm: number;
  ranks: number;
  files: number;
  x: number; // center position in inches
  y: number; // center position in inches
  facing: number; // degrees clockwise from north (0 = up)
  movementIn: number; // Movement (M) characteristic, in inches
  marching: boolean; // marching this turn doubles the movement allowance
  notes: string;
}

export type TerrainShape = 'rect' | 'circle' | 'forest';

export interface Terrain {
  id: string;
  name: string;
  shape: TerrainShape;
  color: string;
  widthIn: number; // for rect: width; for circle: diameter
  depthIn: number; // for rect: depth; unused for circle
  x: number; // center position in inches
  y: number; // center position in inches
  rotation: number; // degrees, rect only
  notes: string;
}

export interface DeploymentZones {
  enabled: boolean;
  depthIn: number;
  edges: ('north' | 'south' | 'east' | 'west')[];
}

export type Phase = 'setup' | 'battle';

export interface UnitTransform {
  x: number;
  y: number;
  facing: number;
}

export interface LogEntry {
  id: string;
  turn: number;
  unitId: string | null;
  unitName: string;
  distanceIn: number;
  facingChange: number;
  note: string;
}

// 'turn' steps are captured automatically (battle start, end of turn); 'sub'
// steps are checkpoints the user adds within a turn for finer-grained replay.
export type HistoryStepKind = 'turn' | 'sub';

export interface HistoryStep {
  id: string;
  turn: number;
  kind: HistoryStepKind;
  label: string;
  transforms: Record<string, UnitTransform>;
}

export interface BoardState {
  widthIn: number;
  heightIn: number;
  units: Unit[];
  terrain: Terrain[];
  deploymentZones: DeploymentZones;
  phase: Phase;
  turn: number;
  turnStart: Record<string, UnitTransform>;
  moveUsed: Record<string, number>; // inches of movement used this turn, per unit
  movementUnlocked: boolean; // override to ignore movement-allowance limits
  log: LogEntry[];
  history: HistoryStep[];
}

export type Selection = { type: 'unit' | 'terrain'; id: string };

export type Mode = 'select' | 'measure';

export interface Battle {
  id: string;
  name: string;
  notes: string;
  board: BoardState;
}

export type SiteType = 'city' | 'town' | 'fortress' | 'ruins' | 'mountain' | 'forest' | 'river' | 'landmark';

export interface CampaignSite {
  id: string;
  name: string;
  type: SiteType;
  x: number; // percent across the map, 0-100
  y: number; // percent down the map, 0-100
  notes: string;
}

export interface CampaignMap {
  id: string;
  name: string;
  region: string;
  sites: CampaignSite[];
}

export interface Campaign {
  id: string;
  name: string;
  notes: string;
  battles: Battle[];
  map: CampaignMap;
  // true for campaigns bundled with the app (src/data/globalCampaigns) - viewable by everyone, editable by no one
  readOnly?: boolean;
}

