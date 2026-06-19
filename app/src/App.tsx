import { useEffect, useState } from 'react';
import Board from './components/Board';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import CampaignSelect from './components/CampaignSelect';
import BattleSelect from './components/BattleSelect';
import ReplayView from './components/ReplayView';
import {
  FACTION_COLORS,
  angleDiff,
  defaultBattle,
  defaultCampaign,
  defaultTerrain,
  defaultUnit,
  makeHistoryStep,
  makeId,
  normalizeBoard,
  normalizeCampaign,
  snapshotUnits,
} from './units';
import { GLOBAL_CAMPAIGNS } from './data/globalCampaigns';
import type { BoardState, Campaign, LogEntry, Mode, Selection, Terrain, Unit } from './types';
import './App.css';

const STORAGE_KEY = 'oldworldbattler-campaigns';
const LEGACY_BOARD_KEY = 'oldworldbattler-board';

function loadCampaigns(): Campaign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Campaign>[];
      return parsed.map(normalizeCampaign);
    }
  } catch {
    // ignore invalid stored state
  }

  // Migrate the single-board state from before campaigns/battles existed.
  try {
    const legacyRaw = localStorage.getItem(LEGACY_BOARD_KEY);
    if (legacyRaw) {
      const board = normalizeBoard(JSON.parse(legacyRaw) as Partial<BoardState>);
      const campaign = defaultCampaign('My Campaign');
      campaign.battles.push({ ...defaultBattle('Battle 1'), board });
      return [campaign];
    }
  } catch {
    // ignore invalid stored state
  }

  return [];
}

type View = 'campaigns' | 'battles' | 'board' | 'replay';

