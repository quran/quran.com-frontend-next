/* eslint-disable i18next/no-literal-string */
import { useState } from 'react';

import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';
import { useSelector, shallowEqual } from 'react-redux';

import TafsirIcon from '../../../../public/icons/tafsir.svg';

import styles from './TafsirView.module.scss';

import DataFetcher from 'src/components/DataFetcher';
import EmbeddableContent from 'src/components/dls/EmbeddableContent/EmbeddableContent';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { selectSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import QuranReaderStyles from 'src/redux/types/QuranReaderStyles';
import { makeVersesUrl } from 'src/utils/apiPaths';

const TafsirModal = ({ verse }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const quranReaderStyles = useSelector(selectQuranReaderStyles, shallowEqual) as QuranReaderStyles;
  const { lang, t } = useTranslation();
  const tafsirs = useSelector(selectSelectedTafsirs);
  const queryKey = makeVersesUrl(verse.chapterId as string, lang, {
    page: verse.verseNumber, // we pass the verse id as a the page and then fetch only 1 verse per page.
    perPage: 1, // only 1 verse per page
    translations: null,
    tafsirs: [tafsirs],
    wordFields: 'location, verse_key, text_uthmani',
    tafsirFields: 'resource_name,language_name',
  });

  return (
    <>
      <PopoverMenu.Item
        icon={<TafsirIcon />}
        // shouldCloseMenuAfterClick
        onClick={() => {
          setIsModalOpen(true);

          // It's possible to achieve the same thing with nextjs' router.push,
          // but it will cause the page to be rerendered (not full reload)
          // and since our QuranReader is quite heavy, the UI will be quite janky
          // for example the navbar is expanded for a split second, the closed.
          // with pushState, it does not cause nextjs to re-render the page, which is better for performance
          // and not causing janky UI issues
          // window.history.pushState(
          //   {},
          //   '',
          //   `/${verse.chapterId}/${verse.verseNumber}/tafsirs?tafsirsIds=${tafsirs.join(',')}`,
          // );
        }}
      >
        {t('quran-reader:tafsirs')}
      </PopoverMenu.Item>
      <EmbeddableContent isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <DataFetcher
          queryKey={queryKey}
          render={(data) => {
            // @ts-ignore
            return data?.verses[0].tafsirs?.map((tafsir) => (
              <div
                key={tafsir.id}
                className={classNames(
                  styles.tafsirContainer,
                  styles[`tafsir-font-size-${quranReaderStyles.tafsirFontScale}`],
                )}
                dangerouslySetInnerHTML={{ __html: tafsir.text }}
              />
            ));
            return <div>{JSON.stringify(data)}</div>;
          }}
        />
      </EmbeddableContent>
    </>
  );
};

export default TafsirModal;
