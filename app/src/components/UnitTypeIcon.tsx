import type { UnitType } from '../types';

interface Props {
  unitType: UnitType;
  size: number;
  fill?: string;
}

// Thematic troop-type icons, drawn within a `size`-wide square centered on the origin.
export default function UnitTypeIcon({ unitType, size, fill = '#ffffff' }: Props) {
  const s = size / 2;
  const stroke = '#000000';
  const strokeWidth = size * 0.04;

  switch (unitType) {
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
  }
}
