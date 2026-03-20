export const GRID_ROWS = 20;
export const GRID_COLS = 30;
export const CELL_SIZE = 25;

export const CELL_COLORS: Record<string, string> = {
  empty: '#f0f0f0',
  wall: '#333333',
  door: '#8B4513',
  start: '#22c55e',
  end: '#ef4444',
  path: '#3b82f6',
};

export const OBJECT_TEMPLATES = [
  { label: 'Table', widthCells: 3, heightCells: 2, color: '#a0522d' },
  { label: 'Desk', widthCells: 2, heightCells: 1, color: '#6b8e23' },
  { label: 'Sofa', widthCells: 4, heightCells: 2, color: '#4682b4' },
  { label: 'Chair', widthCells: 1, heightCells: 1, color: '#daa520' },
] as const;

export const PREVIEW_OPACITY = 0.4;
