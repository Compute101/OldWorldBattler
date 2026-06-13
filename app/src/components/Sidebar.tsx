import type { Unit, BoardState } from '../types';
import { FACTION_COLORS } from '../units';

interface Props {
  board: BoardState;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAddUnit: () => void;
  onUpdateUnit: (id: string, patch: Partial<Unit>) => void;
  onRemoveUnit: (id: string) => void;
  onUpdateBoard: (patch: Partial<BoardState>) => void;
}

export default function Sidebar({
  board,
  selectedId,
  onSelect,
  onAddUnit,
  onUpdateUnit,
  onRemoveUnit,
  onUpdateBoard,
}: Props) {
  const selected = board.units.find((u) => u.id === selectedId) ?? null;

  return (
    <div className="sidebar">
      <h2>Old World Battler</h2>

      <section>
        <h3>Board</h3>
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
      </section>

      <section>
        <h3>Units</h3>
        <button onClick={onAddUnit}>+ Add Unit</button>
        <ul className="unit-list">
          {board.units.map((u) => (
            <li
              key={u.id}
              className={u.id === selectedId ? 'selected' : ''}
              onClick={() => onSelect(u.id)}
            >
              <span className="swatch" style={{ background: u.color }} />
              {u.name} ({u.faction})
            </li>
          ))}
        </ul>
      </section>

      {selected && (
        <section className="unit-editor">
          <h3>Edit Unit</h3>
          <label>
            Name
            <input
              type="text"
              value={selected.name}
              onChange={(e) => onUpdateUnit(selected.id, { name: e.target.value })}
            />
          </label>
          <label>
            Faction
            <input
              type="text"
              value={selected.faction}
              onChange={(e) => onUpdateUnit(selected.id, { faction: e.target.value })}
            />
          </label>
          <label>
            Color
            <select
              value={selected.color}
              onChange={(e) => onUpdateUnit(selected.id, { color: e.target.value })}
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
                value={selected.baseWidthMm}
                onChange={(e) => onUpdateUnit(selected.id, { baseWidthMm: Number(e.target.value) })}
              />
            </label>
            <label>
              Base depth (mm)
              <input
                type="number"
                value={selected.baseDepthMm}
                onChange={(e) => onUpdateUnit(selected.id, { baseDepthMm: Number(e.target.value) })}
              />
            </label>
          </div>
          <div className="row">
            <label>
              Files (width)
              <input
                type="number"
                min={1}
                value={selected.files}
                onChange={(e) => onUpdateUnit(selected.id, { files: Math.max(1, Number(e.target.value)) })}
              />
            </label>
            <label>
              Ranks (depth)
              <input
                type="number"
                min={1}
                value={selected.ranks}
                onChange={(e) => onUpdateUnit(selected.id, { ranks: Math.max(1, Number(e.target.value)) })}
              />
            </label>
          </div>
          <div className="row">
            <label>
              X (in)
              <input
                type="number"
                step={0.5}
                value={Number(selected.x.toFixed(2))}
                onChange={(e) => onUpdateUnit(selected.id, { x: Number(e.target.value) })}
              />
            </label>
            <label>
              Y (in)
              <input
                type="number"
                step={0.5}
                value={Number(selected.y.toFixed(2))}
                onChange={(e) => onUpdateUnit(selected.id, { y: Number(e.target.value) })}
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
                value={selected.facing}
                onChange={(e) => onUpdateUnit(selected.id, { facing: Number(e.target.value) })}
              />
              <span>{selected.facing}°</span>
              <button onClick={() => onUpdateUnit(selected.id, { facing: (selected.facing + 315) % 360 })}>
                ↺ 45°
              </button>
              <button onClick={() => onUpdateUnit(selected.id, { facing: (selected.facing + 45) % 360 })}>
                ↻ 45°
              </button>
            </div>
          </label>
          <label>
            Notes
            <textarea
              value={selected.notes}
              onChange={(e) => onUpdateUnit(selected.id, { notes: e.target.value })}
            />
          </label>
          <button className="danger" onClick={() => onRemoveUnit(selected.id)}>
            Remove Unit
          </button>
        </section>
      )}
    </div>
  );
}
