import classNames from 'classnames';
import Trans from 'next-translate/Trans';

import styles from './RevelationOrderNavigationNotice.module.scss';

import Spinner from '@/dls/Spinner/Spinner';
import usePersistPreferenceGroup from '@/hooks/auth/usePersistPreferenceGroup';
import { setIsReadingByRevelationOrder } from '@/redux/slices/revelationOrder';
import PreferenceGroup from '@/types/auth/PreferenceGroup';
import { logButtonClick } from '@/utils/eventLogger';

export enum RevelationOrderNavigationNoticeView {
  SideDrawer = 'side-drawer',
  EndOfScrollingControls = 'end-of-scrolling-controls',
}

type Props = {
  view?: RevelationOrderNavigationNoticeView;
};

// A notice that lets users know that the ordering and navigation are not the default ones.
const RevelationOrderNavigationNotice = ({ view }: Props) => {
  const {
    actions: { onSettingsChange },
    isLoading,
  } = usePersistPreferenceGroup();

  const revertToDefaultOrdering = () => {
    onSettingsChange(
      'isReadingByRevelationOrder',
      false,
      setIsReadingByRevelationOrder(false),
      setIsReadingByRevelationOrder(true),
      PreferenceGroup.READING,
    );
    logButtonClick(`revert_to_default_ordering_${view}`);
  };

  return (
    <div
      className={classNames({
        [styles.sideDrawerViewContainer]: view === RevelationOrderNavigationNoticeView.SideDrawer,
        [styles.endOfScrollingViewContainer]:
          view === RevelationOrderNavigationNoticeView.EndOfScrollingControls,
      })}
    >
      {isLoading && <Spinner />}
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
