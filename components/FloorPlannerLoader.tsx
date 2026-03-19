'use client';

import dynamic from 'next/dynamic';

const FloorPlannerPage = dynamic(
  () => import('@/components/FloorPlannerPage'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 text-zinc-500">
        Loading floor planner...
      </div>
    ),
  },
);

export default function FloorPlannerLoader() {
  return <FloorPlannerPage />;
}
