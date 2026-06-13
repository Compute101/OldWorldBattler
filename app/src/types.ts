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

export interface BoardState {
  widthIn: number;
  heightIn: number;
  units: Unit[];
}