function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(loadCampaigns);
  const [view, setView] = useState<View>('campaigns');
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null);
  const [activeBattleId, setActiveBattleId] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [snapIn, setSnapIn] = useState(1);
  const [mode, setMode] = useState<Mode>('select');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
  }, [campaigns]);

  const allCampaigns = [...GLOBAL_CAMPAIGNS, ...campaigns];
  const activeCampaign = allCampaigns.find((c) => c.id === activeCampaignId) ?? null;
  const activeBattle = activeCampaign?.battles.find((b) => b.id === activeBattleId) ?? null;

  function updateBoard(updater: (b: BoardState) => BoardState) {
    if (!activeCampaignId || !activeBattleId || activeCampaign?.readOnly) return;
    setCampaigns((cs) =>
      cs.map((c) =>
        c.id !== activeCampaignId
          ? c
          : {
              ...c,
              battles: c.battles.map((b) => (b.id !== activeBattleId ? b : { ...b, board: updater(b.board) })),
            },
      ),
    );
  }

  function handleAddCampaign(name: string) {
    const campaign = defaultCampaign(name);
    setCampaigns((cs) => [...cs, campaign]);
    setActiveCampaignId(campaign.id);
    setView('battles');
  }

  function handleRenameCampaign(id: string, name: string) {
    setCampaigns((cs) => cs.map((c) => (c.id === id ? { ...c, name } : c)));
  }

  function handleDeleteCampaign(id: string) {
    setCampaigns((cs) => cs.filter((c) => c.id !== id));
  }

  function handleSelectCampaign(id: string) {
    setActiveCampaignId(id);
    setView('battles');
  }

  function handleExportCampaign(id: string) {
    const campaign = allCampaigns.find((c) => c.id === id);
    if (!campaign) return;
    const exportable: Campaign = { ...campaign };
    delete exportable.readOnly;
    const json = JSON.stringify(exportable, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const slug = campaign.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    a.download = `${slug || 'campaign'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportCampaign(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as Partial<Campaign>;
        const campaign = { ...normalizeCampaign(data), id: makeId('campaign'), readOnly: false };
        setCampaigns((cs) => [...cs, campaign]);
      } catch {
        alert('Invalid campaign JSON file');
      }
    };
    reader.readAsText(file);
  }

  function handleAddBattle(name: string) {
    if (!activeCampaignId || activeCampaign?.readOnly) return;
    const battle = defaultBattle(name);
    setCampaigns((cs) =>
      cs.map((c) => (c.id === activeCampaignId ? { ...c, battles: [...c.battles, battle] } : c)),
    );
    setActiveBattleId(battle.id);
    setSelection(null);
    setView('board');
  }

  function handleRenameBattle(id: string, name: string) {
    if (activeCampaign?.readOnly) return;
    setCampaigns((cs) =>
      cs.map((c) =>
        c.id !== activeCampaignId
          ? c
          : { ...c, battles: c.battles.map((b) => (b.id === id ? { ...b, name } : b)) },
      ),
    );
  }

  function handleDeleteBattle(id: string) {
    if (activeCampaign?.readOnly) return;
    setCampaigns((cs) =>
      cs.map((c) =>
        c.id !== activeCampaignId ? c : { ...c, battles: c.battles.filter((b) => b.id !== id) },
      ),
    );
  }

  function handleSelectBattle(id: string) {
    setActiveBattleId(id);
    setSelection(null);
    setView('board');
  }

  function handleBackToCampaigns() {
    setActiveCampaignId(null);
    setActiveBattleId(null);
    setSelection(null);
    setView('campaigns');
  }

  function handleBackToBattles() {
    setActiveBattleId(null);
    setSelection(null);
    setView('battles');
  }

  function handleAddUnit() {
    if (!activeBattle) return;
    const color = FACTION_COLORS[activeBattle.board.units.length % FACTION_COLORS.length].hex;
    const unit = defaultUnit('Faction', color);
    unit.x = activeBattle.board.widthIn / 2;
    unit.y = activeBattle.board.heightIn / 2;
    updateBoard((b) => ({ ...b, units: [...b.units, unit] }));
    setSelection({ type: 'unit', id: unit.id });
  }

  function handleUpdateUnit(id: string, patch: Partial<Unit>, costIn?: number) {
    updateBoard((b) => ({
      ...b,
      units: b.units.map((u) => (u.id === id ? { ...u, ...patch } : u)),
      moveUsed: costIn
        ? { ...b.moveUsed, [id]: (b.moveUsed[id] ?? 0) + costIn }
        : b.moveUsed,
    }));
  }

  function handleRemoveUnit(id: string) {
    updateBoard((b) => ({ ...b, units: b.units.filter((u) => u.id !== id) }));
    setSelection(null);
  }

  function handleAddTerrain() {
    if (!activeBattle) return;
    const t = defaultTerrain(activeBattle.board.widthIn / 2, activeBattle.board.heightIn / 2);
    updateBoard((b) => ({ ...b, terrain: [...b.terrain, t] }));
    setSelection({ type: 'terrain', id: t.id });
  }

  function handleUpdateTerrain(id: string, patch: Partial<Terrain>) {
    updateBoard((b) => ({
      ...b,
      terrain: b.terrain.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }

  function handleMoveTerrain(id: string, x: number, y: number) {
    if (activeBattle?.board.phase === 'battle') return;
    handleUpdateTerrain(id, { x, y });
  }

  function handleRotateTerrain(id: string, rotation: number) {
    if (activeBattle?.board.phase === 'battle') return;
    handleUpdateTerrain(id, { rotation });
  }

  function handleRemoveTerrain(id: string) {
    updateBoard((b) => ({ ...b, terrain: b.terrain.filter((t) => t.id !== id) }));
    setSelection(null);
  }

  function handleUpdateBoard(patch: Partial<BoardState>) {
    updateBoard((b) => ({ ...b, ...patch }));
  }

  function handleImport(data: BoardState) {
    updateBoard(() => normalizeBoard(data));
    setSelection(null);
  }

  function handleSelect(sel: Selection | null) {
    setSelection(sel);
    if (sel) setSidebarOpen(true);
  }

  function handleStartBattle() {
    updateBoard((b) => ({
      ...b,
      phase: 'battle',
      turn: 1,
      turnStart: snapshotUnits(b.units),
      moveUsed: {},
      log: [],
      history: [makeHistoryStep(1, 'turn', 'Turn 1', b.units)],
    }));
  }

  function handleBackToSetup() {
    updateBoard((b) => ({ ...b, phase: 'setup' }));
  }

  function handleEndTurn() {
    updateBoard((b) => {
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
      const nextTurn = b.turn + 1;
      return {
        ...b,
        turn: nextTurn,
        turnStart: snapshotUnits(b.units),
        moveUsed: {},
        log: [...b.log, ...entries],
        history: [...b.history, makeHistoryStep(nextTurn, 'turn', `Turn ${nextTurn}`, b.units)],
      };
    });
  }

  function handleAddLogNote(note: string, unitId: string | null) {
    updateBoard((b) => {
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
    updateBoard((b) => ({ ...b, log: b.log.filter((e) => e.id !== id) }));
  }

  function handleAddSubTurn(label: string) {
    updateBoard((b) => ({
      ...b,
      history: [...b.history, makeHistoryStep(b.turn, 'sub', label.trim() || 'Sub-turn', b.units)],
    }));
  }

  function handleRemoveHistoryStep(id: string) {
    updateBoard((b) => ({ ...b, history: b.history.filter((h) => h.id !== id) }));
  }

  function handleEnterReplay() {
    setSelection(null);
    setView('replay');
  }

  function handleExitReplay() {
    setView('board');
  }

  if (view === 'campaigns' || !activeCampaign) {
    return (
      <CampaignSelect
        campaigns={allCampaigns}
        onSelect={handleSelectCampaign}
        onAdd={handleAddCampaign}
        onRename={handleRenameCampaign}
        onDelete={handleDeleteCampaign}
        onExport={handleExportCampaign}
        onImportFile={handleImportCampaign}
      />
    );
  }

  if (view === 'battles' || !activeBattle) {
    return (
      <BattleSelect
        campaign={activeCampaign}
        onBack={handleBackToCampaigns}
        onSelect={handleSelectBattle}
        onAdd={handleAddBattle}
        onRename={handleRenameBattle}
        onDelete={handleDeleteBattle}
        readOnly={activeCampaign.readOnly}
      />
    );
  }

  if (view === 'replay') {
    return (
      <ReplayView
        board={activeBattle.board}
        breadcrumb={`${activeCampaign.name} / ${activeBattle.name}`}
        onExit={handleExitReplay}
      />
    );
  }

  const board = activeBattle.board;

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
        onAddSubTurn={handleAddSubTurn}
        onRemoveHistoryStep={handleRemoveHistoryStep}
        onEnterReplay={handleEnterReplay}
        readOnly={activeCampaign.readOnly}
      />
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <div className="main">
        <Toolbar
          board={board}
          onImport={handleImport}
          breadcrumb={`${activeCampaign.name} / ${activeBattle.name}`}
          onBack={handleBackToBattles}
          readOnly={activeCampaign.readOnly}
        />
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
