/* eslint-disable max-lines */
import React from 'react';

import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import VerseActionModalContainer from '.';

const mockDispatch = vi.fn();
let mockState: any;
let mockRouter = {
  isReady: true,
  asPath: '/2?startingVerse=255',
  locale: 'en',
};
const mockGetPendingRestore = vi.fn();
const mockConsumePendingRestore = vi.fn();
const mockIsLoggedIn = vi.fn();
const mockGetChapterVerses = vi.fn();

vi.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => selector(mockState),
}));

vi.mock('next/router', () => ({
  useRouter: () => mockRouter,
}));

vi.mock('@/hooks/auth/useBatchedCountRangeNotes', () => ({
  default: () => ({ data: 0 }),
}));

vi.mock('@/api', () => ({
  getChapterVerses: (...args: unknown[]) => mockGetChapterVerses(...args),
}));

vi.mock('@/utils/auth/login', () => ({
  isLoggedIn: () => mockIsLoggedIn(),
}));

vi.mock('@/utils/pendingBookmarkModalRestore', () => ({
  getPendingBookmarkModalRestore: (...args: unknown[]) => mockGetPendingRestore(...args),
  consumePendingBookmarkModalRestore: (...args: unknown[]) => mockConsumePendingRestore(...args),
}));

vi.mock('./AdvancedCopyModal', () => ({ default: () => null }));
vi.mock('./BookmarkModal', () => ({ default: () => null }));
vi.mock('./FeedbackModal', () => ({ default: () => null }));
vi.mock('./NotesModals', () => ({ default: () => null }));
vi.mock('./ReaderBioModal', () => ({ default: () => null }));

const createDefaultState = () => ({
  verseActionModal: {
    isOpen: false,
    modalType: null,
    verseKey: null,
    verse: null,
    editingNote: null,
    isTranslationView: false,
    bookmarksRangeUrl: '',
    wasOpenedFromStudyMode: false,
    studyModeRestoreState: null,
    readerBioReader: null,
    previousModalType: null,
  },
  studyMode: {
    isOpen: false,
    isSsrMode: false,
    verseKey: null,
    activeTab: null,
    highlightedWordLocation: null,
    previousState: null,
    showPinnedSection: false,
  },
});

describe('VerseActionModalContainer bookmark restore', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockGetPendingRestore.mockReset();
    mockConsumePendingRestore.mockReset();
    mockIsLoggedIn.mockReset();
    mockGetChapterVerses.mockReset();
    mockRouter = {
      isReady: true,
      asPath: '/2?startingVerse=255',
      locale: 'en',
    };
    mockState = createDefaultState();
  });

  it('opens bookmark modal from pending restore payload for logged in users', async () => {
    const pendingRestore = {
      verseKey: '2:255',
      verse: {
        chapterId: 2,
        verseNumber: 255,
        verseKey: '2:255',
      },
      redirectUrl: '/2?startingVerse=255',
      createdAt: Date.now(),
    };
    mockIsLoggedIn.mockReturnValue(true);
    mockGetPendingRestore.mockImplementation((path: string) =>
      path === '/2?startingVerse=255' ? pendingRestore : null,
    );
    mockConsumePendingRestore.mockReturnValue(pendingRestore);
    mockGetChapterVerses.mockResolvedValue({
      verses: [
        {
          chapterId: 2,
          verseNumber: 255,
          verseKey: '2:255',
        },
      ],
    });

    render(<VerseActionModalContainer />);

    await waitFor(() => {
      expect(mockGetPendingRestore).toHaveBeenCalledWith('/2?startingVerse=255');
      expect(mockConsumePendingRestore).toHaveBeenCalledWith('/2?startingVerse=255');
      expect(mockGetChapterVerses).toHaveBeenCalledWith('2', 'en', { page: '255', perPage: 1 });
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'verseActionModal/openBookmarkModal',
          payload: expect.objectContaining({
            verseKey: '2:255',
          }),
        }),
      );
    });
  });

  it('does not attempt restore when user is not logged in', async () => {
    mockIsLoggedIn.mockReturnValue(false);

    render(<VerseActionModalContainer />);

    await waitFor(() => {
      expect(mockGetPendingRestore).not.toHaveBeenCalled();
      expect(mockConsumePendingRestore).not.toHaveBeenCalled();
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  it('does not open bookmark modal when route changes before restore resolves', async () => {
    const pendingRestore = {
      verseKey: '2:255',
      verse: {
        chapterId: 2,
        verseNumber: 255,
        verseKey: '2:255',
      },
      redirectUrl: '/2?startingVerse=255',
      createdAt: Date.now(),
    };
    mockIsLoggedIn.mockReturnValue(true);
    mockGetPendingRestore.mockImplementation((path: string) =>
      path === '/2?startingVerse=255' ? pendingRestore : null,
    );

    let resolveRequest: (value: unknown) => void = () => undefined;
    const inFlightRequest = new Promise((resolve) => {
      resolveRequest = resolve;
    });
    mockGetChapterVerses.mockReturnValue(inFlightRequest);

    const { rerender } = render(<VerseActionModalContainer />);

    await waitFor(() => {
      expect(mockGetChapterVerses).toHaveBeenCalledTimes(1);
    });

    mockRouter.asPath = '/3?startingVerse=1';
    rerender(<VerseActionModalContainer />);
    resolveRequest({
      verses: [
        {
          chapterId: 2,
          verseNumber: 255,
          verseKey: '2:255',
        },
      ],
    });
    await inFlightRequest;
    await Promise.resolve();

    expect(mockConsumePendingRestore).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'verseActionModal/openBookmarkModal',
      }),
    );
  });

  it('does not consume pending restore when verse fetch fails', async () => {
    const pendingRestore = {
      verseKey: '2:255',
      verse: {
        chapterId: 2,
        verseNumber: 255,
        verseKey: '2:255',
      },
      redirectUrl: '/2?startingVerse=255',
      createdAt: Date.now(),
    };
    mockIsLoggedIn.mockReturnValue(true);
    mockGetPendingRestore.mockReturnValue(pendingRestore);
    mockGetChapterVerses.mockRejectedValue(new Error('network error'));

    render(<VerseActionModalContainer />);

    await waitFor(() => {
      expect(mockGetChapterVerses).toHaveBeenCalledWith('2', 'en', { page: '255', perPage: 1 });
    });

    expect(mockConsumePendingRestore).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'verseActionModal/openBookmarkModal',
      }),
    );
  });
});
