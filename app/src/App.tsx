import { useEffect, useState } from 'react';
import Board from './components/Board';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import { FACTION_COLORS, defaultBoardState, defaultTerrain, defaultUnit } from './units';
import type { BoardState, Mode, Selection, Terrain, Unit } from './types';
import './App.css';

const STORAGE_KEY = 'oldworldbattler-board';

function loadBoard(): BoardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<BoardState>;
      return { ...defaultBoardState(), ...parsed };
    }
  } catch {
    // ignore invalid stored state
  }
  return defaultBoardState();
}

function App() {
  const [board, setBoard] = useState<BoardState>(loadBoard);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [snapIn, setSnapIn] = useState(1);
  const [mode, setMode] = useState<Mode>('select');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  function handleAddUnit() {
    const color = FACTION_COLORS[board.units.length % FACTION_COLORS.length];
    const unit = defaultUnit('Faction', color);
    unit.x = board.widthIn / 2;
    unit.y = board.heightIn / 2;
    setBoard((b) => ({ ...b, units: [...b.units, unit] }));
    setSelection({ type: 'unit', id: unit.id });
  }

  function handleUpdateUnit(id: string, patch: Partial<Unit>) {
    setBoard((b) => ({
      ...b,
      units: b.units.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    }));
  }

  function handleMoveUnit(id: string, x: number, y: number) {
    handleUpdateUnit(id, { x, y });
  }

  function handleRemoveUnit(id: string) {
    setBoard((b) => ({ ...b, units: b.units.filter((u) => u.id !== id) }));
    setSelection(null);
  }

  function handleAddTerrain() {
    const t = defaultTerrain(board.widthIn / 2, board.heightIn / 2);
    setBoard((b) => ({ ...b, terrain: [...b.terrain, t] }));
    setSelection({ type: 'terrain', id: t.id });
  }

  function handleUpdateTerrain(id: string, patch: Partial<Terrain>) {
    setBoard((b) => ({
      ...b,
      terrain: b.terrain.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }

  function handleMoveTerrain(id: string, x: number, y: number) {
    handleUpdateTerrain(id, { x, y });
  }

  function handleRemoveTerrain(id: string) {
    setBoard((b) => ({ ...b, terrain: b.terrain.filter((t) => t.id !== id) }));
    setSelection(null);
  }

  function handleUpdateBoard(patch: Partial<BoardState>) {
    setBoard((b) => ({ ...b, ...patch }));
  }

  function handleImport(data: BoardState) {
    setBoard({ ...defaultBoardState(), ...data });
    setSelection(null);
  }

  return (
    <div className="app">
      <Sidebar
        board={board}
        selection={selection}
        onSelect={setSelection}
        onAddUnit={handleAddUnit}
        onUpdateUnit={handleUpdateUnit}
        onRemoveUnit={handleRemoveUnit}
        onAddTerrain={handleAddTerrain}
        onUpdateTerrain={handleUpdateTerrain}
        onRemoveTerrain={handleRemoveTerrain}
        onUpdateBoard={handleUpdateBoard}
      />
      <div className="main">
        <Toolbar board={board} onImport={handleImport} />
        <div className="view-controls">
          <label className="snap-toggle">
            Snap to grid
            <select value={snapIn} onChange={(e) => setSnapIn(Number(e.target.value))}>
              <option value={0}>Off</option>
              <option value={0.5}>0.5"</option>
              <option value={1}>1"</option>
            </select>
          </label>
          <div className="mode-toggle">
            <button className={mode === 'select' ? 'active' : ''} onClick={() => setMode('select')}>
              Select / Pan
            </button>
            <button className={mode === 'measure' ? 'active' : ''} onClick={() => setMode('measure')}>
              Measure
            </button>
          </div>
        </div>
        <Board
          board={board}
          selection={selection}
          onSelect={setSelection}
          onMoveUnit={handleMoveUnit}
          onMoveTerrain={handleMoveTerrain}
          snapIn={snapIn}
          mode={mode}
        />
      </div>
    </div>
  );
}

export default App;
