import React from 'react';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Reference from './Reference';

afterEach(() => {
  cleanup();
});

describe('Reference', () => {
  it('renders the provided chapter name for Urdu references', () => {
    render(<Reference reference="2:261" chapterName="Al-Baqarah" lang="ur" isLink={false} />);

    expect(screen.getByLabelText('Al-Baqarah 2:261').textContent).toBe('Al-Baqarah 2:261');
  });

  it('localizes the verse key for Arabic references', () => {
    render(<Reference reference="2:261" chapterName="Al-Baqarah" lang="ar" isLink={false} />);

    expect(screen.getByLabelText('Al-Baqarah ٢٦١:٢').textContent).toBe('Al-Baqarah ٢٦١:٢');
  });

  it('keeps the incoming chapter name for locales without a localized override', () => {
    render(<Reference reference="2:261" chapterName="Al-Baqarah" lang="en" isLink={false} />);

    expect(screen.getByLabelText('Al-Baqarah 2:261').textContent).toBe('Al-Baqarah 2:261');
  });
});
