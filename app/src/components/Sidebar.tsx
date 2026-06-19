import { useState } from 'react';
import type { BoardState, ColorScheme, DeploymentZones, IconType, Selection, Terrain, Unit } from '../types';
import { BOARD_PRESETS, COLOR_SCHEMES, FACTION_COLORS, ICON_GROUPS, TERRAIN_COLORS, isMarchingColumn, remainingMoveIn } from '../units';
import Credits from './Credits';
import NumberField from './NumberField';

function swatchBackground(major: string, minor: string, scheme: ColorScheme): string {
  switch (scheme) {
    case 'vertical':
      return `linear-gradient(to right, ${major} 50%, ${minor} 50%)`;
    case 'horizontal':
      return `linear-gradient(to bottom, ${major} 50%, ${minor} 50%)`;
    case 'diagonal':
      return `linear-gradient(to bottom right, ${major} 50%, ${minor} 50%)`;
    default:
      return major;
  }
}

interface Props {
  board: BoardState;
  selection: Selection | null;
  onSelect: (selection: Selection | null) => void;
  onAddUnit: () => void;
  onUpdateUnit: (id: string, patch: Partial<Unit>) => void;
  onRemoveUnit: (id: string) => void;
  onAddTerrain: () => void;
  onUpdateTerrain: (id: string, patch: Partial<Terrain>) => void;
  onRemoveTerrain: (id: string) => void;
  onUpdateBoard: (patch: Partial<BoardState>) => void;
  open: boolean;
  onClose: () => void;
  onStartBattle: () => void;
  onBackToSetup: () => void;
  onEndTurn: () => void;
  onAddLogNote: (note: string, unitId: string | null) => void;
  onRemoveLogEntry: (id: string) => void;
  onAddSubTurn: (label: string) => void;
  onRemoveHistoryStep: (id: string) => void;
  onEnterReplay: () => void;
  readOnly?: boolean;
}

const EDGES: DeploymentZones['edges'] = ['north', 'south', 'east', 'west'];

