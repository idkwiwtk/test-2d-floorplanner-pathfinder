'use client';

import { InteractionMode, GridPosition, ObjectTemplate } from '@/lib/types';
import { OBJECT_TEMPLATES } from '@/lib/constants';

interface ControlPanelProps {
  mode: InteractionMode;
  start: GridPosition | null;
  end: GridPosition | null;
  pathLength: number;
  selectedTemplate: ObjectTemplate | null;
  hasSelectedObject: boolean;
  onModeChange: (mode: InteractionMode) => void;
  onFindPath: () => void;
  onReset: () => void;
  onSelectTemplate: (template: ObjectTemplate) => void;
  onDeleteObject: () => void;
  onRotateObject: () => void;
}

const MODE_LABELS: Record<InteractionMode, string> = {
  setStart: '출발점 설정',
  setEnd: '도착점 설정',
  toggleWall: '벽 토글',
  toggleDoor: '문 토글',
  placeObject: '가구 배치',
  editObject: '가구 편집',
};

export default function ControlPanel({
  mode,
  start,
  end,
  pathLength,
  selectedTemplate,
  hasSelectedObject,
  onModeChange,
  onFindPath,
  onReset,
  onSelectTemplate,
  onDeleteObject,
  onRotateObject,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        {(Object.keys(MODE_LABELS) as InteractionMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onModeChange(m)}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === m
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600'
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}

        <div className="mx-2 h-6 w-px bg-zinc-300 dark:bg-zinc-600" />

        <button
          onClick={onFindPath}
          disabled={!start || !end}
          className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          경로 찾기
        </button>

        <button
          onClick={onReset}
          className="rounded bg-zinc-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-zinc-600"
        >
          초기화
        </button>

        <div className="ml-4 flex gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          {start && (
            <span>
              출발: ({start.row}, {start.col})
            </span>
          )}
          {end && (
            <span>
              도착: ({end.row}, {end.col})
            </span>
          )}
          {pathLength > 0 && <span>경로 길이: {pathLength}</span>}
        </div>
      </div>

      {mode === 'placeObject' && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-1">오브젝트:</span>
          {OBJECT_TEMPLATES.map((t) => (
            <button
              key={t.label}
              onClick={() => onSelectTemplate(t)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedTemplate?.label === t.label
                  ? 'ring-2 ring-blue-500 text-white'
                  : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600'
              }`}
              style={
                selectedTemplate?.label === t.label
                  ? { backgroundColor: t.color }
                  : undefined
              }
            >
              {t.label} ({t.widthCells}×{t.heightCells})
            </button>
          ))}
        </div>
      )}

      {mode === 'editObject' && hasSelectedObject && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 dark:text-zinc-400 mr-1">선택된 가구:</span>
          <button
            onClick={onRotateObject}
            className="rounded bg-amber-500 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-600"
          >
            90° 회전
          </button>
          <button
            onClick={onDeleteObject}
            className="rounded bg-red-500 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
