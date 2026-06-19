import { useState } from 'react';
import type { Battle, Campaign } from '../types';

interface Props {
  campaign: Campaign;
  onBack: () => void;
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onViewMap: () => void;
  readOnly?: boolean;
}

export default function BattleSelect({
  campaign,
  onBack,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onViewMap,
  readOnly = false,
}: Props) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    onAdd(name);
    setNewName('');
  }

  function startRename(b: Battle) {
    setEditingId(b.id);
    setEditingText(b.name);
  }

  function commitRename() {
    const name = editingText.trim();
    if (editingId && name) onRename(editingId, name);
    setEditingId(null);
  }

  function handleDelete(b: Battle) {
    if (window.confirm(`Delete battle "${b.name}"?`)) {
      onDelete(b.id);
    }
  }

  return (
    <div className="picker-screen">
      <div className="picker-card">
        <button className="picker-back" onClick={onBack}>
          ← Campaigns
        </button>
        <h1>{campaign.name}</h1>
        <button className="picker-map-btn" onClick={onViewMap}>
          🗺 Campaign Map ({campaign.map.sites.length} site{campaign.map.sites.length === 1 ? '' : 's'})
        </button>
        <p className="picker-subtitle">Choose a battle</p>

        {readOnly && <p className="sidebar-readonly-note">Global campaign — view only</p>}

        {campaign.battles.length === 0 && (
          <p className="picker-empty">No battles yet. Create one below to set up the map.</p>
        )}

        <ul className="picker-list">
          {campaign.battles.map((b) => (
            <li key={b.id} className="picker-item">
              {editingId === b.id ? (
                <input
                  className="picker-rename-input"
                  autoFocus
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                />
              ) : (
                <button className="picker-item-main" onClick={() => onSelect(b.id)}>
                  <span className="picker-item-name">{b.name}</span>
                  <span className="picker-item-meta">
                    {b.board.widthIn}"×{b.board.heightIn}" · {b.board.phase === 'battle' ? `Turn ${b.board.turn}` : 'Setup'}
                  </span>
                </button>
              )}
              {!readOnly && (
                <>
                  <button className="picker-icon-btn" title="Rename" onClick={() => startRename(b)}>
                    ✎
                  </button>
                  <button className="picker-icon-btn danger" title="Delete" onClick={() => handleDelete(b)}>
                    ✕
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        {!readOnly && (
          <div className="picker-add-row">
            <input
              type="text"
              placeholder="New battle name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
            />
            <button onClick={handleAdd}>+ New Battle</button>
          </div>
        )}
      </div>
    </div>
  );
}
