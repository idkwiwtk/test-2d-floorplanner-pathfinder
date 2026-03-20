'use client';

import { useState, useCallback, useRef } from 'react';
import { KonvaEventObject } from 'konva/lib/Node';
import { Cell, CellType, GridPosition, InteractionMode, PlacedObject, ObjectTemplate } from '@/lib/types';
import { createSampleGrid } from '@/lib/grid';
import { findPath } from '@/lib/pathfinding';
import { CELL_SIZE, GRID_ROWS, GRID_COLS } from '@/lib/constants';
import { isAreaBlocked } from '@/lib/collision';
import GridCanvas from './GridCanvas';
import ControlPanel from './ControlPanel';

function updateCell(grid: Cell[][], pos: GridPosition, type: CellType): Cell[][] {
  return grid.map((row, r) =>
    row.map((c, col) => {
      if (r !== pos.row || col !== pos.col) return c;
      return { ...c, type };
    }),
  );
}

export default function FloorPlannerPage() {
  const [grid, setGrid] = useState<Cell[][]>(() => createSampleGrid());
  const [start, setStart] = useState<GridPosition | null>(null);
  const [end, setEnd] = useState<GridPosition | null>(null);
  const [path, setPath] = useState<GridPosition[]>([]);
  const [mode, setMode] = useState<InteractionMode>('setStart');
  const [objects, setObjects] = useState<PlacedObject[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ObjectTemplate | null>(null);
  const [hoverCell, setHoverCell] = useState<GridPosition | null>(null);
  const [hoverBlocked, setHoverBlocked] = useState(false);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [dragPreviewPos, setDragPreviewPos] = useState<GridPosition | null>(null);
  const [dragBlocked, setDragBlocked] = useState(false);

  const isDrawing = useRef(false);
  const paintType = useRef<CellType>('wall');
  const lastHoverCell = useRef<GridPosition | null>(null);
  const isDraggingObject = useRef(false);
  const lastDragCell = useRef<GridPosition | null>(null);

  const handleCellClick = useCallback(
    (pos: GridPosition) => {
      if (mode === 'toggleWall' || mode === 'toggleDoor' || mode === 'placeObject') return;

      // In editObject mode, clicking empty area deselects
      if (mode === 'editObject') {
        setSelectedObjectId(null);
        return;
      }

      const cell = grid[pos.row][pos.col];
      if (cell.type === 'wall') return;

      switch (mode) {
        case 'setStart':
          setStart(pos);
          setPath([]);
          break;
        case 'setEnd':
          setEnd(pos);
          setPath([]);
          break;
      }
    },
    [grid, mode],
  );

  const handleCellMouseDown = useCallback(
    (pos: GridPosition) => {
      if (mode !== 'toggleWall' && mode !== 'toggleDoor') return;

      isDrawing.current = true;
      const cell = grid[pos.row][pos.col];

      if (mode === 'toggleWall') {
        paintType.current = cell.type === 'wall' ? 'empty' : 'wall';
      } else {
        paintType.current = cell.type === 'door' ? 'empty' : 'door';
      }

      setGrid((prev) => updateCell(prev, pos, paintType.current));
      setPath([]);
    },
    [grid, mode],
  );

  const handleCellMouseEnter = useCallback(
    (pos: GridPosition) => {
      if (!isDrawing.current) return;
      setGrid((prev) => updateCell(prev, pos, paintType.current));
    },
    [],
  );

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;

    // Handle object drag end
    if (isDraggingObject.current && selectedObjectId) {
      isDraggingObject.current = false;
      lastDragCell.current = null;

      if (dragPreviewPos && !dragBlocked) {
        setObjects((prev) =>
          prev.map((o) =>
            o.id === selectedObjectId
              ? { ...o, row: dragPreviewPos.row, col: dragPreviewPos.col }
              : o,
          ),
        );
        setPath([]);
      }

      setDragPreviewPos(null);
      setDragBlocked(false);
      return;
    }

    isDraggingObject.current = false;
    lastDragCell.current = null;
  }, [selectedObjectId, dragPreviewPos, dragBlocked]);

  const handleStageMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (!pos) return;

      // Object drag
      if (isDraggingObject.current && selectedObjectId) {
        const obj = objects.find((o) => o.id === selectedObjectId);
        if (!obj) return;

        let col = Math.floor(pos.x / CELL_SIZE);
        let row = Math.floor(pos.y / CELL_SIZE);

        col = Math.max(0, Math.min(col, GRID_COLS - obj.widthCells));
        row = Math.max(0, Math.min(row, GRID_ROWS - obj.heightCells));

        const last = lastDragCell.current;
        if (last && last.row === row && last.col === col) return;

        lastDragCell.current = { row, col };
        setDragPreviewPos({ row, col });
        setDragBlocked(
          isAreaBlocked(row, col, obj.widthCells, obj.heightCells, grid, objects, selectedObjectId),
        );
        return;
      }

      // Place object preview
      if (mode !== 'placeObject' || !selectedTemplate) return;

      let col = Math.floor(pos.x / CELL_SIZE);
      let row = Math.floor(pos.y / CELL_SIZE);

      col = Math.max(0, Math.min(col, GRID_COLS - selectedTemplate.widthCells));
      row = Math.max(0, Math.min(row, GRID_ROWS - selectedTemplate.heightCells));

      const last = lastHoverCell.current;
      if (last && last.row === row && last.col === col) return;

      lastHoverCell.current = { row, col };
      setHoverCell({ row, col });
      setHoverBlocked(
        isAreaBlocked(row, col, selectedTemplate.widthCells, selectedTemplate.heightCells, grid, objects),
      );
    },
    [mode, selectedTemplate, grid, objects, selectedObjectId],
  );

  const handleStageClick = useCallback(
    () => {
      if (mode === 'editObject') return;
      if (mode !== 'placeObject' || !selectedTemplate || !hoverCell) return;
      if (hoverBlocked) return;

      const newObj: PlacedObject = {
        id: crypto.randomUUID(),
        row: hoverCell.row,
        col: hoverCell.col,
        widthCells: selectedTemplate.widthCells,
        heightCells: selectedTemplate.heightCells,
        label: selectedTemplate.label,
        color: selectedTemplate.color,
      };

      setObjects((prev) => [...prev, newObj]);
    },
    [mode, selectedTemplate, hoverCell, hoverBlocked],
  );

  const handleObjectClick = useCallback(
    (id: string) => {
      // Any mode → switch to editObject and select
      setMode('editObject');
      setSelectedObjectId(id);
      setSelectedTemplate(null);
      setHoverCell(null);
      setHoverBlocked(false);
      lastHoverCell.current = null;
    },
    [],
  );

  const handleObjectMouseDown = useCallback(
    (id: string) => {
      if (selectedObjectId !== id) return;
      isDraggingObject.current = true;
      lastDragCell.current = null;
    },
    [selectedObjectId],
  );

  const handleDeleteObject = useCallback(() => {
    if (!selectedObjectId) return;
    setObjects((prev) => prev.filter((o) => o.id !== selectedObjectId));
    setSelectedObjectId(null);
    setPath([]);
  }, [selectedObjectId]);

  const handleRotateObject = useCallback(() => {
    if (!selectedObjectId) return;
    const obj = objects.find((o) => o.id === selectedObjectId);
    if (!obj) return;

    const newWidth = obj.heightCells;
    const newHeight = obj.widthCells;

    if (isAreaBlocked(obj.row, obj.col, newWidth, newHeight, grid, objects, selectedObjectId)) return;

    setObjects((prev) =>
      prev.map((o) =>
        o.id === selectedObjectId
          ? { ...o, widthCells: newWidth, heightCells: newHeight }
          : o,
      ),
    );
    setPath([]);
  }, [selectedObjectId, objects, grid]);

  const handleSelectTemplate = useCallback((template: ObjectTemplate) => {
    setSelectedTemplate(template);
    setMode('placeObject');
    setHoverCell(null);
    setHoverBlocked(false);
    setSelectedObjectId(null);
    lastHoverCell.current = null;
  }, []);

  const handleModeChange = useCallback((newMode: InteractionMode) => {
    setMode(newMode);
    if (newMode !== 'placeObject') {
      setSelectedTemplate(null);
      setHoverCell(null);
      setHoverBlocked(false);
      lastHoverCell.current = null;
    }
    if (newMode !== 'editObject') {
      setSelectedObjectId(null);
    }
    setDragPreviewPos(null);
    setDragBlocked(false);
    isDraggingObject.current = false;
    lastDragCell.current = null;
  }, []);

  const handleFindPath = useCallback(() => {
    if (!start || !end) return;
    const result = findPath(grid, start, end, objects);
    setPath(result ?? []);
  }, [grid, start, end, objects]);

  const handleReset = useCallback(() => {
    setGrid(createSampleGrid());
    setStart(null);
    setEnd(null);
    setPath([]);
    setMode('setStart');
    setObjects([]);
    setSelectedTemplate(null);
    setHoverCell(null);
    setHoverBlocked(false);
    setSelectedObjectId(null);
    setDragPreviewPos(null);
    setDragBlocked(false);
    lastHoverCell.current = null;
    isDraggingObject.current = false;
    lastDragCell.current = null;
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        2D Floor Planner
      </h1>

      <ControlPanel
        mode={mode}
        start={start}
        end={end}
        pathLength={path.length}
        selectedTemplate={selectedTemplate}
        hasSelectedObject={selectedObjectId !== null}
        onModeChange={handleModeChange}
        onFindPath={handleFindPath}
        onReset={handleReset}
        onSelectTemplate={handleSelectTemplate}
        onDeleteObject={handleDeleteObject}
        onRotateObject={handleRotateObject}
      />

      <div
        className="rounded border border-zinc-300 dark:border-zinc-700"
        onMouseLeave={() => {
          setHoverCell(null);
          if (isDraggingObject.current) {
            isDraggingObject.current = false;
            lastDragCell.current = null;
            setDragPreviewPos(null);
            setDragBlocked(false);
          }
        }}
      >
        <GridCanvas
          grid={grid}
          start={start}
          end={end}
          path={path}
          objects={objects}
          selectedObjectId={selectedObjectId}
          dragPreviewPos={dragPreviewPos}
          dragBlocked={dragBlocked}
          previewCell={hoverCell}
          previewTemplate={selectedTemplate}
          previewBlocked={hoverBlocked}
          onCellClick={handleCellClick}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseEnter={handleCellMouseEnter}
          onMouseUp={handleMouseUp}
          onStageMouseMove={handleStageMouseMove}
          onStageClick={handleStageClick}
          onObjectClick={handleObjectClick}
          onObjectMouseDown={handleObjectMouseDown}
        />
      </div>

      {path.length === 0 && start && end && (
        <p className="text-sm text-zinc-500">
          경로 찾기 버튼을 클릭하세요. 경로가 없으면 벽을 확인해주세요.
        </p>
      )}
    </div>
  );
}
