import { useState } from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export default function NumberField({ value, onChange, min, max, step = 1 }: Props) {
  const [text, setText] = useState(String(value));
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setText(String(value));
  }

  function commit(raw: string) {
    let n = Number(raw);
    if (raw.trim() === '' || Number.isNaN(n)) n = value;
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    setPrevValue(n);
    setText(String(n));
    if (n !== value) onChange(n);
  }

  function step_(delta: number) {
    const current = Number(text);
    commit(String((Number.isNaN(current) ? value : current) + delta));
  }

  return (
    <div className="number-field">
      <button type="button" onClick={() => step_(-step)} aria-label="Decrease">
        −
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={text}
        min={min}
        max={max}
        step={step}
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit(e.currentTarget.value);
        }}
      />
      <button type="button" onClick={() => step_(step)} aria-label="Increase">
        +
      </button>
    </div>
  );
}
