/* eslint-disable i18next/no-literal-string */
import { useState } from 'react';

import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import DataFetcher from 'src/components/DataFetcher';
import Modal from 'src/components/dls/Modal/Modal';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';
import { selectSelectedTafsirs } from 'src/redux/slices/QuranReader/tafsirs';
import { makeVersesUrl } from 'src/utils/apiPaths';

const TafsirModal = ({ verse }) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        icon="aa"
        onClick={() => {
          setIsModalOpen(true);
          router.push(
            router,
            `/${verse.chapterId}/${verse.verseNumber}/tafsirs?tafsirsIds=${tafsirs}`,
            { shallow: true },
          );
        }}
      >
        {t('quran-reader:tafsirs')}
      </PopoverMenu.Item>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClickOutside={() => setIsModalOpen(false)}>
          <Modal.Body>
            <DataFetcher
              queryKey={queryKey}
              render={(data) => {
                console.log(data);
                return (
                  <div style={{ height: '50vh', overflowY: 'auto' }}>
                    {
                      //   JSON.stringify(data.verses[0].tafsirs.map((tafsir) => tafsir.text))
                      // @ts-ignore
                      //   data.verses[0].tafsirs.map((tafsir) => (
                      // <div dangerouslySetInnerHTML={{ __html: tafsir.text }} />
                      //   ))
                    }
                    {
                      // @ts-ignore
                      data?.verses[0].tafsirs.map((tafsir) => (
                        <div dangerouslySetInnerHTML={{ __html: tafsir.text }} />
                      ))
                      // @ts-ignore
                      //   data.verses[0].tafsirs.map((tafsir) => (
                      // <div dangerouslySetInnerHTML={{ __html: tafsir.text }} />
                      //   ))
                    }
                  </div>
                );
                return <div>{JSON.stringify(data)}</div>;
              }}
            />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};

export default TafsirModal;
