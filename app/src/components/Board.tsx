import { useRef, useState } from 'react';
import type { BoardState, Mode, Selection, Unit } from '../types';
import UnitToken from './UnitToken';
import TerrainToken from './TerrainToken';
import { screenToBoardPoint } from '../units';

interface View {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Props {
  board: BoardState;
  selection: Selection | null;
  onSelect: (selection: Selection | null) => void;
  onUpdateUnit: (id: string, patch: Partial<Unit>) => void;
  onMoveTerrain: (id: string, x: number, y: number) => void;
  snapIn: number;
  mode: Mode;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function Board({
  board,
  selection,
  onSelect,
  onUpdateUnit,
  onMoveTerrain,
  snapIn,
  mode,
}: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { widthIn, heightIn, units, terrain, deploymentZones } = board;

  const [view, setView] = useState<View>({ x: 0, y: 0, w: widthIn, h: heightIn });
  const [prevDims, setPrevDims] = useState({ widthIn, heightIn });
  if (prevDims.widthIn !== widthIn || prevDims.heightIn !== heightIn) {
    setPrevDims({ widthIn, heightIn });
    setView({ x: 0, y: 0, w: widthIn, h: heightIn });
  }
  const panState = useRef<{
    startClientX: number;
    startClientY: number;
    startView: View;
    rectW: number;
    panned: boolean;
  } | null>(null);
  const [measure, setMeasure] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const measuring = useRef(false);
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ initialDist: number; initialView: View; boardCenter: { x: number; y: number } } | null>(
    null,
  );

  function resetView() {
    setView({ x: 0, y: 0, w: widthIn, h: heightIn });
  }

  function handleWheel(e: React.WheelEvent<SVGSVGElement>) {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const p = screenToBoardPoint(svg, e.clientX, e.clientY);
    const factor = Math.exp(-e.deltaY * 0.0015);
    setView((v) => {
      const newW = clamp(v.w / factor, widthIn / 8, widthIn * 2);
      const scale = newW / v.w;
      const newH = v.h * scale;
      return {
        x: p.x - (p.x - v.x) * scale,
        y: p.y - (p.y - v.y) * scale,
        w: newW,
        h: newH,
      };
    });
  }

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    svg.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      // second finger down: start a pinch-zoom, cancel any pan/measure in progress
      panState.current = null;
      measuring.current = false;
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const boardCenter = screenToBoardPoint(svg, (a.x + b.x) / 2, (a.y + b.y) / 2);
      pinch.current = { initialDist: dist, initialView: view, boardCenter };
      return;
    }
    if (pointers.current.size > 2) return;

    const p = screenToBoardPoint(svg, e.clientX, e.clientY);

    if (mode === 'measure') {
      measuring.current = true;
      setMeasure({ x1: p.x, y1: p.y, x2: p.x, y2: p.y });
      return;
    }

    const rect = svg.getBoundingClientRect();
    panState.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startView: view,
      rectW: rect.width,
      panned: false,
    };
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;

    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = Array.from(pointers.current.values());
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const { initialDist, initialView, boardCenter } = pinch.current;
      const factor = dist / initialDist;
      const newW = clamp(initialView.w / factor, widthIn / 8, widthIn * 2);
      const scale = newW / initialView.w;
      const newH = initialView.h * scale;
      setView({
        x: boardCenter.x - (boardCenter.x - initialView.x) * scale,
        y: boardCenter.y - (boardCenter.y - initialView.y) * scale,
        w: newW,
        h: newH,
      });
      return;
    }

    if (mode === 'measure' && measuring.current) {
      const p = screenToBoardPoint(svg, e.clientX, e.clientY);
      setMeasure((m) => (m ? { ...m, x2: p.x, y2: p.y } : m));
      return;
    }

    if (!panState.current) return;
    const { startClientX, startClientY, startView, rectW } = panState.current;
    const dxPx = e.clientX - startClientX;
    const dyPx = e.clientY - startClientY;
    if (Math.abs(dxPx) > 2 || Math.abs(dyPx) > 2) {
      panState.current.panned = true;
    }
    const scale = startView.w / rectW;
    setView({
      ...startView,
      x: startView.x - dxPx * scale,
      y: startView.y - dyPx * scale,
    });
  }

  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (svg) svg.releasePointerCapture(e.pointerId);
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) {
      pinch.current = null;
    }
    measuring.current = false;
    if (panState.current && !panState.current.panned) {
      onSelect(null);
    }
    panState.current = null;
  }

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

  const zones = [];
  if (deploymentZones.enabled) {
    const d = deploymentZones.depthIn;
    for (const edge of deploymentZones.edges) {
      const isPlayerOne = edge === 'north' || edge === 'west';
      const fill = isPlayerOne ? '#2980b9' : '#c0392b';
      let rect;
      switch (edge) {
        case 'north':
          rect = { x: 0, y: 0, w: widthIn, h: d };
          break;
        case 'south':
          rect = { x: 0, y: heightIn - d, w: widthIn, h: d };
          break;
        case 'west':
          rect = { x: 0, y: 0, w: d, h: heightIn };
          break;
        case 'east':
          rect = { x: widthIn - d, y: 0, w: d, h: heightIn };
          break;
      }
      zones.push(
        <rect
          key={edge}
          x={rect.x}
          y={rect.y}
          width={rect.w}
          height={rect.h}
          fill={fill}
          fillOpacity={0.15}
          pointerEvents="none"
        />
      );
    }
  }

  const measureLength = measure
    ? Math.hypot(measure.x2 - measure.x1, measure.y2 - measure.y1)
    : 0;

  return (
    <div className="board-wrap">
      <button className="reset-view" onClick={resetView}>
        Reset View
      </button>
      <svg
        ref={svgRef}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        className="board-svg"
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ cursor: mode === 'measure' ? 'crosshair' : 'grab' }}
      >
        <rect x={0} y={0} width={widthIn} height={heightIn} fill="#3a5f3a" />
        {gridLines}
        {zones}
        {terrain.map((t) => (
          <TerrainToken
            key={t.id}
            terrain={t}
            selected={selection?.type === 'terrain' && selection.id === t.id}
            onSelect={(id) => onSelect({ type: 'terrain', id })}
            onMove={onMoveTerrain}
            svgRef={svgRef}
            snapIn={snapIn}
          />
        ))}
        {units.map((unit) => (
          <UnitToken
            key={unit.id}
            unit={unit}
            selected={selection?.type === 'unit' && selection.id === unit.id}
            onSelect={(id) => onSelect({ type: 'unit', id })}
            onUpdate={onUpdateUnit}
            svgRef={svgRef}
            snapIn={snapIn}
          />
        ))}
        {measure && (
          <g pointerEvents="none">
            <line
              x1={measure.x1}
              y1={measure.y1}
              x2={measure.x2}
              y2={measure.y2}
              stroke="#ffff00"
              strokeWidth={view.w * 0.0025}
              strokeDasharray={`${view.w * 0.01} ${view.w * 0.006}`}
            />
            <circle cx={measure.x1} cy={measure.y1} r={view.w * 0.005} fill="#ffff00" />
            <circle cx={measure.x2} cy={measure.y2} r={view.w * 0.005} fill="#ffff00" />
            <text
              x={(measure.x1 + measure.x2) / 2}
              y={(measure.y1 + measure.y2) / 2 - view.w * 0.012}
              textAnchor="middle"
              fontSize={view.w * 0.025}
              fill="#ffff00"
              style={{ paintOrder: 'stroke', stroke: '#000', strokeWidth: view.w * 0.002 }}
            >
              {measureLength.toFixed(1)}"
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
