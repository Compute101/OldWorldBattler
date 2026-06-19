let nextId = 1;
export function makeId(prefix = 'unit'): string {
  return `${prefix}-${Date.now()}-${nextId++}`;
}
