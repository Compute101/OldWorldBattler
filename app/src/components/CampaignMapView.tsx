import { useRef, useState } from 'react';
import type { Campaign, CampaignMap, CampaignSite, SiteType } from '../types';
import { MAP_TEMPLATES, defaultSite, applyMapTemplate, regionBackground, siteTypeMeta, SITE_TYPES } from '../maps';
import { screenToBoardPoint } from '../units';
import NumberField from './NumberField';

interface Props {
  campaign: Campaign;
  onBack: () => void;
  onUpdateMap: (updater: (map: CampaignMap) => CampaignMap) => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function SiteMarker({ site, selected }: { site: CampaignSite; selected: boolean }) {
  const meta = siteTypeMeta(site.type);
  const size = site.type === 'city' ? 3.4 : site.type === 'town' ? 2.6 : 3;
  const stroke = selected ? '#ffffff' : '#000000';
  const strokeWidth = selected ? 0.4 : 0.2;

  let shapeEl;
  if (meta.shape === 'circle') {
    shapeEl = <circle cx={0} cy={0} r={size} fill={meta.color} stroke={stroke} strokeWidth={strokeWidth} />;
  } else if (meta.shape === 'triangle') {
    const points = `0,${-size} ${size * 0.95},${size * 0.75} ${-size * 0.95},${size * 0.75}`;
    shapeEl = <polygon points={points} fill={meta.color} stroke={stroke} strokeWidth={strokeWidth} />;
  } else {
    const points = `0,${-size} ${size},0 0,${size} ${-size},0`;
    shapeEl = <polygon points={points} fill={meta.color} stroke={stroke} strokeWidth={strokeWidth} />;
  }

  return (
    <>
      {shapeEl}
      <text
        x={0}
        y={size + 3.4}
        textAnchor="middle"
        fontSize={2.6}
        fill="#fff"
        style={{ pointerEvents: 'none', userSelect: 'none', paintOrder: 'stroke', stroke: '#000', strokeWidth: 0.5 }}
      >
        {site.name}
      </text>
    </>
  );
}

export default function CampaignMapView({ campaign, onBack, onUpdateMap }: Props) {
  const map = campaign.map;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const selected = map.sites.find((s) => s.id === selectedId) ?? null;

  function updateSites(fn: (sites: CampaignSite[]) => CampaignSite[]) {
    onUpdateMap((m) => ({ ...m, sites: fn(m.sites) }));
  }

  function handleAddSite() {
    const site = defaultSite();
    updateSites((sites) => [...sites, site]);
    setSelectedId(site.id);
  }

  function handleUpdateSite(id: string, patch: Partial<CampaignSite>) {
    updateSites((sites) => sites.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function handleRemoveSite(id: string) {
    if (!window.confirm('Remove this site?')) return;
    updateSites((sites) => sites.filter((s) => s.id !== id));
    setSelectedId(null);
  }

  function handleLoadTemplate(key: string) {
    const template = MAP_TEMPLATES.find((t) => t.key === key);
    if (!template) return;
    if (
      map.sites.length > 0 &&
      !window.confirm(`Replace the current map with the ${template.label} preset? This removes all existing sites.`)
    ) {
      return;
    }
    onUpdateMap(() => applyMapTemplate(template));
    setSelectedId(null);
  }

  function toPercent(clientX: number, clientY: number) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    return screenToBoardPoint(svg, clientX, clientY);
  }

  function handleMarkerPointerDown(e: React.PointerEvent, site: CampaignSite) {
    e.stopPropagation();
    setSelectedId(site.id);
    const p = toPercent(e.clientX, e.clientY);
    dragRef.current = { id: site.id, dx: p.x - site.x, dy: p.y - site.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  }

  function handleMarkerPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const p = toPercent(e.clientX, e.clientY);
    const x = clamp(p.x - dragRef.current.dx, 0, 100);
    const y = clamp(p.y - dragRef.current.dy, 0, 100);
    handleUpdateSite(dragRef.current.id, { x, y });
  }

  function handleMarkerPointerUp(e: React.PointerEvent) {
    dragRef.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  }

  return (
    <div className="map-screen">
      <div className="map-panel">
        <button className="picker-back" onClick={onBack}>
          ← Battles
        </button>
        <h2>{campaign.name}</h2>
        <label>
          Map name
          <input
            type="text"
            value={map.name}
            onChange={(e) => onUpdateMap((m) => ({ ...m, name: e.target.value }))}
          />
        </label>
        <label>
          Load a default map
          <select value="" onChange={(e) => e.target.value && handleLoadTemplate(e.target.value)}>
            <option value="">Choose a region…</option>
            {MAP_TEMPLATES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <section>
          <h3>Sites</h3>
          <button onClick={handleAddSite}>+ Add Site</button>
          <ul className="unit-list">
            {map.sites.map((s) => (
              <li
                key={s.id}
                className={selectedId === s.id ? 'selected' : ''}
                onClick={() => setSelectedId(s.id)}
              >
                <span className="swatch" style={{ background: siteTypeMeta(s.type).color }} />
                {s.name} ({siteTypeMeta(s.type).label})
              </li>
            ))}
          </ul>
          {map.sites.length === 0 && (
            <p className="picker-empty">No sites yet. Add one, or load a default map above.</p>
          )}
        </section>

        {selected && (
          <section className="unit-editor">
            <h3>Edit Site</h3>
            <label>
              Name
              <input
                type="text"
                value={selected.name}
                onChange={(e) => handleUpdateSite(selected.id, { name: e.target.value })}
              />
            </label>
            <label>
              Type
              <select
                value={selected.type}
                onChange={(e) => handleUpdateSite(selected.id, { type: e.target.value as SiteType })}
              >
                {SITE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="row">
              <label>
                X (%)
                <NumberField
                  value={Number(selected.x.toFixed(1))}
                  min={0}
                  max={100}
                  onChange={(n) => handleUpdateSite(selected.id, { x: n })}
                />
              </label>
              <label>
                Y (%)
                <NumberField
                  value={Number(selected.y.toFixed(1))}
                  min={0}
                  max={100}
                  onChange={(n) => handleUpdateSite(selected.id, { y: n })}
                />
              </label>
            </div>
            <label>
              Notes
              <textarea
                value={selected.notes}
                onChange={(e) => handleUpdateSite(selected.id, { notes: e.target.value })}
              />
            </label>
            <button className="danger" onClick={() => handleRemoveSite(selected.id)}>
              Remove Site
            </button>
          </section>
        )}
      </div>

      <div className="map-wrap">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="map-svg"
          onPointerDown={() => setSelectedId(null)}
        >
          <rect x={0} y={0} width={100} height={100} fill={regionBackground(map.region)} />
          {map.sites.map((s) => (
            <g
              key={s.id}
              transform={`translate(${s.x} ${s.y})`}
              onPointerDown={(e) => handleMarkerPointerDown(e, s)}
              onPointerMove={handleMarkerPointerMove}
              onPointerUp={handleMarkerPointerUp}
              style={{ cursor: 'grab' }}
            >
              <SiteMarker site={s} selected={selectedId === s.id} />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
