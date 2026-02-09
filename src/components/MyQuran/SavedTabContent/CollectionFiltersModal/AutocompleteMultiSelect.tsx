import React, { useMemo, useState } from 'react';

import classNames from 'classnames';

import styles from './AutocompleteMultiSelect.module.scss';

import Checkbox from '@/dls/Forms/Checkbox/Checkbox';
import CloseIcon from '@/icons/close.svg';

type Item = {
  value: string;
  label: string;
};

type Props = {
  id: string;
  label: string;
  placeholder: string;
  items: Item[];
  selectedValues: string[];
  onChange: (nextSelectedValues: string[]) => void;
  emptyMessage?: string;
};

const AutocompleteMultiSelect: React.FC<Props> = ({
  id,
  label,
  placeholder,
  items,
  selectedValues,
  onChange,
  emptyMessage = 'No results',
}) => {
  const [query, setQuery] = useState('');

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  const selectedChips = useMemo(() => {
    const labelByValue = new Map(items.map((item) => [item.value, item.label]));
    return selectedValues.map((value) => ({
      value,
      label: labelByValue.get(value) || value,
    }));
  }, [items, selectedValues]);

  const toggle = (value: string) => {
    if (selectedSet.has(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const removeChip = (value: string) => {
    onChange(selectedValues.filter((v) => v !== value));
  };

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <p className={styles.label}>{label}</p>
      </div>

      <div className={styles.searchBox}>
        <input
          id={`${id}-search`}
          className={styles.searchInput}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {selectedChips.length > 0 && (
        <div className={styles.chips} aria-label={`${label} selected`}>
          {selectedChips.map((chip) => (
            <button
              key={`${id}-chip-${chip.value}`}
              type="button"
              className={styles.chip}
              onClick={() => removeChip(chip.value)}
              title={chip.label}
            >
              <span className={styles.chipLabel}>{chip.label}</span>
              <CloseIcon className={styles.chipIcon} />
            </button>
          ))}
        </div>
      )}

      <div className={styles.list} role="listbox" aria-label={label}>
        {filteredItems.length === 0 ? (
          <div className={classNames(styles.row, styles.emptyRow)}>{emptyMessage}</div>
        ) : (
          filteredItems.map((item) => {
            const checked = selectedSet.has(item.value);
            const checkboxId = `${id}-${item.value}`;
            return (
              <button
                key={checkboxId}
                type="button"
                className={classNames(styles.row, checked && styles.rowSelected)}
                onClick={() => toggle(item.value)}
              >
                <Checkbox
                  id={checkboxId}
                  checked={checked}
                  onChange={() => toggle(item.value)}
                  onClick={(e) => e.stopPropagation()}
                  containerClassName={styles.checkboxContainer}
                />
                <span className={styles.rowLabel}>{item.label}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AutocompleteMultiSelect;
