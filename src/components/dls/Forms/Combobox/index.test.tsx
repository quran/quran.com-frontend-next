import React from 'react';

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DropdownItem } from './ComboboxItem';

import Combobox from '.';

vi.mock('./Icons/SearchInputIcon', () => ({ default: () => <span /> }));
vi.mock('./Icons/ClearInputIcon', () => ({ default: () => null }));
vi.mock('./Icons/CaretInputIcon', () => ({ default: () => null }));

// jsdom doesn't implement scrollIntoView; ComboboxItems calls it on open.
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Builds the same shape of items the repeat-settings / advanced-copy verse
// selectors build via `generateChapterVersesKeys`: one entry per ayah, value
// and label both being the localized verse key (e.g. "36:1").
const buildVerseItems = (chapterNumber: number, versesCount: number): DropdownItem[] =>
  Array.from({ length: versesCount }, (unused, index) => {
    const verseKey = `${chapterNumber}:${index + 1}`;
    return {
      id: verseKey,
      value: verseKey,
      name: verseKey,
      label: verseKey,
    };
  });

describe('Combobox', () => {
  afterEach(cleanup);

  // Regression test for https://github.com/quran/quran.com-frontend-next/issues/2088
  // Root cause: `inputValue` was seeded from `initialInputValue` (the currently
  // selected verse key) and never cleared on open, so the substring filter kept
  // matching only labels containing that stale value (e.g. selecting "36:1" then
  // reopening only showed "36:1", "36:10"-"36:19").
  it('shows every ayah of a long surah after opening, not just ones matching the pre-seeded selection', () => {
    // Ya-Sin (36) has 83 verses; the reported bug reproduces when the
    // currently selected verse is the surah's first ayah (e.g. "36:1"),
    // since every ayah from 10-19 also contains "36:1" as a substring while
    // 2-9 and 20+ do not.
    const items = buildVerseItems(36, 83);

    render(
      <Combobox
        id="single"
        items={items}
        value="36:1"
        initialInputValue="36:1"
        placeholder="Search..."
      />,
    );

    // Before opening, the combobox is closed; open it the same way a user
    // would, by clicking the selector.
    fireEvent.click(screen.getByRole('combobox'));

    const listbox = screen.getByRole('listbox');

    // These ayahs never contained "36:1" as a substring, so they were hidden
    // by the stale filter before the fix.
    expect(within(listbox).getByText('36:2')).not.toBeNull();
    expect(within(listbox).getByText('36:20')).not.toBeNull();
    expect(within(listbox).getByText('36:83')).not.toBeNull();
  });

  it('still shows every ayah for a short surah after opening', () => {
    // An-Nas (114) has 6 verses; make sure the fix doesn't break the short case.
    const items = buildVerseItems(114, 6);

    render(
      <Combobox
        id="single"
        items={items}
        value="114:1"
        initialInputValue="114:1"
        placeholder="Search..."
      />,
    );

    fireEvent.click(screen.getByRole('combobox'));

    const listbox = screen.getByRole('listbox');

    expect(within(listbox).getByText('114:1')).not.toBeNull();
    expect(within(listbox).getByText('114:6')).not.toBeNull();
  });

  it('still filters items once the user types after opening', () => {
    const items = buildVerseItems(36, 83);

    render(
      <Combobox
        id="single"
        items={items}
        value="36:1"
        initialInputValue="36:1"
        placeholder="Search..."
      />,
    );

    const input = screen.getByRole('combobox');
    fireEvent.click(input);
    fireEvent.change(input, { target: { value: '36:5' } });

    const listbox = screen.getByRole('listbox');

    expect(within(listbox).getByText('36:5')).not.toBeNull();
    expect(within(listbox).queryByText('36:20')).toBeNull();
  });
});
