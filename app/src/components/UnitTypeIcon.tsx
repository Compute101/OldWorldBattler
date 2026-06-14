import type { IconType } from '../types';

interface Props {
  icon: IconType;
  size: number;
  fill?: string;
}

// Returns the SVG polygon points for a `spikes`-pointed star centered on the origin.
function starPoints(spikes: number, outerR: number, innerR: number, rotationDeg = -90): string {
  const points: string[] = [];
  const step = Math.PI / spikes;
  const rotation = (rotationDeg * Math.PI) / 180;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = rotation + i * step;
    points.push(`${(r * Math.cos(angle)).toFixed(3)},${(r * Math.sin(angle)).toFixed(3)}`);
  }
  return points.join(' ');
}

// Returns `count` evenly-spaced radial lines between `innerR` and `outerR`.
function rays(count: number, innerR: number, outerR: number): { x1: number; y1: number; x2: number; y2: number }[] {
  const result = [];
  for (let i = 0; i < count; i++) {
    const angle = (i * 2 * Math.PI) / count;
    result.push({
      x1: innerR * Math.cos(angle),
      y1: innerR * Math.sin(angle),
      x2: outerR * Math.cos(angle),
      y2: outerR * Math.sin(angle),
    });
  }
  return result;
}

// Thematic icons, drawn within a `size`-wide square centered on the origin.
export default function UnitTypeIcon({ icon, size, fill = '#ffffff' }: Props) {
  const s = size / 2;
  const stroke = '#000000';
  const strokeWidth = size * 0.04;

  switch (icon) {
    case 'infantry':
      // Sword: blade, crossguard, hilt
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round">
          <line x1={0} y1={-s} x2={0} y2={s * 0.5} stroke={fill} strokeWidth={size * 0.14} />
          <line x1={-s * 0.55} y1={s * 0.05} x2={s * 0.55} y2={s * 0.05} stroke={fill} strokeWidth={size * 0.12} />
          <line x1={0} y1={s * 0.05} x2={0} y2={s} stroke={fill} strokeWidth={size * 0.12} />
        </g>
      );
    case 'cavalry':
      // Heater shield
      return (
        <path
          d={`M ${-s * 0.7} ${-s} L ${s * 0.7} ${-s} L ${s * 0.7} ${s * 0.15} L 0 ${s} L ${-s * 0.7} ${s * 0.15} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case 'chariot':
      // Wheel: circle with smaller circle (hub)
      return (
        <g>
          <circle cx={0} cy={0} r={s * 0.9} fill="none" stroke={fill} strokeWidth={size * 0.12} />
          <circle cx={0} cy={0} r={s * 0.3} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </g>
      );
    case 'monster':
      // Axe: handle and angled blade
      return (
        <g stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round">
          <line x1={0} y1={-s} x2={0} y2={s} stroke={fill} strokeWidth={size * 0.14} />
          <path
            d={`M 0 ${-s * 0.85} L ${s * 0.9} ${-s * 0.55} L ${s * 0.55} ${s * 0.05} L 0 ${-s * 0.15} Z`}
            fill={fill}
          />
        </g>
      );
    case 'warMachine':
      // Diamond
      return (
        <path
          d={`M 0 ${-s} L ${s} 0 L 0 ${s} L ${-s} 0 Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case 'character':
      // Heart
      return (
        <path
          d={`M 0 ${s * 0.85}
              C ${-s} ${s * 0.1}, ${-s} ${-s * 0.7}, 0 ${-s * 0.3}
              C ${s} ${-s * 0.7}, ${s} ${s * 0.1}, 0 ${s * 0.85} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case 'cannon':
      // Barrel on a wheel
      return (
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <rect x={-s * 0.9} y={-s * 0.25} width={s * 1.6} height={s * 0.5} rx={s * 0.1} />
          <circle cx={-s * 0.5} cy={s * 0.55} r={s * 0.35} fill="none" stroke={fill} strokeWidth={size * 0.1} />
        </g>
      );
    case 'handgun':
      // L-shaped pistol silhouette
      return (
        <path
          d={`M ${-s * 0.9} ${-s * 0.1} L ${s * 0.6} ${-s * 0.1} L ${s * 0.6} ${-s * 0.35} L ${s * 0.9} ${-s * 0.35}
              L ${s * 0.9} ${s * 0.05} L ${-s * 0.1} ${s * 0.05} L ${-s * 0.1} ${s * 0.9} L ${-s * 0.5} ${s * 0.9}
              L ${-s * 0.5} ${s * 0.1} L ${-s * 0.9} ${s * 0.1} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case 'bowArrow':
      // Bow with drawn arrow
      return (
        <g fill="none" stroke={fill} strokeLinecap="round">
          <path d={`M 0 ${-s} A ${s} ${s * 1.3} 0 0 1 0 ${s}`} strokeWidth={size * 0.08} />
          <line x1={0} y1={-s} x2={0} y2={s} strokeWidth={size * 0.03} />
          <line x1={-s * 0.9} y1={0} x2={s * 0.85} y2={0} strokeWidth={size * 0.08} />
          <polygon points={`${s * 0.95},0 ${s * 0.55},${-s * 0.18} ${s * 0.55},${s * 0.18}`} fill={fill} stroke="none" />
        </g>
      );
    case 'arrow':
      // Upward arrow
      return (
        <g fill={fill}>
          <line x1={0} y1={s} x2={0} y2={-s * 0.2} stroke={fill} strokeWidth={size * 0.14} strokeLinecap="round" />
          <polygon points={`0,${-s} ${-s * 0.45},${-s * 0.15} ${s * 0.45},${-s * 0.15}`} />
        </g>
      );
    case 'skull':
      // Skull: cranium, jaw, eye sockets
      return (
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d={`M ${-s * 0.7} ${-s * 0.1} a ${s * 0.7} ${s * 0.7} 0 1 1 ${s * 1.4} 0 v ${s * 0.35} h ${-s * 1.4} Z`} />
          <rect x={-s * 0.35} y={s * 0.2} width={s * 0.7} height={s * 0.35} />
          <circle cx={-s * 0.3} cy={-s * 0.05} r={s * 0.18} fill={stroke} stroke="none" />
          <circle cx={s * 0.3} cy={-s * 0.05} r={s * 0.18} fill={stroke} stroke="none" />
        </g>
      );
    case 'orcSkull':
      // Skull with protruding tusks
      return (
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d={`M ${-s * 0.7} ${-s * 0.1} a ${s * 0.7} ${s * 0.7} 0 1 1 ${s * 1.4} 0 v ${s * 0.35} h ${-s * 1.4} Z`} />
          <rect x={-s * 0.35} y={s * 0.2} width={s * 0.7} height={s * 0.35} />
          <circle cx={-s * 0.3} cy={-s * 0.05} r={s * 0.18} fill={stroke} stroke="none" />
          <circle cx={s * 0.3} cy={-s * 0.05} r={s * 0.18} fill={stroke} stroke="none" />
          <polygon points={`${-s * 0.32},${s * 0.5} ${-s * 0.14},${s * 0.5} ${-s * 0.22},${s * 0.9}`} fill="#ffffff" strokeWidth={strokeWidth * 0.6} />
          <polygon points={`${s * 0.32},${s * 0.5} ${s * 0.14},${s * 0.5} ${s * 0.22},${s * 0.9}`} fill="#ffffff" strokeWidth={strokeWidth * 0.6} />
        </g>
      );
    case 'crossedBones':
      // Two bones crossed in an X
      return (
        <g stroke={fill} strokeWidth={size * 0.14} strokeLinecap="round">
          <line x1={-s * 0.8} y1={-s * 0.8} x2={s * 0.8} y2={s * 0.8} />
          <line x1={-s * 0.8} y1={s * 0.8} x2={s * 0.8} y2={-s * 0.8} />
          <g fill={fill} stroke="none">
            <circle cx={-s * 0.8} cy={-s * 0.8} r={size * 0.09} />
            <circle cx={s * 0.8} cy={s * 0.8} r={size * 0.09} />
            <circle cx={-s * 0.8} cy={s * 0.8} r={size * 0.09} />
            <circle cx={s * 0.8} cy={-s * 0.8} r={size * 0.09} />
          </g>
        </g>
      );
    case 'chaosStar':
      // Eight-pointed Chaos star
      return (
        <polygon
          points={starPoints(8, s, s * 0.4)}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      );
    case 'dwarfHammer':
      // Rune hammer: handle and head
      return (
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round">
          <line x1={0} y1={s * 0.9} x2={0} y2={-s * 0.1} stroke={fill} strokeWidth={size * 0.14} />
          <rect x={-s * 0.75} y={-s * 0.85} width={s * 1.5} height={s * 0.55} />
        </g>
      );
    case 'phoenix':
      // Flame silhouette
      return (
        <path
          d={`M 0 ${s} C ${-s * 0.9} ${s * 0.3}, ${-s * 0.6} ${-s * 0.5}, 0 ${-s}
              C ${s * 0.6} ${-s * 0.5}, ${s * 0.9} ${s * 0.3}, 0 ${s} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    case 'ratClaw':
      // Three claw slashes
      return (
        <g stroke={fill} strokeWidth={size * 0.1} strokeLinecap="round" fill="none">
          <path d={`M ${-s * 0.8} ${-s * 0.8} L ${-s * 0.1} ${s * 0.8}`} />
          <path d={`M ${-s * 0.2} ${-s * 0.9} L ${s * 0.3} ${s * 0.7}`} />
          <path d={`M ${s * 0.4} ${-s * 0.9} L ${s * 0.85} ${s * 0.5}`} />
        </g>
      );
    case 'leaf':
      // Leaf with central vein
      return (
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path
            d={`M 0 ${-s} C ${s * 0.9} ${-s * 0.5}, ${s * 0.9} ${s * 0.5}, 0 ${s}
                C ${-s * 0.9} ${s * 0.5}, ${-s * 0.9} ${-s * 0.5}, 0 ${-s} Z`}
          />
          <line x1={0} y1={-s * 0.9} x2={0} y2={s * 0.9} stroke={stroke} strokeWidth={strokeWidth * 0.7} />
        </g>
      );
    case 'vampireBat':
      // Bat with spread wings
      return (
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d={`M 0 0 C ${-s * 0.3} ${-s * 0.3}, ${-s} ${-s * 0.6}, ${-s} ${-s * 0.1} C ${-s * 0.6} ${-s * 0.1}, ${-s * 0.3} ${s * 0.1}, 0 0 Z`} />
          <path d={`M 0 0 C ${s * 0.3} ${-s * 0.3}, ${s} ${-s * 0.6}, ${s} ${-s * 0.1} C ${s * 0.6} ${-s * 0.1}, ${s * 0.3} ${s * 0.1}, 0 0 Z`} />
          <circle cx={0} cy={0} r={s * 0.18} />
        </g>
      );
    case 'comet':
      // Twin-tailed comet
      return (
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <circle cx={0} cy={-s * 0.3} r={s * 0.35} />
          <path d={`M ${-s * 0.15} 0 L ${-s * 0.7} ${s * 0.9} L ${-s * 0.05} ${s * 0.35} Z`} />
          <path d={`M ${s * 0.15} 0 L ${s * 0.7} ${s * 0.9} L ${s * 0.05} ${s * 0.35} Z`} />
        </g>
      );
    case 'fleurDeLis':
      // Fleur-de-lis: central spike, two side petals, crossbar
      return (
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d={`M 0 ${s * 0.9} L 0 ${-s * 0.95}`} stroke={fill} strokeWidth={size * 0.12} fill="none" strokeLinecap="round" />
          <path d={`M 0 ${s * 0.3} C ${s * 0.7} ${s * 0.1}, ${s * 0.6} ${-s * 0.6}, ${s * 0.05} ${-s * 0.2} Z`} />
          <path d={`M 0 ${s * 0.3} C ${-s * 0.7} ${s * 0.1}, ${-s * 0.6} ${-s * 0.6}, ${-s * 0.05} ${-s * 0.2} Z`} />
          <line x1={-s * 0.45} y1={s * 0.35} x2={s * 0.45} y2={s * 0.35} stroke={fill} strokeWidth={size * 0.12} />
        </g>
      );
    case 'ankh':
      // Ankh: loop over a cross
      return (
        <g fill="none" stroke={fill} strokeWidth={size * 0.14} strokeLinecap="round">
          <circle cx={0} cy={-s * 0.5} r={s * 0.35} />
          <line x1={0} y1={-s * 0.15} x2={0} y2={s} />
          <line x1={-s * 0.55} y1={s * 0.25} x2={s * 0.55} y2={s * 0.25} />
        </g>
      );
    case 'sunDisc':
      // Disc with radiating rays
      return (
        <g stroke={fill} strokeWidth={size * 0.08} strokeLinecap="round">
          {rays(8, s * 0.55, s * 0.95).map((r, i) => (
            <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
          ))}
          <circle cx={0} cy={0} r={s * 0.5} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
        </g>
      );
    case 'spider':
      // Spider: body, head, and eight legs
      return (
        <g stroke={fill} strokeWidth={size * 0.08} strokeLinecap="round" fill={fill}>
          {rays(4, s * 0.2, s * 0.95).map((r, i) => (
            <g key={i}>
              <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} />
              <line x1={-r.x1} y1={r.y1} x2={-r.x2} y2={r.y2} />
            </g>
          ))}
          <ellipse cx={0} cy={s * 0.15} rx={s * 0.35} ry={s * 0.45} stroke={stroke} strokeWidth={strokeWidth} />
          <circle cx={0} cy={-s * 0.4} r={s * 0.22} stroke={stroke} strokeWidth={strokeWidth} />
        </g>
      );
  }
}
