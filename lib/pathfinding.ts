import { Cell, GridPosition, PathNode } from './types';

const DIRECTIONS = [
  { dr: -1, dc: 0 },
  { dr: 1, dc: 0 },
  { dr: 0, dc: -1 },
  { dr: 0, dc: 1 },
];

function manhattan(a: GridPosition, b: GridPosition): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function key(pos: GridPosition): string {
  return `${pos.row},${pos.col}`;
}

export function findPath(
  grid: Cell[][],
  start: GridPosition,
  end: GridPosition,
): GridPosition[] | null {
  const rows = grid.length;
  const cols = grid[0].length;

  const closed = new Set<string>();
  const open: PathNode[] = [];

  const h = manhattan(start, end);
  open.push({ position: start, g: 0, h, f: h, parent: null });

  while (open.length > 0) {
    // Find node with lowest f
    let bestIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[bestIdx].f) bestIdx = i;
    }
    const current = open.splice(bestIdx, 1)[0];
    const ck = key(current.position);

    if (closed.has(ck)) continue;
    closed.add(ck);

    // Reached the goal
    if (current.position.row === end.row && current.position.col === end.col) {
      const path: GridPosition[] = [];
      let node: PathNode | null = current;
      while (node) {
        path.unshift(node.position);
        node = node.parent;
      }
      return path;
    }

    // Explore neighbors
    for (const { dr, dc } of DIRECTIONS) {
      const nr = current.position.row + dr;
      const nc = current.position.col + dc;

      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc].type === 'wall') continue;

      const nk = key({ row: nr, col: nc });
      if (closed.has(nk)) continue;

      const g = current.g + 1;
      const nh = manhattan({ row: nr, col: nc }, end);
      open.push({
        position: { row: nr, col: nc },
        g,
        h: nh,
        f: g + nh,
        parent: current,
      });
    }
  }

  return null;
}
