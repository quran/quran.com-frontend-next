import { useContext } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';

import ChevronDownIcon from '../../../../public/icons/chevron-down.svg';
import OverflowMenuIcon from '../../../../public/icons/menu_more_horiz.svg';
import CollectionSorter from '../CollectionSorter/CollectionSorter';

import styles from './CollectionDetail.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import Collapsible from 'src/components/dls/Collapsible/Collapsible';
import TafsirVerseText from 'src/components/QuranReader/TafsirView/TafsirVerseText';
import TranslationText from 'src/components/QuranReader/TranslationView/TranslationText';
import DataContext from 'src/contexts/DataContext';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTranslations } from 'src/redux/slices/QuranReader/translations';
import { getDefaultWordFields, getMushafId } from 'src/utils/api';
import { makeVersesUrl } from 'src/utils/apiPaths';
import { areArraysEqual } from 'src/utils/array';
import { getChapterData } from 'src/utils/chapter';
import { toLocalizedVerseKey } from 'src/utils/locale';
import { makeVerseKey } from 'src/utils/verse';

type CollectionItem = {
  createdAt: string;
  group: string;
  id: string;
  key: number;
  type: string;
  verseNumber: number;
};

type CollectionDetailProps = {
  title: string;
  collectionItems: CollectionItem[];
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
};

const CollectionDetail = ({
  title,
  collectionItems,
  sortBy,
  onSortByChange,
}: CollectionDetailProps) => {
  const { t, lang } = useTranslation();
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual);
  const { quranFont, mushafLines } = quranReaderStyles;
  const { mushaf } = getMushafId(quranFont, mushafLines);
  const selectedTranslations = useSelector(selectSelectedTranslations, areArraysEqual);

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
        {collectionItems.map((item) => {
          const chapterData = getChapterData(chaptersData, item.key.toString());
          const verseKey = makeVerseKey(item.key, item.verseNumber);
          const itemTitle = `${chapterData.transliteratedName} ${toLocalizedVerseKey(
            verseKey,
            lang,
          )}`;
          return (
            <Collapsible
              title={itemTitle}
              key={item.id}
              prefix={<ChevronDownIcon />}
              suffix={<OverflowMenuIcon />}
            >
              {({ isOpen }) => {
                if (!isOpen) return null;
                const chapterId = item.key;
                const params = {
                  words: true,
                  // translation_fields: resource_name,language_id
                  perPage: 1,
                  // fields: text_uthmani,chapter_id,hizb_number,text_imlaei_simple
                  translations: selectedTranslations.join(','),
                  // reciter: 7
                  // word_translation_language: en
                  page: item.verseNumber,
                  ...getDefaultWordFields(quranReaderStyles.quranFont),
                  mushaf,
                };

                return (
                  <DataFetcher
                    queryKey={makeVersesUrl(chapterId.toString(), lang, params)}
                    render={(data) => {
                      const firstVerse = data.verses?.[0];
                      return (
                        <div>
                          <TafsirVerseText verses={data.verses} />
                          <div>
                            {firstVerse.translations.map((translation) => {
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
