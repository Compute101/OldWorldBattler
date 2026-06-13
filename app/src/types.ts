export interface Unit {
  id: string;
  name: string;
  faction: string;
  color: string;
  baseWidthMm: number;
  baseDepthMm: number;
  ranks: number;
  files: number;
  x: number; // center position in inches
  y: number; // center position in inches
  facing: number; // degrees clockwise from north (0 = up)
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
  log: LogEntry[];
}

export type Selection = { type: 'unit' | 'terrain'; id: string };

export type Mode = 'select' | 'measure';

