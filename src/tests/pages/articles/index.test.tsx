import React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ArticlesPage from '@/pages/articles';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    lang: 'en',
  }),
}));

vi.mock('@/components/NextSeoWrapper', () => ({
  default: () => null,
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('ArticlesPage', () => {
  it('renders links to each article', () => {
    render(<ArticlesPage />);

    const links = screen.getAllByRole('link');
    const hrefs = links.map((link) => link.getAttribute('href'));

    expect(links).toHaveLength(5);
    expect(hrefs).toEqual(
      expect.arrayContaining([
        '/about-the-quran',
        '/what-is-ramadan',
        '/ramadan',
        '/beyond-ramadan',
        '/take-notes',
      ]),
    );
  });
});
