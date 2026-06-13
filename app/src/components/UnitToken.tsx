import { useRef } from 'react';
import type { Unit } from '../types';
import { footprintInches, screenToBoardPoint } from '../units';

interface Props {
  unit: Unit;
  selected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  snapIn: number;
}

export default function UnitToken({ unit, selected, onSelect, onMove, svgRef, snapIn }: Props) {
  const { widthIn, depthIn } = footprintInches(unit);
  const dragOffset = useRef<{ dx: number; dy: number } | null>(null);

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
    onMove(unit.id, x, y);
  }

  function handlePointerUp(e: React.PointerEvent) {
    dragOffset.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  }

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
    </g>
  );
}
