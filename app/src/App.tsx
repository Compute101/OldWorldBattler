import { useEffect, useState } from 'react';
import Board from './components/Board';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import { FACTION_COLORS, angleDiff, defaultBoardState, defaultTerrain, defaultUnit, makeId, normalizeUnit, snapshotUnits } from './units';
import type { BoardState, LogEntry, Mode, Selection, Terrain, Unit } from './types';
import './App.css';

const STORAGE_KEY = 'oldworldbattler-board';

function loadBoard(): BoardState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<BoardState>;
      const board = { ...defaultBoardState(), ...parsed };
      return { ...board, units: (board.units ?? []).map(normalizeUnit) };
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  function handleUpdateUnit(id: string, patch: Partial<Unit>, costIn?: number) {
    setBoard((b) => ({
      ...b,
      units: b.units.map((u) => (u.id === id ? { ...u, ...patch } : u)),
      moveUsed: costIn
        ? { ...b.moveUsed, [id]: (b.moveUsed[id] ?? 0) + costIn }
        : b.moveUsed,
    }));
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
    if (board.phase === 'battle') return;
    handleUpdateTerrain(id, { x, y });
  }

  function handleRotateTerrain(id: string, rotation: number) {
    if (board.phase === 'battle') return;
    handleUpdateTerrain(id, { rotation });
  }

  function handleRemoveTerrain(id: string) {
    setBoard((b) => ({ ...b, terrain: b.terrain.filter((t) => t.id !== id) }));
    setSelection(null);
  }

  function handleUpdateBoard(patch: Partial<BoardState>) {
    setBoard((b) => ({ ...b, ...patch }));
  }

  function handleImport(data: BoardState) {
    const board = { ...defaultBoardState(), ...data };
    setBoard({ ...board, units: (board.units ?? []).map(normalizeUnit) });
    setSelection(null);
  }

  function handleSelect(sel: Selection | null) {
    setSelection(sel);
    if (sel) setSidebarOpen(true);
  }

  function handleStartBattle() {
    setBoard((b) => ({
      ...b,
      phase: 'battle',
      turn: 1,
      turnStart: snapshotUnits(b.units),
      moveUsed: {},
      log: [],
    }));
  }

  function handleBackToSetup() {
    setBoard((b) => ({ ...b, phase: 'setup' }));
  }

  function handleEndTurn() {
    setBoard((b) => {
      const entries: LogEntry[] = [];
      for (const u of b.units) {
        const start = b.turnStart[u.id];
        if (!start) continue;
        const distanceIn = Math.round(Math.hypot(u.x - start.x, u.y - start.y) * 10) / 10;
        const facingChange = Math.round(angleDiff(start.facing, u.facing));
        if (distanceIn === 0 && facingChange === 0) continue;
        entries.push({
          id: makeId('log'),
          turn: b.turn,
          unitId: u.id,
          unitName: u.name,
          distanceIn,
          facingChange,
          note: '',
        });
      }
      return {
        ...b,
        turn: b.turn + 1,
        turnStart: snapshotUnits(b.units),
        moveUsed: {},
        log: [...b.log, ...entries],
      };
    });
  }

  function handleAddLogNote(note: string, unitId: string | null) {
    setBoard((b) => {
      const unit = unitId ? b.units.find((u) => u.id === unitId) : null;
      const entry: LogEntry = {
        id: makeId('log'),
        turn: b.turn,
        unitId: unitId ?? null,
        unitName: unit?.name ?? '',
        distanceIn: 0,
        facingChange: 0,
        note,
      };
      return { ...b, log: [...b.log, entry] };
    });
  }

  function handleRemoveLogEntry(id: string) {
    setBoard((b) => ({ ...b, log: b.log.filter((e) => e.id !== id) }));
  }

  return (
    <div className="app">
      <Sidebar
        board={board}
        selection={selection}
        onSelect={handleSelect}
        onAddUnit={() => {
          handleAddUnit();
          setSidebarOpen(true);
        }}
        onUpdateUnit={handleUpdateUnit}
        onRemoveUnit={handleRemoveUnit}
        onAddTerrain={() => {
          handleAddTerrain();
          setSidebarOpen(true);
        }}
        onUpdateTerrain={handleUpdateTerrain}
        onRemoveTerrain={handleRemoveTerrain}
        onUpdateBoard={handleUpdateBoard}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onStartBattle={handleStartBattle}
        onBackToSetup={handleBackToSetup}
        onEndTurn={handleEndTurn}
        onAddLogNote={handleAddLogNote}
        onRemoveLogEntry={handleRemoveLogEntry}
      />
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <div className="main">
        <Toolbar board={board} onImport={handleImport} />
        <div className="view-controls">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}>
            ☰ Menu
          </button>
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
          onUpdateUnit={handleUpdateUnit}
          onMoveTerrain={handleMoveTerrain}
          onRotateTerrain={handleRotateTerrain}
          snapIn={snapIn}
          mode={mode}
        />
      </div>
    </div>
  );
}

export default App;
