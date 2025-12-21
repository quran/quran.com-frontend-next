import React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import useSaveBookmarkModal from './useSaveBookmarkModal';

import { ReadingBookmarkType } from '@/types/Bookmark';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (k: string) => k, lang: 'en' }),
}));
vi.mock('next/router', () => {
  const push = vi.fn();
  const prefetch = vi.fn();
  return {
    useRouter: () => ({ push, prefetch }),
  };
});
vi.mock('react-redux', () => ({
  useSelector: (sel: any) => sel({ quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 } }),
  shallowEqual: () => null,
}));
vi.mock('@/redux/slices/QuranReader/styles', () => ({
  selectQuranReaderStyles: (s: any) => s.quranReaderStyles,
}));
vi.mock('@/utils/api', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return { ...actual, getMushafId: () => ({ mushaf: 2 }) };
});
vi.mock('./useSaveBookmarkData', () => ({
  useSaveBookmarkData: () => ({
    resourceBookmark: null,
    collectionListData: [],
    bookmarkCollectionIdsData: [],
    currentReadingBookmark: null,
    mutateAllData: vi.fn(),
    mutateResourceBookmark: vi.fn(),
    mutateBookmarkCollectionIdsData: vi.fn(),
  }),
}));
vi.mock('./Collections/hooks/useCollectionsState', () => ({
  useCollectionsState: () => ({ sortedCollections: [] }),
}));
vi.mock('./Collections/hooks/useFavoritesToggle', () => ({
  useFavoritesToggle: () => ({
    handleVerseBookmarkToggle: vi.fn(),
    handlePageBookmarkToggle: vi.fn(),
    handleNewVerseBookmark: vi.fn(),
  }),
}));
vi.mock('./Collections/hooks/useCollectionToggleHandler', () => ({
  useCollectionToggleHandler: () => ({
    handleAddToCollection: vi.fn(),
    handleRemoveFromCollection: vi.fn(),
  }),
}));
vi.mock('@/dls/Toast/Toast', () => ({
  useToast: () => vi.fn(),
  ToastStatus: { Error: 'error', Success: 'success' },
}));
vi.mock('@/utils/auth/login', () => ({ isLoggedIn: () => false }));

const HookProbe: React.FC<{ type: ReadingBookmarkType; verse?: any; page?: number }> = ({
  type,
  verse,
  page,
}) => {
  const { handleGuestSignIn } = useSaveBookmarkModal({
    type,
    verse,
    pageNumber: page,
    onClose: vi.fn(),
  });
  return <button type="button" aria-label="run" onClick={handleGuestSignIn} data-testid="run" />;
};

describe('useSaveBookmarkModal guest sign-in', () => {
  it('pushes login redirect for verse', async () => {
    render(
      <HookProbe type={ReadingBookmarkType.AYAH} verse={{ chapterId: 2, verseNumber: 255 }} />,
    );
    const { useRouter } = await import('next/router');
    const router = useRouter();
    (router.push as any).mockClear();
    screen.getByTestId('run').click();
    expect(router.push).toHaveBeenCalled();
    const arg = (router.push as any).mock.calls.pop()[0] as string;
    expect(arg).toMatch(/\/login\?r=/);
    expect(decodeURIComponent(arg.split('=')[1])).toMatch(/\/2\?startingVerse=255/);
  });

  it('pushes login redirect for page', async () => {
    const { unmount } = render(<HookProbe type={ReadingBookmarkType.PAGE} page={5} />);
    const { useRouter } = await import('next/router');
    const router = useRouter();
    (router.push as any).mockClear();
    const runs = screen.getAllByTestId('run');
    runs[runs.length - 1].click();
    expect(router.push).toHaveBeenCalled();
    const arg = (router.push as any).mock.calls.pop()[0] as string;
    expect(arg).toMatch(/\/login\?r=/);
    expect(decodeURIComponent(arg.split('=')[1])).toMatch(/\/page\/5/);
    unmount();
  });
});
