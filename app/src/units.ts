import type { Unit } from './types';

export const MM_PER_INCH = 25.4;

export function footprintInches(unit: Unit): { widthIn: number; depthIn: number } {
  return {
    widthIn: (unit.files * unit.baseWidthMm) / MM_PER_INCH,
    depthIn: (unit.ranks * unit.baseDepthMm) / MM_PER_INCH,
  };
}

let nextId = 1;
export function makeId(): string {
  return `unit-${Date.now()}-${nextId++}`;
}

export const FACTION_COLORS = [
  '#c0392b', '#2980b9', '#27ae60', '#8e44ad',
  '#d35400', '#16a085', '#f39c12', '#7f8c8d',
];

export function defaultUnit(faction: string, color: string): Unit {
  return {
    id: makeId(),
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
