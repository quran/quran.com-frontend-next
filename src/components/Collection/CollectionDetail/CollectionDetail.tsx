/* eslint-disable max-lines */
import { useContext, useState } from 'react';

import useTranslation from 'next-translate/useTranslation';

import CollectionSorter from '../CollectionSorter/CollectionSorter';

import styles from './CollectionDetail.module.scss';

import EmbeddableVerseCell from '@/components/QuranReader/TranslationView/EmbeddableVerseCell';
import ConfirmationModal from '@/dls/ConfirmationModal/ConfirmationModal';
import { useConfirm } from '@/dls/ConfirmationModal/hooks';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import { getChapterData } from '@/utils/chapter';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { toLocalizedVerseKey } from '@/utils/locale';
import { getVerseNavigationUrlByVerseKey } from '@/utils/navigation';
import { navigateToExternalUrl } from '@/utils/url';
import { makeVerseKey } from '@/utils/verse';
import Button, { ButtonVariant } from 'src/components/dls/Button/Button';
import Collapsible from 'src/components/dls/Collapsible/Collapsible';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import DataContext from 'src/contexts/DataContext';
import Bookmark from 'types/Bookmark';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

type CollectionDetailProps = {
  id: string;
  title: string;
  isOwner: boolean;
  bookmarks: Bookmark[];
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  onItemDeleted: (bookmarkId: string) => void;
};

const CollectionDetail = ({
  id,
  title,
  bookmarks,
  sortBy,
  onSortByChange,
  onItemDeleted,
  isOwner,
}: CollectionDetailProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, lang } = useTranslation();
  const confirm = useConfirm();

  const sortOptions = [
    {
      id: CollectionDetailSortOption.RecentlyAdded,
      label: t('collection:recently-added'),
    },
    {
      id: CollectionDetailSortOption.VerseKey,
      label: t('collection:verse-key'),
    },
  ];

  const chaptersData = useContext(DataContext);

  const isCollectionEmpty = bookmarks.length === 0;

  const handleDeleteMenuClicked = (bookmark: Bookmark) => async () => {
    logButtonClick('collection_detail_delete_menu');
    const bookmarkName = getBookmarkName(bookmark);

    const isConfirmed = await confirm({
      confirmText: t('common:delete'),
      cancelText: t('common:cancel'),
      title: t('collection:delete-bookmark.title'),
      subtitle: t('collection:delete-bookmark.subtitle', {
        bookmarkName,
        collectionName: title,
      }),
    });

    const eventData = {
      verseKey: makeVerseKey(bookmark.key, bookmark.verseNumber),
      collectionId: id,
    };
    if (isConfirmed) {
      logButtonClick('bookmark_delete_confirm', eventData);
      onItemDeleted(bookmark.id);
    } else {
      logButtonClick('bookmark_delete_confirm_cancel', eventData);
    }
  };

  const handleGoToAyah = (bookmark: Bookmark) => () => {
    const verseKey = makeVerseKey(bookmark.key, bookmark.verseNumber);
    logButtonClick('collection_detail_go_to_ayah_menu', {
      verseKey: makeVerseKey(bookmark.key, bookmark.verseNumber),
      collectionId: id,
    });
    navigateToExternalUrl(getVerseNavigationUrlByVerseKey(verseKey));
  };

  const getBookmarkName = (bookmark) => {
    const chapterData = getChapterData(chaptersData, bookmark.key.toString());
    const verseKey = makeVerseKey(bookmark.key, bookmark.verseNumber);
    return `${chapterData.transliteratedName} ${toLocalizedVerseKey(verseKey, lang)}`;
  };

  const onToggleAllClicked = () => {
    setIsOpen((currentIsOpen) => {
      if (currentIsOpen) {
        logButtonClick('collection_collapse_all', { collectionId: id });
      } else {
        logButtonClick('collection_expand_all', { collectionId: id });
      }
      return !currentIsOpen;
    });
  };

  const onBackToCollectionsClicked = () => {
    logButtonClick('back_to_collections_button', {
      collectionId: id,
    });
  };

  const onBookmarkMenuOpenChange = (isMenuOpen: boolean, bookmark: Bookmark) => {
    const eventData = {
      verseKey: makeVerseKey(bookmark.key, bookmark.verseNumber),
      collectionId: id,
    };
    if (isMenuOpen) {
      logEvent('collection_bookmark_popover_menu_opened', eventData);
    } else {
      logEvent('collection_bookmark_popover_menu_closed', eventData);
    }
  };

  const onCollapseOpenChange = (isCollapseOpen: boolean, verseKey: string) => {
    const eventData = {
      verseKey,
      collectionId: id,
    };
    if (isCollapseOpen) {
      logEvent('collection_bookmark_collapse_opened', eventData);
    } else {
      logEvent('collection_bookmark_collapse_closed', eventData);
    }
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          {isOwner && (
            <CollectionSorter
              selectedOptionId={sortBy}
              onChange={onSortByChange}
              options={sortOptions}
              isSingleCollection
              collectionId={id}
            />
          )}
        </div>
        <Button variant={ButtonVariant.Ghost} onClick={onToggleAllClicked}>
          {isOpen ? t('collection:collapse-all') : t('collection:expand-all')}
        </Button>
        <div className={styles.collectionItemsContainer}>
          {isCollectionEmpty ? (
            <div className={styles.emptyCollectionContainer}>
              <span>{t('collection:empty')}</span>
              <div className={styles.backToCollectionButtonContainer}>
                <Button onClick={onBackToCollectionsClicked} href="/profile">
                  {t('collection:back-to-collection-list')}
                </Button>
              </div>
            </div>
          ) : (
            bookmarks.map((bookmark) => {
              const bookmarkName = getBookmarkName(bookmark);
              return (
                <Collapsible
                  onOpenChange={(isCollapseOpen) =>
                    onCollapseOpenChange(
                      isCollapseOpen,
                      makeVerseKey(bookmark.key, bookmark.verseNumber),
                    )
                  }
                  shouldOpen={isOpen}
                  title={bookmarkName}
                  key={bookmark.id}
                  prefix={<ChevronDownIcon />}
                  shouldRotatePrefixOnToggle
                  suffix={
                    <PopoverMenu
                      trigger={
                        <Button variant={ButtonVariant.Ghost}>
                          <OverflowMenuIcon />
                        </Button>
                      }
                      onOpenChange={(isMenuOpen) => onBookmarkMenuOpenChange(isMenuOpen, bookmark)}
                    >
                      {isOwner && (
                        <PopoverMenu.Item onClick={handleDeleteMenuClicked(bookmark)}>
                          {t('common:delete')}
                        </PopoverMenu.Item>
                      )}
                      <PopoverMenu.Item
                        onClick={handleGoToAyah(bookmark)}
                        shouldCloseMenuAfterClick
                      >
                        {t('collection:go-to-ayah')}
                      </PopoverMenu.Item>
                    </PopoverMenu>
                  }
                >
                  {({ isOpen: isOpenRenderProp }) => {
                    if (!isOpenRenderProp) return null;
                    const chapterId = bookmark.key;
                    return (
                      <EmbeddableVerseCell
                        chapterId={chapterId}
                        verseNumber={bookmark.verseNumber}
                      />
                    );
                  }}
                </Collapsible>
              );
            })
          )}
        </div>
      </div>
      <ConfirmationModal />
    </>
  );
};

export default CollectionDetail;
