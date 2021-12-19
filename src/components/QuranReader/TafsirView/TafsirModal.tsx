import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';

import DataFetcher from 'src/components/DataFetcher';
import Modal from 'src/components/dls/Modal/Modal';
import { makeVersesUrl } from 'src/utils/apiPaths';

export const useTafsirModalRoute = () => {
  const router = useRouter();
  const closeModal = () => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          shouldShowTafsirModal: null,
        },
      },
      null,
      {
        scroll: false,
        shallow: true,
      },
    );
  };

  const openModal = ({ chapterId, verseNumber, tafsirId }) => {
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          tafsirId,
          chapterId,
          verseNumber,
          shouldShowTafsirModal: true,
        },
      },
      // eslint-disable-next-line i18next/no-literal-string
      `/${chapterId}/${verseNumber}/tafsirs?tafsirId=${tafsirId}`,
      {
        scroll: false,
        shallow: true,
      },
    );
  };

  const { shouldShowTafsirModal } = router.query;

  return {
    closeModal,
    shouldShowTafsirModal,
    openModal,
    chapterId: router.query.chapterId,
    verseNumber: router.query.verseId,
    tafsirId: router.query.tafsirId, // this be `tafsirIds` (array) later. doing this like for simplicity for now
  };
};

const TafsirModal = () => {
  const { lang } = useTranslation();
  const { closeModal, chapterId, verseNumber, tafsirId } = useTafsirModalRoute();
  const queryKey = makeVersesUrl(chapterId as string, lang, {
    page: verseNumber, // we pass the verse id as a the page and then fetch only 1 verse per page.
    perPage: 1, // only 1 verse per page
    translations: null,
    tafsirs: [tafsirId],
    wordFields: 'location, verse_key, text_uthmani',
    tafsirFields: 'resource_name,language_name',
  });

  return (
    <Modal isOpen onClickOutside={closeModal}>
      <Modal.Body>
        <DataFetcher
          queryKey={queryKey}
          render={(data) => {
            return (
              <div style={{ height: '50vh', overflowY: 'auto' }}>
                {
                  // @ts-ignore
                  data.verses[0].tafsirs.map((tafsir) => (
                    <div dangerouslySetInnerHTML={{ __html: tafsir.text }} />
                  ))
                }
              </div>
            );
            return <div>{JSON.stringify(data)}</div>;
          }}
        />
      </Modal.Body>
    </Modal>
  );
};

export default TafsirModal;
