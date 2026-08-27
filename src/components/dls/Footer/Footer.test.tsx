import React from 'react';

import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Footer from './Footer';
import styles from './Footer.module.scss';

const mockUseRouter = vi.fn();

vi.mock('next/router', () => ({
  useRouter: () => mockUseRouter(),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key }),
}));

vi.mock('./BottomSection', () => ({
  default: () => <div />,
}));

vi.mock('./Links', () => ({
  default: () => <div />,
}));

vi.mock('./TitleAndDescription', () => ({
  default: () => <div />,
}));

describe('Footer', () => {
  it('does not use the elevated background on non Quran reader routes', () => {
    mockUseRouter.mockReturnValue({ pathname: '/about-us' });

    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');

    expect(footer?.classList.contains(styles.elevatedBackground)).toBe(false);
  });

  it('uses the elevated background on Quran reader routes to match QuranReader surface (#3326)', () => {
    mockUseRouter.mockReturnValue({ pathname: '/[chapterId]' });

    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');

    expect(footer?.classList.contains(styles.elevatedBackground)).toBe(true);
  });

  it.each(['/juz/[juzId]', '/page/[pageId]', '/hizb/[hizbId]', '/[chapterId]/[verseId]'])(
    'uses the elevated background on reader route %s',
    (pathname) => {
      mockUseRouter.mockReturnValue({ pathname });

      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');

      expect(footer?.classList.contains(styles.elevatedBackground)).toBe(true);
    },
  );

  it.each(['/collections/all', '/collections/[collectionId]'])(
    'uses the elevated background on collection route %s to match CollectionDetailContainer surface (#3326)',
    (pathname) => {
      mockUseRouter.mockReturnValue({ pathname });

      const { container } = render(<Footer />);
      const footer = container.querySelector('footer');

      expect(footer?.classList.contains(styles.elevatedBackground)).toBe(true);
    },
  );
});
