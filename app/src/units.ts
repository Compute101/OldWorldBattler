import type { BoardState, ColorScheme, IconType, Terrain, Unit, UnitTransform } from './types';

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

export const FACTION_COLORS: { name: string; hex: string }[] = [
  { name: 'Red', hex: '#c0392b' },
  { name: 'Crimson', hex: '#a51c30' },
  { name: 'Maroon', hex: '#6e2c2c' },
  { name: 'Orange', hex: '#d35400' },
  { name: 'Gold', hex: '#c8a02e' },
  { name: 'Yellow', hex: '#f39c12' },
  { name: 'Green', hex: '#27ae60' },
  { name: 'Dark Green', hex: '#1e5631' },
  { name: 'Teal', hex: '#16a085' },
  { name: 'Cyan', hex: '#3498db' },
  { name: 'Blue', hex: '#2980b9' },
  { name: 'Navy', hex: '#1f3a5f' },
  { name: 'Purple', hex: '#8e44ad' },
  { name: 'Magenta', hex: '#c0398e' },
  { name: 'Pink', hex: '#e08bb6' },
  { name: 'Brown', hex: '#7a5230' },
  { name: 'Black', hex: '#2c2c2c' },
  { name: 'White', hex: '#ecf0f1' },
  { name: 'Grey', hex: '#7f8c8d' },
  { name: 'Silver', hex: '#bdc3c7' },
];

export const TERRAIN_COLORS: { name: string; hex: string }[] = [
  { name: 'Olive Green', hex: '#5d6b3a' },
  { name: 'Dark Green', hex: '#3a4d2c' },
  { name: 'Brown', hex: '#7a6a4f' },
  { name: 'Dark Brown', hex: '#4f3f2a' },
  { name: 'Tan', hex: '#6b5a3a' },
  { name: 'Sand', hex: '#c2b280' },
  { name: 'Stone Grey', hex: '#8a8a8a' },
  { name: 'Grey', hex: '#5a5a5a' },
  { name: 'Teal', hex: '#3a6b6b' },
  { name: 'Rust', hex: '#8a4a2a' },
  { name: 'Snow White', hex: '#e8edf0' },
];

export const COLOR_SCHEMES: { value: ColorScheme; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'vertical', label: 'Vertical split' },
  { value: 'horizontal', label: 'Horizontal split' },
  { value: 'diagonal', label: 'Diagonal split' },
];

// Icon choices for unit markers, grouped for the sidebar dropdown. Troop-type
// icons reflect the Old World troop categories; the rest are generic
// weapon/symbol icons and faction emblems usable by any army.
export const ICON_GROUPS: { label: string; options: { value: IconType; label: string }[] }[] = [
  {
    label: 'Troop Types',
    options: [
      { value: 'infantry', label: 'Infantry (sword)' },
      { value: 'cavalry', label: 'Cavalry (heater shield)' },
      { value: 'chariot', label: 'Chariot (wheel)' },
      { value: 'monster', label: 'Monster (axe)' },
      { value: 'warMachine', label: 'War Machine (diamond)' },
      { value: 'character', label: 'Character (heart)' },
    ],
  },
  {
    label: 'Weapons',
    options: [
      { value: 'cannon', label: 'Cannon' },
      { value: 'handgun', label: 'Handgun' },
      { value: 'bowArrow', label: 'Bow & Arrow' },
      { value: 'arrow', label: 'Arrow' },
    ],
  },
  {
    label: 'Skulls & Bones',
    options: [
      { value: 'skull', label: 'Skull' },
      { value: 'orcSkull', label: 'Orc Skull' },
      { value: 'crossedBones', label: 'Crossed Bones' },
    ],
  },
  {
    label: 'Faction Symbols',
    options: [
      { value: 'chaosStar', label: 'Chaos Star (Chaos)' },
      { value: 'dwarfHammer', label: 'Rune Hammer (Dwarfs)' },
      { value: 'hammer', label: 'Hammer (Dwarfs)' },
      { value: 'anvil', label: 'Anvil (Dwarfs)' },
      { value: 'hammerAnvil', label: 'Hammer & Anvil (Dwarfs)' },
      { value: 'roundShield', label: 'Round Shield (Dwarfs)' },
      { value: 'phoenix', label: 'Phoenix (High Elves)' },
      { value: 'leaf', label: 'Leaf (Wood Elves)' },
      { value: 'ratClaw', label: 'Rat Claw (Skaven)' },
      { value: 'vampireBat', label: 'Bat (Vampire Counts)' },
      { value: 'comet', label: 'Twin-Tailed Comet (Empire)' },
      { value: 'fleurDeLis', label: 'Fleur-de-Lis (Bretonnia)' },
      { value: 'ankh', label: 'Ankh (Tomb Kings)' },
      { value: 'sunDisc', label: 'Sun Disc (Lizardmen)' },
      { value: 'spider', label: 'Spider (Dark Elves)' },
    ],
  },
];

export function defaultUnit(faction: string, colorMajor: string, colorMinor = '#e8e8e8'): Unit {
  return {
    id: makeId('unit'),
    name: 'New Unit',
    faction,
    colorMajor,
    colorMinor,
    colorScheme: 'solid',
    icon: 'infantry',
    baseWidthMm: 25,
    baseDepthMm: 25,
    ranks: 1,
    files: 5,
    x: 24,
    y: 24,
    facing: 0,
    movementIn: 4,
    marching: false,
    notes: '',
  };
}

// Backfills units saved before colour/unit-type/icon fields existed.
export function normalizeUnit(unit: Partial<Unit> & { color?: string; unitType?: IconType }): Unit {
  const { color, unitType, ...rest } = unit;
  const base = defaultUnit(unit.faction ?? 'Faction', unit.colorMajor ?? color ?? FACTION_COLORS[0].hex);
  return { ...base, icon: unitType ?? base.icon, ...rest };
}

export function defaultTerrain(centerX: number, centerY: number): Terrain {
  return {
    id: makeId('terrain'),
    name: 'Terrain',
    shape: 'rect',
    color: TERRAIN_COLORS[0].hex,
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
    moveUsed: {},
    movementUnlocked: false,
    log: [],
  };
}

// A unit deeper than it is wide (more ranks than files) is in Marching Column,
// which lets it triple (rather than double) its Movement when marching.
export function isMarchingColumn(unit: Unit): boolean {
  return unit.ranks > unit.files;
}

// Remaining movement allowance for a unit this turn, in inches.
export function remainingMoveIn(unit: Unit, moveUsedIn: number, unlocked: boolean): number {
  if (unlocked) return Infinity;
  const marchMultiplier = isMarchingColumn(unit) ? 3 : 2;
  const allowance = unit.movementIn * (unit.marching ? marchMultiplier : 1);
  return Math.max(0, allowance - moveUsedIn);
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
