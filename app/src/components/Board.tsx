import { useRef } from 'react';
import type { BoardState } from '../types';
import UnitToken from './UnitToken';

interface Props {
  board: BoardState;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  snapIn: number;
}

export default function Board({ board, selectedId, onSelect, onMove, snapIn }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { widthIn, heightIn, units } = board;

  const gridLines = [];
  for (let x = 0; x <= widthIn; x++) {
    gridLines.push(
      <line
        key={`v${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={heightIn}
        stroke="#ffffff"
        strokeOpacity={x % 12 === 0 ? 0.35 : 0.12}
        strokeWidth={x % 12 === 0 ? 0.06 : 0.02}
      />
    );
  }
  for (let y = 0; y <= heightIn; y++) {
    gridLines.push(
      <line
        key={`h${y}`}
        x1={0}
        y1={y}
        x2={widthIn}
        y2={y}
        stroke="#ffffff"
        strokeOpacity={y % 12 === 0 ? 0.35 : 0.12}
        strokeWidth={y % 12 === 0 ? 0.06 : 0.02}
      />
    );
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${widthIn} ${heightIn}`}
      className="board-svg"
      onPointerDown={() => onSelect(null)}
    >
      <rect x={0} y={0} width={widthIn} height={heightIn} fill="#3a5f3a" />
      {gridLines}
      {units.map((unit) => (
        <UnitToken
          key={unit.id}
          unit={unit}
          selected={unit.id === selectedId}
          onSelect={onSelect}
          onMove={onMove}
          svgRef={svgRef}
          snapIn={snapIn}
        />
      ))}
    </svg>
  );
}
