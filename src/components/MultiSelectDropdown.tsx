import React, { useEffect, useRef, useState } from 'react';
import styles from './MultiSelectDropdown.module.css';

interface Option {
  id: number | string;
  label: string;
}

interface Props {
  options: Option[];
  selected: Array<number>;
  onChange: (selected: number[]) => void;
  placeholder?: string;
}

export default function MultiSelectDropdown({ options, selected, onChange, placeholder = 'All Types' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const toggle = (id: number) => {
    const exists = selected.includes(id);
    if (exists) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const label = selected.length === 0 ? placeholder : options.filter((o) => selected.includes(Number(o.id))).map((o) => o.label).join(', ');

  return (
    <div className={styles.container} ref={ref}>
      <button type="button" className={styles.control} onClick={() => setOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={open}>
        <span className={styles.controlLabel}>{label}</span>
        <span className={styles.caret}>▾</span>
      </button>

      {open && (
        <div className={styles.menu} role="listbox">
          <div className={styles.option}>
            <label>
              <input
                type="checkbox"
                checked={selected.length === 0}
                onChange={() => onChange([])}
              />
              <span className={styles.optionLabel}>All Types</span>
            </label>
          </div>
          {options.map((o) => (
            <div key={o.id} className={styles.option}>
              <label>
                <input
                  type="checkbox"
                  checked={selected.includes(Number(o.id))}
                  onChange={() => toggle(Number(o.id))}
                />
                <span className={styles.optionLabel}>{o.label}</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
