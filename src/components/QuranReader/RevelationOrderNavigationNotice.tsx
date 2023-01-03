import classNames from 'classnames';
import Trans from 'next-translate/Trans';
import { useDispatch } from 'react-redux';

import styles from './RevelationOrderNavigationNotice.module.scss';

import { setIsReadingByRevelationOrder } from '@/redux/slices/revelationOrder';

export enum RevelationOrderNavigationNoticeView {
  SideDrawer = 'side-drawer',
  EndOfScrollingControls = 'end-of-scrolling-controls',
}

type Props = {
  view?: RevelationOrderNavigationNoticeView;
};

// A notice that lets users know that the ordering and navigation are not the default ones.
const RevelationOrderNavigationNotice = ({ view }: Props) => {
  const dispatch = useDispatch();

  const revertToDefaultOrdering = () => {
    dispatch({ type: setIsReadingByRevelationOrder.type, payload: false });
  };

  return (
    <div
      className={classNames({
        [styles.sideDrawerViewContainer]: view === RevelationOrderNavigationNoticeView.SideDrawer,
        [styles.endOfScrollingViewContainer]:
          view === RevelationOrderNavigationNoticeView.EndOfScrollingControls,
      })}
    >
      <Trans
        components={{
          link: (
            <span className={styles.link} onClick={revertToDefaultOrdering} aria-hidden="true" />
          ),
        }}
        i18nKey="quran-reader:revelation-order-notice"
      />
    </div>
  );
};

export default RevelationOrderNavigationNotice;