export default function Sidebar({
  board,
  selection,
  onSelect,
  onAddUnit,
  onUpdateUnit,
  onRemoveUnit,
  onAddTerrain,
  onUpdateTerrain,
  onRemoveTerrain,
  onUpdateBoard,
  open,
  onClose,
  onStartBattle,
  onBackToSetup,
  onEndTurn,
  onAddLogNote,
  onRemoveLogEntry,
  onAddSubTurn,
  onRemoveHistoryStep,
  onEnterReplay,
  readOnly = false,
}: Props) {
  const selectedUnit =
    selection?.type === 'unit' ? board.units.find((u) => u.id === selection.id) ?? null : null;
  const selectedTerrain =
    selection?.type === 'terrain' ? board.terrain.find((t) => t.id === selection.id) ?? null : null;

  const [noteText, setNoteText] = useState('');
  const [noteUnitId, setNoteUnitId] = useState('');
  const [subTurnLabel, setSubTurnLabel] = useState('');

  function toggleEdge(edge: DeploymentZones['edges'][number]) {
    const edges = board.deploymentZones.edges.includes(edge)
      ? board.deploymentZones.edges.filter((e) => e !== edge)
      : [...board.deploymentZones.edges, edge];
    onUpdateBoard({ deploymentZones: { ...board.deploymentZones, edges } });
  }

  function handleAddNote() {
    const note = noteText.trim();
    if (!note) return;
    onAddLogNote(note, noteUnitId || null);
    setNoteText('');
  }

  function handleAddSubTurn() {
    onAddSubTurn(subTurnLabel.trim());
    setSubTurnLabel('');
  }

  return (
    <div className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Old World Battler</h2>
        <button className="sidebar-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <fieldset className="sidebar-fieldset" disabled={readOnly}>
      {readOnly && <p className="sidebar-readonly-note">Global campaign — view only</p>}
      <section>
        <h3>Battle</h3>
        <div className="row">
          <span>
            Phase: <strong>{board.phase === 'setup' ? 'Setup' : 'Battle'}</strong>
          </span>
          {board.phase === 'battle' && (
            <span>
              Turn: <strong>{board.turn}</strong>
            </span>
          )}
        </div>
        {board.phase === 'setup' ? (
          <button onClick={onStartBattle}>Start Battle</button>
        ) : (
          <div className="row">
            <button onClick={onEndTurn}>End Turn</button>
            <button onClick={onBackToSetup}>Back to Setup</button>
            <button onClick={onEnterReplay}>▶ Replay Battle</button>
          </div>
        )}
        {board.phase === 'battle' && (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={board.movementUnlocked}
              onChange={(e) => onUpdateBoard({ movementUnlocked: e.target.checked })}
            />
            Unlock movement (ignore Movement limits)
          </label>
        )}
        {board.phase === 'battle' && (
          <>
            <div className="row">
              <label>
                Note
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="e.g. charged into combat"
                />
              </label>
              <label>
                Unit
                <select value={noteUnitId} onChange={(e) => setNoteUnitId(e.target.value)}>
                  <option value="">(none)</option>
                  {board.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </label>
              <button onClick={handleAddNote}>Add Note</button>
            </div>
            <ul className="log-list">
              {board.log
                .slice()
                .reverse()
                .map((entry) => (
                  <li key={entry.id}>
                    <span className="log-turn">T{entry.turn}</span>
                    <span className="log-body">
                      {entry.unitName && <strong>{entry.unitName}</strong>}
                      {(entry.distanceIn !== 0 || entry.facingChange !== 0) && (
                        <span>
                          {' '}
                          moved {entry.distanceIn}" and turned {entry.facingChange}°
                        </span>
                      )}
                      {entry.note && <span> — {entry.note}</span>}
                    </span>
                    <button className="danger" onClick={() => onRemoveLogEntry(entry.id)}>
                      ✕
                    </button>
                  </li>
                ))}
            </ul>
          </>
        )}
      </section>

      {board.phase === 'battle' && (
        <section>
          <h3>Sub Turns</h3>
          <div className="row">
            <label>
              Label
              <input
                type="text"
                value={subTurnLabel}
                onChange={(e) => setSubTurnLabel(e.target.value)}
                placeholder="e.g. Charge reactions"
              />
            </label>
            <button onClick={handleAddSubTurn}>+ Add Sub Turn</button>
          </div>
          <ul className="log-list">
            {board.history
              .slice()
              .reverse()
              .map((step) => (
                <li key={step.id}>
                  <span className="log-turn">T{step.turn}</span>
                  <span className="log-body">{step.label}</span>
                  {step.kind === 'sub' && (
                    <button className="danger" onClick={() => onRemoveHistoryStep(step.id)}>
                      ✕
                    </button>
                  )}
                </li>
              ))}
          </ul>
        </section>
      )}

      <section>
        <h3>Board</h3>
        <label>
          Preset
          <select
            value=""
            onChange={(e) => {
              const preset = BOARD_PRESETS.find((p) => p.label === e.target.value);
              if (preset) onUpdateBoard({ widthIn: preset.widthIn, heightIn: preset.heightIn });
            }}
          >
            <option value="">Custom…</option>
            {BOARD_PRESETS.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <div className="row">
          <label>
            Width (in)
            <NumberField value={board.widthIn} min={1} onChange={(n) => onUpdateBoard({ widthIn: n })} />
          </label>
          <label>
            Height (in)
            <NumberField value={board.heightIn} min={1} onChange={(n) => onUpdateBoard({ heightIn: n })} />
          </label>
        </div>
      </section>

      <section>
        <h3>Deployment Zones</h3>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={board.deploymentZones.enabled}
            onChange={(e) =>
              onUpdateBoard({ deploymentZones: { ...board.deploymentZones, enabled: e.target.checked } })
            }
          />
          Show deployment zones
        </label>
        <label>
          Depth (in)
          <NumberField
            value={board.deploymentZones.depthIn}
            min={1}
            onChange={(n) => onUpdateBoard({ deploymentZones: { ...board.deploymentZones, depthIn: n } })}
          />
        </label>
        <div className="edge-checks">
          {EDGES.map((edge) => (
            <label key={edge} className="checkbox-label">
              <input
                type="checkbox"
                checked={board.deploymentZones.edges.includes(edge)}
                onChange={() => toggleEdge(edge)}
              />
              {edge}
            </label>
          ))}
        </div>
      </section>

      <section>
        <h3>Units</h3>
        <button onClick={onAddUnit}>+ Add Unit</button>
        <ul className="unit-list">
          {board.units.map((u) => (
            <li
              key={u.id}
              className={selection?.type === 'unit' && selection.id === u.id ? 'selected' : ''}
              onClick={() => onSelect({ type: 'unit', id: u.id })}
            >
              <span className="swatch" style={{ background: swatchBackground(u.colorMajor, u.colorMinor, u.colorScheme) }} />
              {u.name} ({u.faction})
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Terrain</h3>
        <button onClick={onAddTerrain}>+ Add Terrain</button>
        <ul className="unit-list">
          {board.terrain.map((t) => (
            <li
              key={t.id}
              className={selection?.type === 'terrain' && selection.id === t.id ? 'selected' : ''}
              onClick={() => onSelect({ type: 'terrain', id: t.id })}
            >
              <span className="swatch" style={{ background: t.color }} />
              {t.name} ({t.shape})
            </li>
          ))}
        </ul>
      </section>

      {selectedUnit && (
        <section className="unit-editor">
          <h3>Edit Unit</h3>
          <label>
            Name
            <input
              type="text"
              value={selectedUnit.name}
              onChange={(e) => onUpdateUnit(selectedUnit.id, { name: e.target.value })}
            />
          </label>
          <label>
            Faction
            <input
              type="text"
              value={selectedUnit.faction}
              onChange={(e) => onUpdateUnit(selectedUnit.id, { faction: e.target.value })}
            />
          </label>
          <div className="row">
            <label>
              Major Color
              <select
                value={selectedUnit.colorMajor}
                onChange={(e) => onUpdateUnit(selectedUnit.id, { colorMajor: e.target.value })}
              >
                {FACTION_COLORS.map((c) => (
                  <option key={c.hex} value={c.hex}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Minor Color
              <select
                value={selectedUnit.colorMinor}
                onChange={(e) => onUpdateUnit(selectedUnit.id, { colorMinor: e.target.value })}
              >
                {FACTION_COLORS.map((c) => (
                  <option key={c.hex} value={c.hex}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="row">
            <label>
              Pattern
              <select
                value={selectedUnit.colorScheme}
                onChange={(e) => onUpdateUnit(selectedUnit.id, { colorScheme: e.target.value as ColorScheme })}
              >
                {COLOR_SCHEMES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Icon
              <select
                value={selectedUnit.icon}
                onChange={(e) => onUpdateUnit(selectedUnit.id, { icon: e.target.value as IconType })}
              >
                {ICON_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          </div>
          <div className="row">
            <label>
              Base width (mm)
              <NumberField
                value={selectedUnit.baseWidthMm}
                min={1}
                onChange={(n) => onUpdateUnit(selectedUnit.id, { baseWidthMm: n })}
              />
            </label>
            <label>
              Base depth (mm)
              <NumberField
                value={selectedUnit.baseDepthMm}
                min={1}
                onChange={(n) => onUpdateUnit(selectedUnit.id, { baseDepthMm: n })}
              />
            </label>
          </div>
          <div className="row">
            <label>
              Files (width)
              <NumberField
                value={selectedUnit.files}
                min={1}
                onChange={(n) => onUpdateUnit(selectedUnit.id, { files: n })}
              />
            </label>
            <label>
              Ranks (depth)
              <NumberField
                value={selectedUnit.ranks}
                min={1}
                onChange={(n) => onUpdateUnit(selectedUnit.id, { ranks: n })}
              />
            </label>
          </div>
          <div className="row">
            <label>
              Movement (M, in)
              <NumberField
                value={selectedUnit.movementIn}
                min={0}
                step={0.5}
                onChange={(n) => onUpdateUnit(selectedUnit.id, { movementIn: n })}
              />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedUnit.marching}
                onChange={(e) => onUpdateUnit(selectedUnit.id, { marching: e.target.checked })}
              />
              Marching (x{isMarchingColumn(selectedUnit) ? 3 : 2}
              {isMarchingColumn(selectedUnit) ? ' - column' : ''})
            </label>
          </div>
          {board.phase === 'battle' && (
            <div className="row">
              <span>
                Movement remaining:{' '}
                <strong>
                  {(() => {
                    const remaining = remainingMoveIn(
                      selectedUnit,
                      board.moveUsed[selectedUnit.id] ?? 0,
                      board.movementUnlocked,
                    );
                    return Number.isFinite(remaining) ? `${remaining.toFixed(1)}"` : 'Unlocked';
                  })()}
                </strong>
              </span>
            </div>
          )}
          <div className="row">
            <label>
              X (in)
              <NumberField
                value={Number(selectedUnit.x.toFixed(2))}
                step={0.5}
                onChange={(n) => onUpdateUnit(selectedUnit.id, { x: n })}
              />
            </label>
            <label>
              Y (in)
              <NumberField
                value={Number(selectedUnit.y.toFixed(2))}
                step={0.5}
                onChange={(n) => onUpdateUnit(selectedUnit.id, { y: n })}
              />
            </label>
          </div>
          <label>
            Facing
            <div className="facing-controls">
              <input
                type="range"
                min={0}
                max={359}
                value={selectedUnit.facing}
                onChange={(e) => onUpdateUnit(selectedUnit.id, { facing: Number(e.target.value) })}
              />
              <span>{selectedUnit.facing}°</span>
              <button
                onClick={() => onUpdateUnit(selectedUnit.id, { facing: (selectedUnit.facing + 315) % 360 })}
              >
                ↺ 45°
              </button>
              <button
                onClick={() => onUpdateUnit(selectedUnit.id, { facing: (selectedUnit.facing + 45) % 360 })}
              >
                ↻ 45°
              </button>
            </div>
          </label>
          <label>
            Notes
            <textarea
              value={selectedUnit.notes}
              onChange={(e) => onUpdateUnit(selectedUnit.id, { notes: e.target.value })}
            />
          </label>
          <button className="danger" onClick={() => onRemoveUnit(selectedUnit.id)}>
            Remove Unit
          </button>
        </section>
      )}

      {selectedTerrain && (
        <section className="unit-editor">
          <h3>Edit Terrain</h3>
          <label>
            Name
            <input
              type="text"
              value={selectedTerrain.name}
              onChange={(e) => onUpdateTerrain(selectedTerrain.id, { name: e.target.value })}
            />
          </label>
          <label>
            Shape
            <select
              value={selectedTerrain.shape}
              onChange={(e) => onUpdateTerrain(selectedTerrain.id, { shape: e.target.value as Terrain['shape'] })}
            >
              <option value="rect">Rectangle</option>
              <option value="circle">Circle</option>
              <option value="forest">Forest (trees)</option>
            </select>
          </label>
          <label>
            Color
            <select
              value={selectedTerrain.color}
              onChange={(e) => onUpdateTerrain(selectedTerrain.id, { color: e.target.value })}
            >
              {TERRAIN_COLORS.map((c) => (
                <option key={c.hex} value={c.hex}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="row">
            <label>
              {selectedTerrain.shape === 'circle' ? 'Diameter (in)' : 'Width (in)'}
              <NumberField
                value={selectedTerrain.widthIn}
                step={0.5}
                min={0.5}
                onChange={(n) => onUpdateTerrain(selectedTerrain.id, { widthIn: n })}
              />
            </label>
            {selectedTerrain.shape !== 'circle' && (
              <label>
                Depth (in)
                <NumberField
                  value={selectedTerrain.depthIn}
                  step={0.5}
                  min={0.5}
                  onChange={(n) => onUpdateTerrain(selectedTerrain.id, { depthIn: n })}
                />
              </label>
            )}
          </div>
          <div className="row">
            <label>
              X (in)
              <NumberField
                value={Number(selectedTerrain.x.toFixed(2))}
                step={0.5}
                onChange={(n) => onUpdateTerrain(selectedTerrain.id, { x: n })}
              />
            </label>
            <label>
              Y (in)
              <NumberField
                value={Number(selectedTerrain.y.toFixed(2))}
                step={0.5}
                onChange={(n) => onUpdateTerrain(selectedTerrain.id, { y: n })}
              />
            </label>
          </div>
          {selectedTerrain.shape !== 'circle' && (
            <label>
              Rotation
              <div className="facing-controls">
                <input
                  type="range"
                  min={0}
                  max={359}
                  value={selectedTerrain.rotation}
                  onChange={(e) => onUpdateTerrain(selectedTerrain.id, { rotation: Number(e.target.value) })}
                />
                <span>{selectedTerrain.rotation}°</span>
              </div>
            </label>
          )}
          <label>
            Notes
            <textarea
              value={selectedTerrain.notes}
              onChange={(e) => onUpdateTerrain(selectedTerrain.id, { notes: e.target.value })}
            />
          </label>
          <button className="danger" onClick={() => onRemoveTerrain(selectedTerrain.id)}>
            Remove Terrain
          </button>
        </section>
      )}

      <section className="credits">
        <h3>Credits</h3>
        <Credits />
      </section>
      </fieldset>
    </div>
  );
}
