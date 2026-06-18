import { useState } from 'react';
import type { Campaign } from '../types';
import { MAP_TEMPLATES } from '../maps';
import Credits from './Credits';

interface Props {
  campaigns: Campaign[];
  onSelect: (id: string) => void;
  onAdd: (name: string, mapTemplateKey?: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export default function CampaignSelect({ campaigns, onSelect, onAdd, onRename, onDelete }: Props) {
  const [newName, setNewName] = useState('');
  const [newMapKey, setNewMapKey] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    onAdd(name, newMapKey || undefined);
    setNewName('');
    setNewMapKey('');
  }

  function startRename(c: Campaign) {
    setEditingId(c.id);
    setEditingText(c.name);
  }

  function commitRename() {
    const name = editingText.trim();
    if (editingId && name) onRename(editingId, name);
    setEditingId(null);
  }

  function handleDelete(c: Campaign) {
    if (window.confirm(`Delete campaign "${c.name}" and all of its battles?`)) {
      onDelete(c.id);
    }
  }

  return (
    <div className="picker-screen">
      <div className="picker-card">
        <h1>Old World Battler</h1>
        <p className="picker-subtitle">Choose a campaign</p>

        {campaigns.length === 0 && <p className="picker-empty">No campaigns yet. Create one below to get started.</p>}

        <ul className="picker-list">
          {campaigns.map((c) => (
            <li key={c.id} className="picker-item">
              {editingId === c.id ? (
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
                <button className="picker-item-main" onClick={() => onSelect(c.id)}>
                  <span className="picker-item-name">{c.name}</span>
                  <span className="picker-item-meta">
                    {c.battles.length} battle{c.battles.length === 1 ? '' : 's'}
                  </span>
                </button>
              )}
              <button className="picker-icon-btn" title="Rename" onClick={() => startRename(c)}>
                ✎
              </button>
              <button className="picker-icon-btn danger" title="Delete" onClick={() => handleDelete(c)}>
                ✕
              </button>
            </li>
          ))}
        </ul>

        <div className="picker-add-row">
          <input
            type="text"
            placeholder="New campaign name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
          />
          <select
            className="picker-map-select"
            value={newMapKey}
            onChange={(e) => setNewMapKey(e.target.value)}
            aria-label="Starting campaign map"
          >
            <option value="">Blank map</option>
            {MAP_TEMPLATES.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
          <button onClick={handleAdd}>+ New Campaign</button>
        </div>

        <footer className="picker-credits">
          <Credits />
        </footer>
      </div>
    </div>
  );
}
