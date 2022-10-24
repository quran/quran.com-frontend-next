/* eslint-disable max-lines */
import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useSelector, shallowEqual } from 'react-redux';

import CollectionSorter from '../CollectionSorter/CollectionSorter';

import styles from './CollectionDetail.module.scss';

import ConfirmationModal from '@/dls/ConfirmationModal/ConfirmationModal';
import { useConfirm } from '@/dls/ConfirmationModal/hooks';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { getChapterWithStartingVerseUrl } from '@/utils/navigation';
import DataFetcher from 'src/components/DataFetcher';
import Button, { ButtonVariant } from 'src/components/dls/Button/Button';
import Collapsible from 'src/components/dls/Collapsible/Collapsible';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import TranslationText from 'src/components/QuranReader/TranslationView/TranslationText';
import VerseTextPreview from 'src/components/QuranReader/VerseTextPreview';
import DataContext from 'src/contexts/DataContext';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import { makeVersesUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { getChapterData } from 'src/utils/chapter';
import { toLocalizedVerseKey } from 'src/utils/locale';
import { makeVerseKey } from 'src/utils/verse';
import { VersesResponse } from 'types/ApiResponses';
import Bookmark from 'types/Bookmark';
import { CollectionDetailSortOption } from 'types/CollectionSortOptions';

type CollectionDetailProps = {
  id: string;
  title: string;
  bookmarks: Bookmark[];
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  onUpdated: () => void;
  onItemDeleted: (bookmarkId: string) => void;
};

const CollectionDetail = ({
  title,
  bookmarks,
  sortBy,
  onSortByChange,
  onItemDeleted,
}: CollectionDetailProps) => {
  const { t, lang } = useTranslation();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { quranFont, mushafLines } = quranReaderStyles;
  const { mushaf } = getMushafId(quranFont, mushafLines);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);

  const router = useRouter();
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
  const sorter = (
    <CollectionSorter selectedOptionId={sortBy} onChange={onSortByChange} options={sortOptions} />
  );

  const onGoToAyahClicked = (verseKey: string) => {
    const verseUrl = getChapterWithStartingVerseUrl(verseKey);
    logButtonClick(
      // eslint-disable-next-line i18next/no-literal-string
      `collection_detail_menu_go_to_verse`,
    );
    router.push(verseUrl);
  };

  const isCollectionEmpty = bookmarks.length === 0;

  const handleDeleteMenuClicked = (bookmark) => async () => {
    logButtonClick('collection_detail_delete_menu');
    const bookmarkName = getBookmarkName(bookmark);

    const isConfirmed = await confirm({
      confirmText: t('collection:delete'),
      cancelText: t('common:cancel'),
      title: t('collection:delete-bookmark.title'),
      subtitle: t('collection:delete-bookmark.subtitle', {
        bookmarkName,
        collectionName: title,
      }),
    });

    if (isConfirmed) {
      onItemDeleted(bookmark.id);
    }
  };

  const handleGoToAyah = (bookmark) => () => {
    logButtonClick('collection_detail_go_to_ayah_menu');
    onGoToAyahClicked(makeVerseKey(bookmark.key, bookmark.verseNumber));
  };

  const getBookmarkName = (bookmark) => {
    const chapterData = getChapterData(chaptersData, bookmark.key.toString());
    const verseKey = makeVerseKey(bookmark.key, bookmark.verseNumber);
    return `${chapterData.transliteratedName} ${toLocalizedVerseKey(verseKey, lang)}`;
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          {sorter}
        </div>
        <div className={styles.collectionItemsContainer}>
          {isCollectionEmpty ? (
            <div className={styles.emptyCollectionContainer}>
              <span>{t('collection:empty')}</span>
              <div className={styles.backToCollectionButtonContainer}>
                <Button href="/profile">{t('collection:back-to-collection-list')}</Button>
              </div>
            </div>
          ) : (
            bookmarks.map((bookmark) => {
              const bookmarkName = getBookmarkName(bookmark);
              return (
                <Collapsible
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
                    >
                      <PopoverMenu.Item onClick={handleDeleteMenuClicked(bookmark)}>
                        {t('collection:delete')}
                      </PopoverMenu.Item>
                      <PopoverMenu.Item onClick={handleGoToAyah(bookmark)}>
                        {t('collection:go-to-ayah')}
                      </PopoverMenu.Item>
                    </PopoverMenu>
                  }
                >
                  {({ isOpen }) => {
                    if (!isOpen) return null;
                    const chapterId = bookmark.key;
                    const params = {
                      words: true,
                      perPage: 1,
                      translations: selectedTranslations.join(','),
                      page: bookmark.verseNumber,
                      ...getDefaultWordFields(quranReaderStyles.quranFont),
                      mushaf,
                    };

                    return (
                      <DataFetcher
                        queryKey={makeVersesUrl(chapterId.toString(), lang, params)}
                        render={(data: VersesResponse) => {
                          if (!data) return null;
                          const firstVerse = data.verses?.[0];
                          return (
                            <div className={styles.verseContainer}>
                              <VerseTextPreview verses={data.verses} />
                              <div>
                                {firstVerse.translations?.map((translation) => {
                                  return (
                                    <TranslationText
                                      key={translation.id}
                                      translationFontScale={quranReaderStyles.translationFontScale}
                                      text={translation.text}
                                      languageId={translation.languageId}
                                      resourceName={translation.resourceName}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }}
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
