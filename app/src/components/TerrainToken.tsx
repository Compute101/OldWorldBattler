import { useRef } from 'react';
import type { Terrain } from '../types';
import { normalizeAngle, screenToBoardPoint } from '../units';

interface Props {
  terrain: Terrain;
  selected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onRotate: (id: string, rotation: number) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
  snapIn: number;
  locked: boolean;
}

export default function TerrainToken({ terrain, selected, onSelect, onMove, onRotate, svgRef, snapIn, locked }: Props) {
  const dragOffset = useRef<{ dx: number; dy: number } | null>(null);
  const rotating = useRef(false);

  function toBoardPoint(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    return screenToBoardPoint(svg, clientX, clientY);
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    onSelect(terrain.id);
    if (locked) return;
    const p = toBoardPoint(e.clientX, e.clientY);
    dragOffset.current = { dx: p.x - terrain.x, dy: p.y - terrain.y };
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
    onMove(terrain.id, x, y);
  }

  function handlePointerUp(e: React.PointerEvent) {
    dragOffset.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  }

  function handleRotateDown(e: React.PointerEvent) {
    e.stopPropagation();
    onSelect(terrain.id);
    if (locked) return;
    rotating.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handleRotateMove(e: React.PointerEvent) {
    if (!rotating.current) return;
    const p = toBoardPoint(e.clientX, e.clientY);
    const dx = p.x - terrain.x;
    const dy = p.y - terrain.y;
    const rotation = normalizeAngle((Math.atan2(dx, -dy) * 180) / Math.PI);
    onRotate(terrain.id, Math.round(rotation));
  }

  function handleRotateUp(e: React.PointerEvent) {
    rotating.current = false;
    (e.target as Element).releasePointerCapture(e.pointerId);
  }

  const handleSize = Math.max(0.25, Math.min(terrain.widthIn, terrain.depthIn || terrain.widthIn) * 0.12);

  const shapeEl =
    terrain.shape === 'circle' ? (
      <circle
        cx={0}
        cy={0}
        r={terrain.widthIn / 2}
        fill={terrain.color}
        fillOpacity={0.6}
        stroke={selected ? '#ffffff' : '#000000'}
        strokeWidth={selected ? 0.15 : 0.05}
        strokeDasharray="0.4 0.3"
      />
    ) : (
      <rect
        x={-terrain.widthIn / 2}
        y={-terrain.depthIn / 2}
        width={terrain.widthIn}
        height={terrain.depthIn}
        fill={terrain.color}
        fillOpacity={0.6}
        stroke={selected ? '#ffffff' : '#000000'}
        strokeWidth={selected ? 0.15 : 0.05}
        strokeDasharray="0.4 0.3"
      />
    );

  return (
    <g
      transform={`translate(${terrain.x} ${terrain.y}) rotate(${terrain.rotation})`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ cursor: locked ? 'default' : 'grab' }}
    >
      {shapeEl}
      <text
        x={0}
        y={0}
        transform={`rotate(${-terrain.rotation})`}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={Math.min(terrain.widthIn, terrain.depthIn || terrain.widthIn) * 0.25}
        fill="#fff"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {terrain.name}
      </text>

      {selected && !locked && terrain.shape === 'rect' && (
        <>
          <line
            x1={0}
            y1={-terrain.depthIn / 2}
            x2={0}
            y2={-terrain.depthIn / 2 - 0.9}
            stroke="#22d3ee"
            strokeWidth={0.04}
            pointerEvents="none"
          />
          <circle
            cx={0}
            cy={-terrain.depthIn / 2 - 0.9}
            r={handleSize}
            fill="#22d3ee"
            stroke="#000"
            strokeWidth={0.04}
            onPointerDown={handleRotateDown}
            onPointerMove={handleRotateMove}
            onPointerUp={handleRotateUp}
            style={{ cursor: 'grab' }}
          />
        </>
      )}
    </g>
  );
}
