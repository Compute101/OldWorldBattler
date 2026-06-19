import { useEffect, useMemo, useRef, useState } from 'react';
import Board from './Board';
import type { BoardState, HistoryStep, Selection, UnitTransform } from '../types';
import { easeInOutCubic, lerpTransform, snapshotUnits } from '../units';

interface Props {
  board: BoardState;
  breadcrumb: string;
  onExit: () => void;
}

const ANIMATION_MS = 600;

// Smoothly tweens a unit-id-keyed transform map toward `target` whenever it changes,
// taking the shortest path around for facing so units don't spin the long way.
function useAnimatedTransforms(target: Record<string, UnitTransform>) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const displayRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    function tick(now: number) {
      const t = Math.min(1, (now - start) / ANIMATION_MS);
      const eased = easeInOutCubic(t);
      const ids = new Set([...Object.keys(from), ...Object.keys(target)]);
      const next: Record<string, UnitTransform> = {};
      for (const id of ids) {
        const a = from[id] ?? target[id];
        const b = target[id] ?? from[id];
        if (!a || !b) continue;
        next[id] = lerpTransform(a, b, eased);
      }
      displayRef.current = next;
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      fromRef.current = displayRef.current;
    };
  }, [target]);

  return display;
}

export default function ReplayView({ board, breadcrumb, onExit }: Props) {
  const steps = useMemo<HistoryStep[]>(() => {
    const now: HistoryStep = {
      id: 'current',
      turn: board.turn,
      kind: 'sub',
      label: 'Now',
      transforms: snapshotUnits(board.units),
    };
    return [...board.history, now];
  }, [board.history, board.units, board.turn]);

  const [index, setIndex] = useState(steps.length - 1);
  const clampedIndex = Math.min(index, steps.length - 1);
  const step = steps[clampedIndex];
  const animated = useAnimatedTransforms(step.transforms);
  const [selection, setSelection] = useState<Selection | null>(null);

  const replayUnits = useMemo(
    () => board.units.filter((u) => animated[u.id]).map((u) => ({ ...u, ...animated[u.id] })),
    [board.units, animated],
  );

  const replayBoard: BoardState = { ...board, units: replayUnits };

  function goTo(i: number) {
    setIndex(Math.max(0, Math.min(steps.length - 1, i)));
  }

  return (
    <div className="app">
      <div className="main">
        <div className="toolbar">
          <button onClick={onExit}>← Exit Replay</button>
          <span className="toolbar-breadcrumb">{breadcrumb} — Replay</span>
        </div>
        <Board
          board={replayBoard}
          selection={selection}
          onSelect={setSelection}
          onUpdateUnit={() => {}}
          onMoveTerrain={() => {}}
          onRotateTerrain={() => {}}
          snapIn={0}
          mode="select"
          readOnly
        />
        <div className="replay-timeline">
          <button onClick={() => goTo(clampedIndex - 1)} disabled={clampedIndex === 0}>
            ◀ Prev
          </button>
          <input
            type="range"
            min={0}
            max={steps.length - 1}
            value={clampedIndex}
            onChange={(e) => goTo(Number(e.target.value))}
          />
          <button onClick={() => goTo(clampedIndex + 1)} disabled={clampedIndex === steps.length - 1}>
            Next ▶
          </button>
          <span className="replay-step-label">
            Turn {step.turn} — {step.label}
          </span>
        </div>
      </div>
    </div>
  );
}
