import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';

import ChevronDownIcon from '../../../../public/icons/chevron-down.svg';
import OverflowMenuIcon from '../../../../public/icons/menu_more_horiz.svg';
import CollectionSorter from '../CollectionSorter/CollectionSorter';

import styles from './CollectionDetail.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Button, { ButtonVariant } from 'src/components/dls/Button/Button';
import Collapsible from 'src/components/dls/Collapsible/Collapsible';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import TafsirVerseText from 'src/components/QuranReader/TafsirView/TafsirVerseText';
import TranslationText from 'src/components/QuranReader/TranslationView/TranslationText';
import DataContext from 'src/contexts/DataContext';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import { makeVersesUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { deleteCollectionBookmark } from 'src/utils/auth/api';
import { getChapterData } from 'src/utils/chapter';
import { toLocalizedVerseKey } from 'src/utils/locale';
import { makeVerseKey } from 'src/utils/verse';
import { VersesResponse } from 'types/ApiResponses';
import Bookmark from 'types/Bookmark';

type CollectionDetailProps = {
  id: string;
  title: string;
  bookmarks: Bookmark[];
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  onUpdated: () => void;
};

const CollectionDetail = ({
  id,
  title,
  bookmarks,
  sortBy,
  onSortByChange,
  onUpdated,
}: CollectionDetailProps) => {
  const { t, lang } = useTranslation();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { quranFont, mushafLines } = quranReaderStyles;
  const { mushaf } = getMushafId(quranFont, mushafLines);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);

  const onBookmarkItemDeleted = (bookmarkId: string) => {
    deleteCollectionBookmark(id, bookmarkId).then(() => {
      onUpdated();
    });
  };

  const sortOptions = [
    {
      id: 'recentlyAdded',
      label: t('collection:recently-added'),
    },
    {
      id: 'verseKey',
      label: t('collection:verse-key'),
    },
  ];

  const chaptersData = useContext(DataContext);
  const sorter = (
    <CollectionSorter selectedOptionId={sortBy} onChange={onSortByChange} options={sortOptions} />
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
        {sorter}
      </div>
      <div className={styles.collectionItemsContainer}>
        {bookmarks.map((bookmark) => {
          const chapterData = getChapterData(chaptersData, bookmark.key.toString());
          const verseKey = makeVerseKey(bookmark.key, bookmark.verseNumber);
          const itemTitle = `${chapterData.transliteratedName} ${toLocalizedVerseKey(
            verseKey,
            lang,
          )}`;
          return (
            <Collapsible
              title={itemTitle}
              key={bookmark.id}
              prefix={<ChevronDownIcon />}
              suffix={
                <PopoverMenu
                  trigger={
                    <Button variant={ButtonVariant.Ghost}>
                      <OverflowMenuIcon />
                    </Button>
                  }
                >
                  <PopoverMenu.Item onClick={() => onBookmarkItemDeleted(bookmark.id)}>
                    Delete
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
                        <div>
                          <TafsirVerseText verses={data.verses} />
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
        })}
      </div>
    </div>
  );
};

export default CollectionDetail;
