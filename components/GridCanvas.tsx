'use client';

import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Cell, GridPosition, PlacedObject, ObjectTemplate } from '@/lib/types';
import { CELL_SIZE, CELL_COLORS, PREVIEW_OPACITY } from '@/lib/constants';

interface GridCanvasProps {
  grid: Cell[][];
  start: GridPosition | null;
  end: GridPosition | null;
  path: GridPosition[];
  objects: PlacedObject[];
  selectedObjectId: string | null;
  dragPreviewPos: GridPosition | null;
  dragBlocked: boolean;
  previewCell: GridPosition | null;
  previewTemplate: ObjectTemplate | null;
  previewBlocked: boolean;
  onCellClick: (pos: GridPosition) => void;
  onCellMouseDown: (pos: GridPosition) => void;
  onCellMouseEnter: (pos: GridPosition) => void;
  onMouseUp: () => void;
  onStageMouseMove: (e: KonvaEventObject<MouseEvent>) => void;
  onStageClick: (e: KonvaEventObject<MouseEvent>) => void;
  onObjectClick: (id: string) => void;
  onObjectMouseDown: (id: string) => void;
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
  objects,
  selectedObjectId,
  dragPreviewPos,
  dragBlocked,
  previewCell,
  previewTemplate,
  previewBlocked,
  onCellClick,
  onCellMouseDown,
  onCellMouseEnter,
  onMouseUp,
  onStageMouseMove,
  onStageClick,
  onObjectClick,
  onObjectMouseDown,
}: GridCanvasProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const width = cols * CELL_SIZE;
  const height = rows * CELL_SIZE;

  const pathSet = new Set(path.map((p) => `${p.row},${p.col}`));

  return (
    <Stage
      width={width}
      height={height}
      onMouseUp={onMouseUp}
      onTouchEnd={onMouseUp}
      onMouseMove={onStageMouseMove}
      onClick={onStageClick}
    >
      {/* Grid Layer */}
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
              onMouseDown={() => onCellMouseDown({ row: r, col: c })}
              onMouseEnter={() => onCellMouseEnter({ row: r, col: c })}
            />
          )),
        )}
      </Layer>

      {/* Objects Layer */}
      <Layer>
        {objects.map((obj) => {
          const objW = obj.widthCells * CELL_SIZE;
          const objH = obj.heightCells * CELL_SIZE;
          const isSelected = obj.id === selectedObjectId;
          const isDragging = isSelected && dragPreviewPos !== null;
          return (
            <Group
              key={obj.id}
              onClick={() => onObjectClick(obj.id)}
              onTap={() => onObjectClick(obj.id)}
              onMouseDown={() => onObjectMouseDown(obj.id)}
            >
              <Rect
                x={obj.col * CELL_SIZE}
                y={obj.row * CELL_SIZE}
                width={objW}
                height={objH}
                fill={obj.color}
                opacity={isDragging ? 0.3 : 1}
                stroke={isSelected ? '#3b82f6' : '#333'}
                strokeWidth={isSelected ? 2 : 1}
                cornerRadius={2}
              />
              {!isDragging && (
                <Text
                  x={obj.col * CELL_SIZE}
                  y={obj.row * CELL_SIZE}
                  width={objW}
                  height={objH}
                  text={obj.label}
                  fontSize={10}
                  fill="#fff"
                  align="center"
                  verticalAlign="middle"
                  listening={false}
                />
              )}
            </Group>
          );
        })}
      </Layer>

      {/* Drag Preview / Place Preview Layer */}
      <Layer listening={false}>
        {/* Object drag preview */}
        {dragPreviewPos && selectedObjectId && (() => {
          const obj = objects.find((o) => o.id === selectedObjectId);
          if (!obj) return null;
          const previewColor = dragBlocked ? '#ef4444' : obj.color;
          return (
            <Group>
              <Rect
                x={dragPreviewPos.col * CELL_SIZE}
                y={dragPreviewPos.row * CELL_SIZE}
                width={obj.widthCells * CELL_SIZE}
                height={obj.heightCells * CELL_SIZE}
                fill={previewColor}
                opacity={PREVIEW_OPACITY}
                stroke={previewColor}
                strokeWidth={1}
                dash={[4, 4]}
              />
              <Text
                x={dragPreviewPos.col * CELL_SIZE}
                y={dragPreviewPos.row * CELL_SIZE}
                width={obj.widthCells * CELL_SIZE}
                height={obj.heightCells * CELL_SIZE}
                text={obj.label}
                fontSize={10}
                fill="#fff"
                align="center"
                verticalAlign="middle"
              />
            </Group>
          );
        })()}

        {/* Place object preview */}
        {previewCell && previewTemplate && (
          <Rect
            x={previewCell.col * CELL_SIZE}
            y={previewCell.row * CELL_SIZE}
            width={previewTemplate.widthCells * CELL_SIZE}
            height={previewTemplate.heightCells * CELL_SIZE}
            fill={previewBlocked ? '#ef4444' : previewTemplate.color}
            opacity={PREVIEW_OPACITY}
            stroke={previewBlocked ? '#ef4444' : previewTemplate.color}
            strokeWidth={1}
            dash={[4, 4]}
          />
        )}
      </Layer>
    </Stage>
  );
}
