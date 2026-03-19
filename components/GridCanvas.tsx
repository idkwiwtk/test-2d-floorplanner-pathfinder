'use client';

import { Stage, Layer, Rect } from 'react-konva';
import { Cell, GridPosition } from '@/lib/types';
import { CELL_SIZE, CELL_COLORS } from '@/lib/constants';

interface GridCanvasProps {
  grid: Cell[][];
  start: GridPosition | null;
  end: GridPosition | null;
  path: GridPosition[];
  onCellClick: (pos: GridPosition) => void;
}

function getCellColor(
  cell: Cell,
  start: GridPosition | null,
  end: GridPosition | null,
  pathSet: Set<string>,
): string {
  const { row, col, type } = cell;
  if (start && start.row === row && start.col === col) return CELL_COLORS.start;
  if (end && end.row === row && end.col === col) return CELL_COLORS.end;
  if (pathSet.has(`${row},${col}`)) return CELL_COLORS.path;
  return CELL_COLORS[type] ?? CELL_COLORS.empty;
}

export default function GridCanvas({
  grid,
  start,
  end,
  path,
  onCellClick,
}: GridCanvasProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const width = cols * CELL_SIZE;
  const height = rows * CELL_SIZE;

  const pathSet = new Set(path.map((p) => `${p.row},${p.col}`));

  return (
    <Stage width={width} height={height}>
      <Layer>
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <Rect
              key={`${r}-${c}`}
              x={c * CELL_SIZE}
              y={r * CELL_SIZE}
              width={CELL_SIZE}
              height={CELL_SIZE}
              fill={getCellColor(cell, start, end, pathSet)}
              stroke="#ccc"
              strokeWidth={0.5}
              onClick={() => onCellClick({ row: r, col: c })}
              onTap={() => onCellClick({ row: r, col: c })}
            />
          )),
        )}
      </Layer>
    </Stage>
  );
}
