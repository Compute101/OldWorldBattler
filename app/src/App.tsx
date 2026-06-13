import { useEffect, useState } from 'react';
import Board from './components/Board';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import { FACTION_COLORS, defaultUnit } from './units';
import type { BoardState, Unit } from './types';
import './App.css';

const STORAGE_KEY = 'oldworldbattler-board';

const initialBoard: BoardState = {
  widthIn: 48,
  heightIn: 48,
  units: [],
};

function loadBoard(): BoardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BoardState;
  } catch {
    // ignore invalid stored state
  }
  return initialBoard;
}

function App() {
  const [board, setBoard] = useState<BoardState>(loadBoard);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapIn, setSnapIn] = useState(1);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  function handleAddUnit() {
    const color = FACTION_COLORS[board.units.length % FACTION_COLORS.length];
    const unit = defaultUnit('Faction', color);
    setBoard((b) => ({ ...b, units: [...b.units, unit] }));
    setSelectedId(unit.id);
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
    setSelectedId(null);
  }

  function handleUpdateBoard(patch: Partial<BoardState>) {
    setBoard((b) => ({ ...b, ...patch }));
  }

  function handleImport(data: BoardState) {
    setBoard(data);
    setSelectedId(null);
  }

  return (
    <div className="app">
      <Sidebar
        board={board}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAddUnit={handleAddUnit}
        onUpdateUnit={handleUpdateUnit}
        onRemoveUnit={handleRemoveUnit}
        onUpdateBoard={handleUpdateBoard}
      />
      <div className="main">
        <Toolbar board={board} onImport={handleImport} />
        <label className="snap-toggle">
          Snap to grid
          <select value={snapIn} onChange={(e) => setSnapIn(Number(e.target.value))}>
            <option value={0}>Off</option>
            <option value={0.5}>0.5"</option>
            <option value={1}>1"</option>
          </select>
        </label>
        <Board
          board={board}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onMove={handleMoveUnit}
          snapIn={snapIn}
        />
      </div>
    </div>
  );
}

export default App;
