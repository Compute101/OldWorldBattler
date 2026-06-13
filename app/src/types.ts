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

export interface BoardState {
  widthIn: number;
  heightIn: number;
  units: Unit[];
  terrain: Terrain[];
  deploymentZones: DeploymentZones;
}

export type Selection = { type: 'unit' | 'terrain'; id: string };

export type Mode = 'select' | 'measure';

