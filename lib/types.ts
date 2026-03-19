export type CellType = 'empty' | 'wall' | 'door';

export interface GridPosition {
  row: number;
  col: number;
}

export interface Cell {
  row: number;
  col: number;
  type: CellType;
}

export interface PathNode {
  position: GridPosition;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export type InteractionMode = 'setStart' | 'setEnd' | 'toggleWall' | 'toggleDoor';
