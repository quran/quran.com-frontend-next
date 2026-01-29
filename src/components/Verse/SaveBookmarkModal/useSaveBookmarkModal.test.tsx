import React from 'react';

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import useSaveBookmarkModal from './useSaveBookmarkModal';

import { ReadingBookmarkType } from '@/types/Bookmark';

vi.mock('@/dls/Toast/Toast', () => ({
  useToast: () => vi.fn(),
  ToastStatus: { Error: 'error', Success: 'success' },
}));
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
// Mock dispatch function
const mockDispatch = vi.fn();

vi.mock('react-redux', () => ({
  useSelector: (sel: any) => sel({ quranReaderStyles: { quranFont: 'hafs', mushafLines: 15 } }),
  useDispatch: () => mockDispatch,
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
vi.mock('./Collections/hooks/useCollectionToggle', () => ({
  useCollectionToggle: () => ({
    handleToggleCollection: vi.fn(),
    handleToggleFavorites: vi.fn(),
  }),
}));
vi.mock('@/dls/Toast/Toast', () => ({
  useToast: () => vi.fn(),
  ToastStatus: { Error: 'error', Success: 'success' },
}));
vi.mock('@/utils/auth/login', () => ({ isLoggedIn: () => false }));

const HookProbe: React.FC<{
  type: ReadingBookmarkType;
  verse?: any;
  page?: number;
  onTestHook?: (hooks: ReturnType<typeof useSaveBookmarkModal>) => void;
}> = ({ type, verse, page, onTestHook }) => {
  const hooks = useSaveBookmarkModal({
    type,
    verse,
    pageNumber: page,
    onClose: vi.fn(),
  });
  if (onTestHook) onTestHook(hooks);
  return (
    <button type="button" aria-label="run" onClick={hooks.handleGuestSignIn} data-testid="run" />
  );
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

describe('useSaveBookmarkModal take note', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('dispatches openNotesModal action with correct payload for verse', () => {
    let capturedHooks: ReturnType<typeof useSaveBookmarkModal> | null = null;
    const verseKey = '2:255';

    render(
      <HookProbe
        type={ReadingBookmarkType.AYAH}
        verse={{ chapterId: 2, verseNumber: 255 }}
        onTestHook={(hooks) => {
          capturedHooks = hooks;
        }}
      />,
    );

    // Call handleTakeNote
    capturedHooks?.handleTakeNote();

    // Verify dispatch was called with openNotesModal action
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    const dispatchedAction = mockDispatch.mock.calls[0][0];

    expect(dispatchedAction.type).toBe('verseActionModal/openNotesModal');
    expect(dispatchedAction.payload).toEqual({
      modalType: 'addNote',
      verseKey,
      previousModalType: 'saveBookmark',
    });
  });

  it('includes verseKey in payload when taking note', () => {
    let capturedHooks: ReturnType<typeof useSaveBookmarkModal> | null = null;
    const verse = { chapterId: 3, verseNumber: 15 };

    render(
      <HookProbe
        type={ReadingBookmarkType.AYAH}
        verse={verse}
        onTestHook={(hooks) => {
          capturedHooks = hooks;
        }}
      />,
    );

    capturedHooks?.handleTakeNote();

    const dispatchedAction = mockDispatch.mock.calls[0][0];
    expect(dispatchedAction.payload.verseKey).toBe('3:15');
    expect(dispatchedAction.payload.modalType).toBe('addNote');
    expect(dispatchedAction.payload.previousModalType).toBe('saveBookmark');
  });
});
