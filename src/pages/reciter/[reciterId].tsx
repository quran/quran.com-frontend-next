/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable i18next/no-literal-string */

import classNames from 'classnames';
import { useDispatch } from 'react-redux';

import PlayIcon from '../../../public/icons/play-arrow.svg';
import layoutStyle from '../index.module.scss';

import pageStyle from './reciterPage.module.scss';

import Button from 'src/components/dls/Button/Button';
import Footer from 'src/components/dls/Footer/Footer';
import { playFrom } from 'src/redux/slices/AudioPlayer/state';
import { getAllChaptersData } from 'src/utils/chapter';

const Reciterpage = () => {
  const allChapterData = getAllChaptersData();
  const dispatch = useDispatch();
  return (
    <div className={classNames(layoutStyle.pageContainer)}>
      <div className={pageStyle.reciterImage} />

      <div className={classNames(layoutStyle.flowItem, pageStyle.headerContainer)}>
        <div className={pageStyle.reciterName}>Mishary Al-Fasy</div>
        <Button>
          <PlayIcon />
        </Button>
      </div>

      <div className={classNames(layoutStyle.flowItem)}>
        <div className={pageStyle.sectionTitle}>Surah List</div>
        <div className={pageStyle.surahListContainer}>
          {Object.entries(allChapterData).map(([chapterId, chapterData]) => (
            <div
              key={chapterId}
              className={pageStyle.chapterListItem}
              onClick={() => {
                dispatch(
                  playFrom({
                    chapterId: Number(chapterId),
                    reciterId: 4,
                    timestamp: 0,
                  }),
                );
              }}
            >
              <div className={pageStyle.chapterId}>{chapterId}</div>
              <div className={pageStyle.chapterName}>{chapterData.transliteratedName}</div>
            </div>
          ))}
          <div />
        </div>
      </div>

      <div className={classNames(layoutStyle.flowItem, pageStyle.footerContainer)}>
        <Footer />
      </div>
    </div>
  );
};

export default Reciterpage;
