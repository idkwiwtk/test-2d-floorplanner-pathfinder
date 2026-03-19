'use client';

import { useState, useCallback } from 'react';
import { Cell, GridPosition, InteractionMode } from '@/lib/types';
import { createSampleGrid } from '@/lib/grid';
import { findPath } from '@/lib/pathfinding';
import GridCanvas from './GridCanvas';
import ControlPanel from './ControlPanel';

export default function FloorPlannerPage() {
  const [grid, setGrid] = useState<Cell[][]>(() => createSampleGrid());
  const [start, setStart] = useState<GridPosition | null>(null);
  const [end, setEnd] = useState<GridPosition | null>(null);
  const [path, setPath] = useState<GridPosition[]>([]);
  const [mode, setMode] = useState<InteractionMode>('setStart');

  const handleCellClick = useCallback(
    (pos: GridPosition) => {
      const cell = grid[pos.row][pos.col];
      if (cell.type === 'wall' && mode !== 'toggleWall') return;

      switch (mode) {
        case 'setStart':
          setStart(pos);
          setPath([]);
          break;
        case 'setEnd':
          setEnd(pos);
          setPath([]);
          break;
        case 'toggleWall':
          setGrid((prev) =>
            prev.map((row, r) =>
              row.map((c, col) => {
                if (r !== pos.row || col !== pos.col) return c;
                return {
                  ...c,
                  type: c.type === 'wall' ? 'empty' : 'wall',
                };
              }),
            ),
          );
          setPath([]);
          break;
      }
    },
    [grid, mode],
  );

  const handleFindPath = useCallback(() => {
    if (!start || !end) return;
    const result = findPath(grid, start, end);
    setPath(result ?? []);
  }, [grid, start, end]);

  const handleReset = useCallback(() => {
    setGrid(createSampleGrid());
    setStart(null);
    setEnd(null);
    setPath([]);
    setMode('setStart');
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
        onModeChange={setMode}
        onFindPath={handleFindPath}
        onReset={handleReset}
      />

      <div className="rounded border border-zinc-300 dark:border-zinc-700">
        <GridCanvas
          grid={grid}
          start={start}
          end={end}
          path={path}
          onCellClick={handleCellClick}
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
