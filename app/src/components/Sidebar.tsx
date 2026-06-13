import { useState } from 'react';
import type { BoardState, DeploymentZones, Selection, Terrain, Unit } from '../types';
import { BOARD_PRESETS, FACTION_COLORS, TERRAIN_COLORS, isMarchingColumn, remainingMoveIn } from '../units';

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
}: Props) {
  const selectedUnit =
    selection?.type === 'unit' ? board.units.find((u) => u.id === selection.id) ?? null : null;
  const selectedTerrain =
    selection?.type === 'terrain' ? board.terrain.find((t) => t.id === selection.id) ?? null : null;

  const [noteText, setNoteText] = useState('');
  const [noteUnitId, setNoteUnitId] = useState('');

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

  return (
    <div className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Old World Battler</h2>
        <button className="sidebar-close" onClick={onClose}>
          ✕
        </button>
      </div>

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
            <input
              type="number"
              value={board.widthIn}
              onChange={(e) => onUpdateBoard({ widthIn: Number(e.target.value) })}
            />
          </label>
          <label>
            Height (in)
            <input
              type="number"
              value={board.heightIn}
              onChange={(e) => onUpdateBoard({ heightIn: Number(e.target.value) })}
            />
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
          <input
            type="number"
            min={1}
            value={board.deploymentZones.depthIn}
            onChange={(e) =>
              onUpdateBoard({
                deploymentZones: { ...board.deploymentZones, depthIn: Number(e.target.value) },
              })
            }
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
              <span className="swatch" style={{ background: u.color }} />
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
          <label>
            Color
            <select
              value={selectedUnit.color}
              onChange={(e) => onUpdateUnit(selectedUnit.id, { color: e.target.value })}
            >
              {FACTION_COLORS.map((c) => (
                <option key={c} value={c} style={{ background: c }}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <div className="row">
            <label>
              Base width (mm)
              <input
                type="number"
                value={selectedUnit.baseWidthMm}
                onChange={(e) => onUpdateUnit(selectedUnit.id, { baseWidthMm: Number(e.target.value) })}
              />
            </label>
            <label>
              Base depth (mm)
              <input
                type="number"
                value={selectedUnit.baseDepthMm}
                onChange={(e) => onUpdateUnit(selectedUnit.id, { baseDepthMm: Number(e.target.value) })}
              />
            </label>
          </div>
          <div className="row">
            <label>
              Files (width)
              <input
                type="number"
                min={1}
                value={selectedUnit.files}
                onChange={(e) =>
                  onUpdateUnit(selectedUnit.id, { files: Math.max(1, Number(e.target.value)) })
                }
              />
            </label>
            <label>
              Ranks (depth)
              <input
                type="number"
                min={1}
                value={selectedUnit.ranks}
                onChange={(e) =>
                  onUpdateUnit(selectedUnit.id, { ranks: Math.max(1, Number(e.target.value)) })
                }
              />
            </label>
          </div>
          <div className="row">
            <label>
              Movement (M, in)
              <input
                type="number"
                min={0}
                step={0.5}
                value={selectedUnit.movementIn}
                onChange={(e) =>
                  onUpdateUnit(selectedUnit.id, { movementIn: Math.max(0, Number(e.target.value)) })
                }
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
              <input
                type="number"
                step={0.5}
                value={Number(selectedUnit.x.toFixed(2))}
                onChange={(e) => onUpdateUnit(selectedUnit.id, { x: Number(e.target.value) })}
              />
            </label>
            <label>
              Y (in)
              <input
                type="number"
                step={0.5}
                value={Number(selectedUnit.y.toFixed(2))}
                onChange={(e) => onUpdateUnit(selectedUnit.id, { y: Number(e.target.value) })}
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
            </select>
          </label>
          <label>
            Color
            <select
              value={selectedTerrain.color}
              onChange={(e) => onUpdateTerrain(selectedTerrain.id, { color: e.target.value })}
            >
              {TERRAIN_COLORS.map((c) => (
                <option key={c} value={c} style={{ background: c }}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <div className="row">
            <label>
              {selectedTerrain.shape === 'circle' ? 'Diameter (in)' : 'Width (in)'}
              <input
                type="number"
                step={0.5}
                min={0.5}
                value={selectedTerrain.widthIn}
                onChange={(e) => onUpdateTerrain(selectedTerrain.id, { widthIn: Number(e.target.value) })}
              />
            </label>
            {selectedTerrain.shape === 'rect' && (
              <label>
                Depth (in)
                <input
                  type="number"
                  step={0.5}
                  min={0.5}
                  value={selectedTerrain.depthIn}
                  onChange={(e) => onUpdateTerrain(selectedTerrain.id, { depthIn: Number(e.target.value) })}
                />
              </label>
            )}
          </div>
          <div className="row">
            <label>
              X (in)
              <input
                type="number"
                step={0.5}
                value={Number(selectedTerrain.x.toFixed(2))}
                onChange={(e) => onUpdateTerrain(selectedTerrain.id, { x: Number(e.target.value) })}
              />
            </label>
            <label>
              Y (in)
              <input
                type="number"
                step={0.5}
                value={Number(selectedTerrain.y.toFixed(2))}
                onChange={(e) => onUpdateTerrain(selectedTerrain.id, { y: Number(e.target.value) })}
              />
            </label>
          </div>
          {selectedTerrain.shape === 'rect' && (
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
    </div>
  );
}
