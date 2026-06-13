import type { BoardState, Terrain, Unit, UnitTransform } from './types';

export const MM_PER_INCH = 25.4;

export function footprintInches(unit: Unit): { widthIn: number; depthIn: number } {
  return {
    widthIn: (unit.files * unit.baseWidthMm) / MM_PER_INCH,
    depthIn: (unit.ranks * unit.baseDepthMm) / MM_PER_INCH,
  };
}

let nextId = 1;
export function makeId(prefix = 'unit'): string {
  return `${prefix}-${Date.now()}-${nextId++}`;
}

export const FACTION_COLORS = [
  '#c0392b', '#2980b9', '#27ae60', '#8e44ad',
  '#d35400', '#16a085', '#f39c12', '#7f8c8d',
];

export const TERRAIN_COLORS = [
  '#5d6b3a', '#7a6a4f', '#5a5a5a', '#3a6b6b', '#6b5a3a',
];

export function defaultUnit(faction: string, color: string): Unit {
  return {
    id: makeId('unit'),
    name: 'New Unit',
    faction,
    color,
    baseWidthMm: 25,
    baseDepthMm: 25,
    ranks: 1,
    files: 5,
    x: 24,
    y: 24,
    facing: 0,
    notes: '',
  };
}

export function defaultTerrain(centerX: number, centerY: number): Terrain {
  return {
    id: makeId('terrain'),
    name: 'Terrain',
    shape: 'rect',
    color: TERRAIN_COLORS[0],
    widthIn: 6,
    depthIn: 6,
    x: centerX,
    y: centerY,
    rotation: 0,
    notes: '',
  };
}

export interface BoardPreset {
  label: string;
  widthIn: number;
  heightIn: number;
}

export const BOARD_PRESETS: BoardPreset[] = [
  { label: '3x3 ft (Skirmish)', widthIn: 36, heightIn: 36 },
  { label: '4x4 ft', widthIn: 48, heightIn: 48 },
  { label: '6x4 ft', widthIn: 72, heightIn: 48 },
  { label: '8x4 ft', widthIn: 96, heightIn: 48 },
];

export function screenToBoardPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
  return { x: pt.x, y: pt.y };
}

export function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

// Rotates a local (x, y) vector by `deg` degrees, matching the SVG `rotate(deg)` transform.
export function rotateVec(x: number, y: number, deg: number): { x: number; y: number } {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}

// Board-space position of a point given in the unit's local coordinates (before rotation).
export function localToBoard(unit: Unit, local: { x: number; y: number }): { x: number; y: number } {
  const r = rotateVec(local.x, local.y, unit.facing);
  return { x: unit.x + r.x, y: unit.y + r.y };
}

export function defaultBoardState(): BoardState {
  return {
    widthIn: 48,
    heightIn: 48,
    units: [],
    terrain: [],
    deploymentZones: {
      enabled: false,
      depthIn: 12,
      edges: ['north', 'south'],
    },
    phase: 'setup',
    turn: 1,
    turnStart: {},
    log: [],
  };
}

export function snapshotUnits(units: Unit[]): Record<string, UnitTransform> {
  const snapshot: Record<string, UnitTransform> = {};
  for (const u of units) {
    snapshot[u.id] = { x: u.x, y: u.y, facing: u.facing };
  }
  return snapshot;
}

// Smallest signed difference (degrees) to rotate `from` into `to`, in range [-180, 180].
export function angleDiff(from: number, to: number): number {
  return normalizeAngle(to - from + 180) - 180;
}
