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
          <line x1={0} y1={-s} x2={0} y2={s * 0.55} stroke={fill} strokeWidth={size * 0.14} />
          <line x1={-s * 0.55} y1={s * 0.45} x2={s * 0.55} y2={s * 0.45} stroke={fill} strokeWidth={size * 0.12} />
          <line x1={0} y1={s * 0.45} x2={0} y2={s} stroke={fill} strokeWidth={size * 0.12} />
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
      // Empire-style cannon: spoked wheel, thin angled barrel, and breech for the carriage
      return (
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <line x1={-s * 0.9} y1={s * 0.95} x2={-s * 0.2} y2={s * 0.2} stroke={fill} strokeWidth={size * 0.1} strokeLinecap="round" />
          <g stroke={fill} strokeWidth={size * 0.06}>
            {rays(6, s * 0.18, s * 0.55).map((r, i) => (
              <line key={i} x1={s * 0.15 + r.x1} y1={s * 0.45 + r.y1} x2={s * 0.15 + r.x2} y2={s * 0.45 + r.y2} />
            ))}
          </g>
          <circle cx={s * 0.15} cy={s * 0.45} r={s * 0.55} fill="none" stroke={fill} strokeWidth={size * 0.1} />
          <circle cx={s * 0.15} cy={s * 0.45} r={s * 0.16} fill={fill} />
          <g transform={`rotate(-12 ${-s * 0.1} ${-s * 0.3})`}>
            <rect x={-s * 0.75} y={-s * 0.48} width={s * 1.65} height={s * 0.3} rx={s * 0.08} />
            <rect x={-s * 0.85} y={-s * 0.52} width={s * 0.3} height={s * 0.38} rx={s * 0.05} />
          </g>
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
    case 'broadheadArrow':
      // Broadhead arrow (game-icons.net, lorc, CC-BY 3.0)
      return (
        <g transform={`scale(${size / 512}) translate(-256, -256)`}>
          <path
            fill={fill}
            d="M19.656 20.688v36.437L73.5 110.97c6.515-14.93 17.988-27.23 32.313-34.814L50.25 20.686l-30.594.002zm119.47 65.906c-29.312 0-52.876 23.533-52.876 52.844 0 21.654 12.868 40.178 31.406 48.375 1.88-37.477 32.825-67.482 70.656-67.907-7.734-19.565-26.786-33.312-49.187-33.312zm213.843 44.25L312.06 145.47l97.032 253.436 7.5 19.625L397 410.97l-253.28-97.533-14.345 40.97L492.28 494.312l-139.31-363.47zm-163.845 7.72c-29.31 0-52.875 23.563-52.875 52.874 0 24.35 16.282 44.705 38.594 50.906 2.935-34.576 30.61-62.252 65.187-65.188-6.2-22.312-26.553-38.594-50.905-38.594zm113.5 34.53L278.75 273.688l-1.344 5.625-5.625 1.312-100.124 23.53L384.156 386l-81.53-212.906zm-56.5 22.47c-29.31 0-52.875 23.563-52.875 52.874 0 10.896 3.28 20.983 8.875 29.375l59.78-14.063 14.033-59.03c-8.473-5.784-18.724-9.157-29.813-9.157z"
          />
        </g>
      );
    case 'arrowhead':
      // Arrowhead striking outward (game-icons.net, lorc, CC-BY 3.0)
      return (
        <g transform={`scale(${size / 512}) translate(-256, -256)`}>
          <path
            fill={fill}
            d="M34.22 19.844l-12.407.125.062 30 177.97 177.5c4.98-8.957 12.884-16.088 22.405-20.064L34.22 19.844zm205.436 202.75c-14.946 0-26.844 11.93-26.844 26.875s11.898 26.874 26.844 26.874c14.946 0 26.875-11.93 26.875-26.875 0-14.947-11.928-26.876-26.874-26.876zm150.875 15.75c-15.905 11.413-31.637 18.404-47.467 21.5 29.263 39.57 49.927 71.443 62.28 96 6.804 13.523 11.162 24.788 12.907 34.562 1.745 9.774.876 19.417-5.813 25.906-6.688 6.49-16.216 7.208-26.125 5.532-9.908-1.676-21.394-5.88-35.187-12.438-25.368-12.058-58.377-32.294-99.22-60.906-2.646 16.347-8.904 32.21-19.06 47.53 64.07 43.58 163.496 83.783 246.468 88.783 3.614-85.247-42.328-181.024-88.782-246.47zm-105.655 16.562c-2.375 19.668-17.412 35.58-36.656 39.28 3.07 11 4.776 21.816 5.093 32.44 44.728 31.797 80.314 53.785 105.812 65.905 12.888 6.127 23.263 9.684 30.313 10.876 7.05 1.193 9.577-.12 9.968-.5.392-.38 1.644-2.46.438-9.22-1.207-6.756-4.852-16.84-11.188-29.436-12.4-24.647-34.88-59.106-67.5-102.563-11.922-.288-23.968-2.61-36.28-6.78z"
          />
        </g>
      );
    case 'arrowCluster':
      // Volley of crossed arrows (game-icons.net, lorc, CC-BY 3.0)
      return (
        <g transform={`scale(${size / 512}) translate(-256, -256)`}>
          <path
            fill={fill}
            d="M257.313 15.688l-50.375 87.53 28.156-8.53 22.28-38.72 22.407 38.782 28.126 8.47-50.594-87.532zm-138.938 77.75l18.5 99.28 14.156-22.093L141.595 120l48.97 17.313 23.124-10.157-95.313-33.72zm278.72 0l-95.314 33.718 23.876 10.5L375.562 120l-9.812 52.688 12.844 20.03 18.5-99.28zm-139.72 2.03l-9.344 2.844v104.47l9.69 11.343 9-10.5V98.28l-9.345-2.81zm81.22 52.032l-54.345 63.688.344.28-14.563 17 12.033 14.063 71.093-83.343-4.75-7.375-9.812-4.312zm-161.25.53l-8.595 3.782-5.47 8.532 255.5 299.469L433 447.688l-8.094-9.47 22.688-10.03 11.47-5.063-8.158-9.53-44.125-51.783-2.31-2.718-3.564-.47-49.562-6.655-174-203.94zm56.06 123.22l-62.218 72.688-.125-.094-6.625 7.75-49.718 6.687-3.564.47-2.312 2.72-44.28 51.936-8.158 9.563 11.5 5.06 22.75 10.064-8.187 9.594 14.218 12.156L245.594 285.28l-12.188-14.03zm24.376 28.125l-9.75 11.28v178.75h18.69v-15.092l24.874 7.437 12.03 3.594v-87l-2.374-2.656-34.53-38.47v-47.5l-8.94-10.343zm-111.5 73.5l-42.936 50.375L86.906 416l33.844-39.688 25.53-3.437zm223.22.375l25.406 3.438 33.656 39.468-16.312 7.22-42.75-50.126zm-140.03 4.375l-16.064 18.094-2.344 2.655v87.031l12.063-3.656 6.344-1.906v-102.22zm37.25 7.563l18.217 20.312v54.75l-18.218-5.438v-69.625zm-87.75 5.406l-64.564 74.687 3.5 5.44 6.813 10.592 8.155-9.593 44.28-51.94 2.314-2.686-.064-3.563-.437-22.936zm157.905.156l-.438 22.97-.093 3.53 2.312 2.72 44.125 51.75 8.19 9.592 6.78-10.625 3.53-5.5-64.405-74.437z"
          />
        </g>
      );
    case 'arrowFlights':
      // Scattered arrows in flight (game-icons.net, lorc, CC-BY 3.0)
      return (
        <g transform={`scale(${size / 512}) translate(-256, -256)`}>
          <path
            fill={fill}
            d="M182.938 17.75l-29.625 112-64.22-64.313-18.218 18.22L480.78 494.124h11.814V469.5L264.72 241.28l29.624-112.124-17.53-17.53-16.783 37.468-.31-54.563-23.564-23.56-12.125 19.75-2.343-34.22-38.75-38.75zM419.875 81l-17.563 66.47-35.406-35.407-14.875 15.156 140.564 140.593V237.75l-20.375-20.375 17.592-66.438L419.875 81zM114.72 154l-92.814 24.53 16.75 16.75 50.97-1-37.19 14.782 39.44 39.438 32.905 2.03-12.874 8.907 20.688 1.282-16.844 11.655 17.594 17.594L226 265.436 114.72 154zm252.936 15.28l-48.97 12.94 25.658 25.655 31.875 2.156-18.408 11.314 30.782 30.78 48.97-12.936-69.908-69.907zM122.78 316.313l-17.56 66.407-35.345-35.47-15.313 15.313 131.594 131.562h30.094l-41.156-41.313 17.594-66.593-13.907-13.908-12.093 19.782-2.343-34.22-41.563-41.562zm188.907 51.594l-10.843 41.063-23.5-23.5-13.22 13.217 23.376 23.344-40.72 10.783 44.814 44.812 40.72-10.78 27.998 28h26.407l-41.095-41.095 10.844-41.03-19.158-19.19-8.562 7.75-3.344-19.624-13.72-13.75zM70.25 404.656L21.562 417.5l54 54h34.094L93.126 487l47.03-12.438-69.906-69.906z"
          />
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
    case 'hammer':
      // Two-headed war hammer
      return (
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <rect x={-s * 0.12} y={-s * 0.6} width={s * 0.24} height={s * 1.2} />
          <rect x={-s * 0.55} y={-s * 0.95} width={s * 1.1} height={s * 0.4} rx={s * 0.05} />
          <rect x={-s * 0.55} y={s * 0.55} width={s * 1.1} height={s * 0.4} rx={s * 0.05} />
        </g>
      );
    case 'anvil':
      // Anvil: top face with horn, waist, and base
      return (
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <path d={`M ${-s * 0.75} ${-s * 0.35} H ${s * 0.35} L ${s * 0.95} ${-s * 0.05} L ${s * 0.35} ${s * 0.05} H ${-s * 0.75} Z`} />
          <rect x={-s * 0.5} y={s * 0.05} width={s * 1.0} height={s * 0.15} />
          <rect x={-s * 0.65} y={s * 0.2} width={s * 1.3} height={s * 0.25} />
        </g>
      );
    case 'hammerAnvil':
      // Hammer striking an anvil
      return (
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <g transform={`translate(${-s * 0.1} ${s * 0.35}) scale(0.7)`}>
            <path d={`M ${-s * 0.75} ${-s * 0.35} H ${s * 0.35} L ${s * 0.95} ${-s * 0.05} L ${s * 0.35} ${s * 0.05} H ${-s * 0.75} Z`} />
            <rect x={-s * 0.5} y={s * 0.05} width={s * 1.0} height={s * 0.15} />
            <rect x={-s * 0.65} y={s * 0.2} width={s * 1.3} height={s * 0.25} />
          </g>
          <g transform={`translate(${s * 0.3} ${-s * 0.2}) rotate(-35) scale(0.65)`}>
            <rect x={-s * 0.1} y={-s * 0.5} width={s * 0.2} height={s * 1.3} />
            <rect x={-s * 0.5} y={-s * 0.9} width={s * 1.0} height={s * 0.45} rx={s * 0.05} />
          </g>
        </g>
      );
    case 'roundShield':
      // Round shield with central boss
      return (
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
          <circle cx={0} cy={0} r={s * 0.95} />
          <circle cx={0} cy={0} r={s * 0.35} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
          <line x1={0} y1={-s * 0.95} x2={0} y2={s * 0.95} stroke={stroke} strokeWidth={strokeWidth * 0.6} />
          <line x1={-s * 0.95} y1={0} x2={s * 0.95} y2={0} stroke={stroke} strokeWidth={strokeWidth * 0.6} />
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
      // Twin-tailed comet, streaking down and to the left
      return (
        <g fill={fill} stroke={stroke} strokeWidth={strokeWidth} transform="rotate(225)">
          <g transform="rotate(10)">
            <path
              d={`M ${s * 0.22} ${-s * 0.25}
                  C ${s * 0.5} ${s * 0.05}, ${s * 0.8} ${s * 0.5}, ${s * 0.95} ${s}
                  C ${s * 0.55} ${s * 0.65}, ${s * 0.15} ${s * 0.2}, ${-s * 0.05} ${-s * 0.05} Z`}
            />
          </g>
          <g transform="rotate(-10)">
            <path
              d={`M ${-s * 0.22} ${-s * 0.25}
                  C ${-s * 0.5} ${s * 0.05}, ${-s * 0.8} ${s * 0.5}, ${-s * 0.95} ${s}
                  C ${-s * 0.55} ${s * 0.65}, ${-s * 0.15} ${s * 0.2}, ${s * 0.05} ${-s * 0.05} Z`}
            />
          </g>
          <circle cx={0} cy={-s * 0.45} r={s * 0.42} />
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
