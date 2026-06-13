import { useRef } from 'react';
import type { BoardState } from '../types';

interface Props {
  board: BoardState;
  onImport: (board: BoardState) => void;
}

export default function Toolbar({ board, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleExport() {
    const json = JSON.stringify(board, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'oldworld-board-state.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(JSON.stringify(board, null, 2));
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as BoardState;
        onImport(data);
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="toolbar">
      <button onClick={handleExport}>Export JSON</button>
      <button onClick={handleCopy}>Copy JSON</button>
      <button onClick={handleImportClick}>Import JSON</button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
