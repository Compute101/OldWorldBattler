import { useRef, useState } from 'react';
import type { Campaign } from '../types';
import Credits from './Credits';

interface Props {
  campaigns: Campaign[];
  onSelect: (id: string) => void;
  onAdd: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  onImportFile: (file: File) => void;
}

export default function CampaignSelect({
  campaigns,
  onSelect,
  onAdd,
  onRename,
  onDelete,
  onExport,
  onImportFile,
}: Props) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    onAdd(name);
    setNewName('');
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onImportFile(file);
    e.target.value = '';
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
                  <span className="picker-item-name">
                    {c.name}
                    {c.readOnly && <span className="picker-badge">Global</span>}
                  </span>
                  <span className="picker-item-meta">
                    {c.battles.length} battle{c.battles.length === 1 ? '' : 's'}
                  </span>
                </button>
              )}
              {!c.readOnly && (
                <button className="picker-icon-btn" title="Rename" onClick={() => startRename(c)}>
                  ✎
                </button>
              )}
              <button className="picker-icon-btn" title="Export campaign as JSON" onClick={() => onExport(c.id)}>
                ⬇
              </button>
              {!c.readOnly && (
                <button className="picker-icon-btn danger" title="Delete" onClick={() => handleDelete(c)}>
                  ✕
                </button>
              )}
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
          <button onClick={handleAdd}>+ New Campaign</button>
        </div>

        <div className="picker-add-row">
          <button onClick={handleImportClick}>Import Campaign JSON</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        <footer className="picker-credits">
          <Credits />
        </footer>
      </div>
    </div>
  );
}
