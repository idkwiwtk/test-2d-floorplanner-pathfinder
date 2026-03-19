import { Cell } from './types';
import { GRID_ROWS, GRID_COLS } from './constants';

export function createEmptyGrid(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      type: 'empty' as const,
    })),
  );
}

export function createSampleGrid(): Cell[][] {
  const grid = createEmptyGrid(GRID_ROWS, GRID_COLS);

  const setWall = (row: number, col: number) => {
    if (grid[row]?.[col]) grid[row][col].type = 'wall';
  };
  const setDoor = (row: number, col: number) => {
    if (grid[row]?.[col]) grid[row][col].type = 'door';
  };

  // Outer walls
  for (let c = 0; c < GRID_COLS; c++) {
    setWall(0, c);
    setWall(GRID_ROWS - 1, c);
  }
  for (let r = 0; r < GRID_ROWS; r++) {
    setWall(r, 0);
    setWall(r, GRID_COLS - 1);
  }

  // Vertical wall at col 13, rows 1-11
  for (let r = 1; r <= 11; r++) {
    setWall(r, 13);
  }
  // Door openings in vertical wall
  setDoor(4, 13);
  setDoor(10, 13);

  // Horizontal wall from col 13 to col 28, row 7
  for (let c = 13; c <= 28; c++) {
    setWall(7, c);
  }
  // Door in horizontal wall
  setDoor(7, 20);

  // L-shaped wall: horizontal at row 12, col 1-9
  for (let c = 1; c <= 9; c++) {
    setWall(12, c);
  }
  // Vertical part of L: col 9, rows 12-16
  for (let r = 12; r <= 16; r++) {
    setWall(r, 9);
  }
  // Door in L wall
  setDoor(12, 5);
  setDoor(14, 9);

  return grid;
}
