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

export interface PlacedObject {
  id: string;
  row: number;
  col: number;
  widthCells: number;
  heightCells: number;
  label: string;
  color: string;
}

export interface ObjectTemplate {
  label: string;
  widthCells: number;
  heightCells: number;
  color: string;
}

export type InteractionMode = 'setStart' | 'setEnd' | 'toggleWall' | 'toggleDoor' | 'placeObject' | 'editObject';
