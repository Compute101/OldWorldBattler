import { useRef } from 'react';
import type { Unit } from '../types';
import { footprintInches, localToBoard, normalizeAngle, rotateVec, screenToBoardPoint } from '../units';

interface Props {
  unit: Unit;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Unit>) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  snapIn: number;
}

type WheelCorner = 'fl' | 'fr';

export default function UnitToken({ unit, selected, onSelect, onUpdate, svgRef, snapIn }: Props) {
  const { widthIn, depthIn } = footprintInches(unit);
  const dragOffset = useRef<{ dx: number; dy: number } | null>(null);
  const rotating = useRef(false);
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
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handleRotateMove(e: React.PointerEvent) {
    if (!rotating.current) return;
    const p = toBoardPoint(e.clientX, e.clientY);
    const dx = p.x - unit.x;
    const dy = p.y - unit.y;
    const facing = normalizeAngle((Math.atan2(dx, -dy) * 180) / Math.PI);
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
    onUpdate(unit.id, {
      facing: Math.round(facing),
      x: Math.round((pivot.x - offset.x) * 100) / 100,
      y: Math.round((pivot.y - offset.y) * 100) / 100,
    });
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
      <rect
        x={-widthIn / 2}
        y={-depthIn / 2}
        width={widthIn}
        height={depthIn}
        fill={unit.color}
        fillOpacity={0.55}
        stroke={selected ? '#ffffff' : '#222222'}
        strokeWidth={selected ? 0.12 : 0.05}
      />
      {/* facing arrow */}
      <line x1={0} y1={0} x2={0} y2={-depthIn / 2} stroke="#ffffff" strokeWidth={0.08} />
      <polygon
        points={`0,${-depthIn / 2 - 0.4} -0.3,${-depthIn / 2 + 0.2} 0.3,${-depthIn / 2 + 0.2}`}
        fill="#ffffff"
      />
      <text
        x={0}
        y={0}
        transform={`rotate(${-unit.facing})`}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={Math.min(widthIn, depthIn) * 0.35}
        fill="#000"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {unit.name}
      </text>

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
