import { Cell, PlacedObject } from './types';

export function isAreaBlocked(
  row: number,
  col: number,
  widthCells: number,
  heightCells: number,
  grid: Cell[][],
  objects: PlacedObject[],
  excludeId?: string,
): boolean {
  // Check grid cells (wall blocks placement)
  for (let r = row; r < row + heightCells; r++) {
    for (let c = col; c < col + widthCells; c++) {
      if (!grid[r] || !grid[r][c]) return true;
      if (grid[r][c].type === 'wall') return true;
    }
  }

  // Check overlap with existing objects (AABB)
  for (const obj of objects) {
    if (obj.id === excludeId) continue;
    const overlapsH = col < obj.col + obj.widthCells && col + widthCells > obj.col;
    const overlapsV = row < obj.row + obj.heightCells && row + heightCells > obj.row;
    if (overlapsH && overlapsV) return true;
  }

  return false;
}

export function buildObjectCellSet(objects: PlacedObject[]): Set<string> {
  const set = new Set<string>();
  for (const obj of objects) {
    for (let r = obj.row; r < obj.row + obj.heightCells; r++) {
      for (let c = obj.col; c < obj.col + obj.widthCells; c++) {
        set.add(`${r},${c}`);
      }
    }
  }
  return set;
}
