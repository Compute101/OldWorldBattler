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
  | 'bowArrow'
  | 'arrow'
  | 'skull'
  | 'orcSkull'
  | 'crossedBones'
  | 'chaosStar'
  | 'dwarfHammer'
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

export type TerrainShape = 'rect' | 'circle';

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
}

export type Selection = { type: 'unit' | 'terrain'; id: string };

export type Mode = 'select' | 'measure';

