import { useRef } from 'react';
import type { Phase, Unit } from '../types';
import { footprintInches, localToBoard, normalizeAngle, rotateVec, screenToBoardPoint } from '../units';
import UnitTypeIcon from './UnitTypeIcon';

interface Props {
  unit: Unit;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Unit>, costIn?: number) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  snapIn: number;
  phase: Phase;
  remainingIn: number;
}

type WheelCorner = 'fl' | 'fr';

export default function UnitToken({ unit, selected, onSelect, onUpdate, svgRef, snapIn, phase, remainingIn }: Props) {
  const { widthIn, depthIn } = footprintInches(unit);
  const dragOffset = useRef<{ dx: number; dy: number } | null>(null);
  const rotating = useRef(false);
  const reformCharged = useRef(false);
  const wheeling = useRef<{
    pivot: { x: number; y: number };
    pivotLocal: { x: number; y: number };
    corner: WheelCorner;
  } | null>(null);

  const flLocal = { x: -widthIn / 2, y: -depthIn / 2 };
  const frLocal = { x: widthIn / 2, y: -depthIn / 2 };

  function toBoardPoint(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    return screenToBoardPoint(svg, clientX, clientY);
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    onSelect(unit.id);
    const p = toBoardPoint(e.clientX, e.clientY);
    dragOffset.current = { dx: p.x - unit.x, dy: p.y - unit.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragOffset.current) return;
    const p = toBoardPoint(e.clientX, e.clientY);
    let x = p.x - dragOffset.current.dx;
    let y = p.y - dragOffset.current.dy;
    if (snapIn > 0) {
      x = Math.round(x / snapIn) * snapIn;
      y = Math.round(y / snapIn) * snapIn;
    }
    if (phase === 'battle') {
      const dist = Math.hypot(x - unit.x, y - unit.y);
      if (dist <= 0) return;
      if (remainingIn <= 0) return;
      if (dist > remainingIn) {
        const scale = remainingIn / dist;
        x = unit.x + (x - unit.x) * scale;
        y = unit.y + (y - unit.y) * scale;
      }
      onUpdate(unit.id, { x, y }, Math.hypot(x - unit.x, y - unit.y));
      return;
    }
    onUpdate(unit.id, { x, y });
  }

  function handlePointerUp(e: React.PointerEvent) {
    dragOffset.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  }

  function handleRotateDown(e: React.PointerEvent) {
    e.stopPropagation();
    onSelect(unit.id);
    rotating.current = true;
    reformCharged.current = false;
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handleRotateMove(e: React.PointerEvent) {
    if (!rotating.current) return;
    const p = toBoardPoint(e.clientX, e.clientY);
    const dx = p.x - unit.x;
    const dy = p.y - unit.y;
    const facing = normalizeAngle((Math.atan2(dx, -dy) * 180) / Math.PI);
    if (phase === 'battle') {
      if (!reformCharged.current) {
        if (remainingIn <= 0) return;
        reformCharged.current = true;
        onUpdate(unit.id, { facing: Math.round(facing) }, remainingIn);
        return;
      }
      onUpdate(unit.id, { facing: Math.round(facing) });
      return;
    }
    onUpdate(unit.id, { facing: Math.round(facing) });
  }

  function handleRotateUp(e: React.PointerEvent) {
    rotating.current = false;
    (e.target as Element).releasePointerCapture(e.pointerId);
  }

  function wheelDown(corner: WheelCorner, e: React.PointerEvent) {
    e.stopPropagation();
    onSelect(unit.id);
    const pivotLocal = corner === 'fl' ? frLocal : flLocal;
    wheeling.current = { pivot: localToBoard(unit, pivotLocal), pivotLocal, corner };
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function wheelMove(e: React.PointerEvent) {
    if (!wheeling.current) return;
    const p = toBoardPoint(e.clientX, e.clientY);
    const { pivot, pivotLocal, corner } = wheeling.current;
    const angle = (Math.atan2(p.y - pivot.y, p.x - pivot.x) * 180) / Math.PI;
    const facing = normalizeAngle(corner === 'fl' ? angle - 180 : angle);
    const offset = rotateVec(pivotLocal.x, pivotLocal.y, facing);
    const x = Math.round((pivot.x - offset.x) * 100) / 100;
    const y = Math.round((pivot.y - offset.y) * 100) / 100;

    if (phase === 'battle') {
      if (remainingIn <= 0) return;
      // the outside corner sweeps the furthest, so its arc length is the move cost
      const outsideLocal = corner === 'fl' ? flLocal : frLocal;
      const oldOutside = localToBoard(unit, outsideLocal);
      const newOutside = localToBoard({ ...unit, x, y, facing }, outsideLocal);
      const dist = Math.hypot(newOutside.x - oldOutside.x, newOutside.y - oldOutside.y);
      if (dist > remainingIn) return;
      onUpdate(unit.id, { facing: Math.round(facing), x, y }, dist);
      return;
    }

    onUpdate(unit.id, { facing: Math.round(facing), x, y });
  }

  function handleWheelUp(e: React.PointerEvent) {
    wheeling.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  }

  const handleSize = Math.max(0.25, Math.min(widthIn, depthIn) * 0.18);

  return (
    <g
      transform={`translate(${unit.x} ${unit.y}) rotate(${unit.facing})`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ cursor: 'grab' }}
    >
      {selected && phase === 'battle' && Number.isFinite(remainingIn) && (
        <circle
          cx={0}
          cy={0}
          r={remainingIn}
          fill="none"
          stroke="#22d3ee"
          strokeOpacity={0.4}
          strokeWidth={0.05}
          strokeDasharray="0.3 0.3"
          pointerEvents="none"
        />
      )}
      <UnitFill unit={unit} widthIn={widthIn} depthIn={depthIn} selected={selected} />
      {/* facing arrow */}
      <line x1={0} y1={0} x2={0} y2={-depthIn / 2} stroke="#ffffff" strokeWidth={0.08} />
      <polygon
        points={`0,${-depthIn / 2 - 0.4} -0.3,${-depthIn / 2 + 0.2} 0.3,${-depthIn / 2 + 0.2}`}
        fill="#ffffff"
      />
      <g transform={`rotate(${-unit.facing})`} style={{ pointerEvents: 'none' }}>
        <UnitTypeIcon icon={unit.icon} size={Math.min(widthIn, depthIn) * 0.6} />
      </g>

      {selected && (
        <>
          {/* rotate-in-place handle */}
          <circle
            cx={0}
            cy={-depthIn / 2 - 0.9}
            r={handleSize}
            fill="#22d3ee"
            stroke="#000"
            strokeWidth={0.04}
            onPointerDown={handleRotateDown}
            onPointerMove={handleRotateMove}
            onPointerUp={handleRotateUp}
            style={{ cursor: 'grab' }}
          />
          <line
            x1={0}
            y1={-depthIn / 2}
            x2={0}
            y2={-depthIn / 2 - 0.9}
            stroke="#22d3ee"
            strokeWidth={0.04}
            pointerEvents="none"
          />

          {/* wheel handles - pivot around the opposite front corner */}
          <circle
            cx={flLocal.x}
            cy={flLocal.y}
            r={handleSize}
            fill="#f59e0b"
            stroke="#000"
            strokeWidth={0.04}
            onPointerDown={(e) => wheelDown('fl', e)}
            onPointerMove={wheelMove}
            onPointerUp={handleWheelUp}
            style={{ cursor: 'grab' }}
          />
          <circle
            cx={frLocal.x}
            cy={frLocal.y}
            r={handleSize}
            fill="#f59e0b"
            stroke="#000"
            strokeWidth={0.04}
            onPointerDown={(e) => wheelDown('fr', e)}
            onPointerMove={wheelMove}
            onPointerUp={handleWheelUp}
            style={{ cursor: 'grab' }}
          />
        </>
      )}
    </g>
  );
}

function UnitFill({
  unit,
  widthIn,
  depthIn,
  selected,
}: {
  unit: Unit;
  widthIn: number;
  depthIn: number;
  selected: boolean;
}) {
  const w = widthIn;
  const h = depthIn;
  const stroke = selected ? '#ffffff' : '#222222';
  const strokeWidth = selected ? 0.12 : 0.05;
  const fillOpacity = 0.55;

  let minorShape: React.ReactNode = null;
  switch (unit.colorScheme) {
    case 'vertical':
      minorShape = <rect x={0} y={-h / 2} width={w / 2} height={h} fill={unit.colorMinor} fillOpacity={fillOpacity} />;
      break;
    case 'horizontal':
      minorShape = <rect x={-w / 2} y={0} width={w} height={h / 2} fill={unit.colorMinor} fillOpacity={fillOpacity} />;
      break;
    case 'diagonal':
      minorShape = (
        <polygon
          points={`${w / 2},${-h / 2} ${w / 2},${h / 2} ${-w / 2},${h / 2}`}
          fill={unit.colorMinor}
          fillOpacity={fillOpacity}
        />
      );
      break;
  }

  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={unit.colorMajor} fillOpacity={fillOpacity} />
      {minorShape}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
    </g>
  );
}
