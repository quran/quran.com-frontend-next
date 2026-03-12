/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useState } from 'react';

import classNames from 'classnames';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch, useSelector } from 'react-redux';
import { useSWRConfig } from 'swr';

import styles from './EbookBanner.module.scss';

import { StudyModeTabId } from '@/components/QuranReader/ReadingView/StudyModeModal/StudyModeBottomActions';
import Button, { ButtonShape, ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import { ToastStatus, useToast } from '@/dls/Toast/Toast';
import useAuthData from '@/hooks/auth/useAuthData';
import useIsLoggedIn from '@/hooks/auth/useIsLoggedIn';
import CloseIcon from '@/icons/close.svg';
import {
  selectIsHomepageEbookBannerVisible,
  selectIsLessonsEbookBannerVisible,
  selectIsReflectionsEbookBannerVisible,
  setIsHomepageEbookBannerVisible,
  setIsLessonsEbookBannerVisible,
  setIsReflectionsEbookBannerVisible,
} from '@/redux/slices/ebookBanner';
import { setAfterOnboardingRedirect } from '@/redux/slices/onboarding';
import {
  selectStudyModeActiveTab,
  selectStudyModeVerseKey,
} from '@/redux/slices/QuranReader/studyMode';
import ConsentType from '@/types/auth/ConsentType';
import { updateUserConsent } from '@/utils/auth/api';
import { makeUserProfileUrl } from '@/utils/auth/apiPaths';
import EventName, { getEventName } from '@/utils/event-names';
import { logButtonClick } from '@/utils/eventLogger';
import { getLoginNavigationUrl, getEbookBannerNavigationUrl } from '@/utils/navigation';
import UserProfile from 'types/auth/UserProfile';

const EBOOK_CONSENT_QUERY_PARAM = 'ebookConsent';
const EBOOK_CONTEXT_QUERY_PARAM = 'ebookContext';
const STUDY_MODE_VERSE_KEY_QUERY_PARAM = 'studyModeVerseKey';
const STUDY_MODE_TAB_QUERY_PARAM = 'studyModeTab';

const updateEbookConsent = async (
  setIsLoading: (v: boolean) => void,
  signUpReason: string | null,
  toast: ReturnType<typeof useToast>,
  t: ReturnType<typeof useTranslation>['t'],
  onSuccess?: () => void,
) => {
  setIsLoading(true);
  try {
    await updateUserConsent({ consentType: ConsentType.EBOOK, consented: true });
    if (signUpReason) {
      await updateUserConsent({ consentType: ConsentType.SIGNUP_REASON, consented: signUpReason });
    }
    onSuccess?.();
  } catch {
    toast(t('common:error.general'), {
      status: ToastStatus.Error,
    });
  } finally {
    setIsLoading(false);
  }
};

export enum EbookBannerContext {
  HOMEPAGE = 'homepage',
  REFLECTIONS = 'reflections',
  LESSONS = 'lessons',
}

const CONTEXT_STUDY_MODE_TAB: Partial<Record<EbookBannerContext, StudyModeTabId>> = {
  [EbookBannerContext.REFLECTIONS]: StudyModeTabId.REFLECTIONS,
  [EbookBannerContext.LESSONS]: StudyModeTabId.LESSONS,
};

const CONTEXT_SIGNUP_REASON: Record<EbookBannerContext, string | null> = {
  [EbookBannerContext.HOMEPAGE]: 'ebook_homepage',
  [EbookBannerContext.REFLECTIONS]: 'ebook_reflections',
  [EbookBannerContext.LESSONS]: 'ebook_lessons',
};

interface EbookBannerProps {
  isDismissible?: boolean;
  disableMobile?: boolean;
  disableDesktop?: boolean;
  context?: EbookBannerContext;
  floating?: boolean;
  containerClassName?: string;
  descriptionClassName?: string;
  titleClassName?: string;
  ctaClassName?: string;
}

const CONTEXT_CONFIG = {
  [EbookBannerContext.HOMEPAGE]: {
    selector: selectIsHomepageEbookBannerVisible,
    action: setIsHomepageEbookBannerVisible,
    analyticsSource: EventName.HOMEPAGE_EBOOK_BANNER,
  },
  [EbookBannerContext.REFLECTIONS]: {
    selector: selectIsReflectionsEbookBannerVisible,
    action: setIsReflectionsEbookBannerVisible,
    analyticsSource: EventName.QURAN_READER_STUDY_MODE_REFLECTIONS_EBOOK_BANNER,
  },
  [EbookBannerContext.LESSONS]: {
    selector: selectIsLessonsEbookBannerVisible,
    action: setIsLessonsEbookBannerVisible,
    analyticsSource: EventName.QURAN_READER_STUDY_MODE_LESSONS_EBOOK_BANNER,
  },
};

const HIDE_DATE = new Date('2026-03-20');

/* eslint-disable max-lines */
const EbookBanner = ({
  isDismissible = true,
  context = EbookBannerContext.REFLECTIONS,
  floating = false,
  containerClassName,
  titleClassName,
  descriptionClassName,
  ctaClassName,
  disableMobile = false,
  disableDesktop = false,
}: EbookBannerProps) => {
  const { isLoggedIn } = useIsLoggedIn();
  const { t } = useTranslation('common');
  const toast = useToast();
  const dispatch = useDispatch();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const { userData } = useAuthData();

  const studyModeVerseKey = useSelector(selectStudyModeVerseKey);
  const studyModeActiveTab = useSelector(selectStudyModeActiveTab);

  const { selector, action, analyticsSource } = CONTEXT_CONFIG[context];
  const isDismissed = useSelector(selector) === false;
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const onSuccess = useCallback(() => {
    setIsSubscribed(true);
    setTimeout(async () => {
      setIsSubscribed(false);
      dispatch(action(false));

      await mutate(
        makeUserProfileUrl(),
        (currentProfileData: UserProfile) => ({
          ...currentProfileData,
          consents: { ...currentProfileData?.consents, [ConsentType.EBOOK]: true },
        }),
        { revalidate: false },
      );
    }, 5000);
  }, [dispatch, action, mutate]);

  const onCloseClicked = () => {
    logButtonClick(
      getEventName({
        eventName: analyticsSource,
        suffix: 'dismissed',
      }),
    );
    dispatch(action(false));
  };

  const onSignUpClicked = () => {
    logButtonClick(
      getEventName({
        eventName: analyticsSource,
        suffix: 'signup',
      }),
    );

    if (isLoggedIn) {
      updateEbookConsent(setIsLoading, null, toast, t, onSuccess);
    } else {
      const currentUrl = getEbookBannerNavigationUrl(
        router.asPath,
        context,
        window.location.origin,
        studyModeVerseKey,
        studyModeActiveTab ?? CONTEXT_STUDY_MODE_TAB[context] ?? null,
      );
      dispatch(setAfterOnboardingRedirect(currentUrl));

      router.push(getLoginNavigationUrl(currentUrl));
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    const hasQueryParams = router.query[EBOOK_CONSENT_QUERY_PARAM] === 'true';
    if (!hasQueryParams) return;

    const intentContext = router.query[EBOOK_CONTEXT_QUERY_PARAM] as string | undefined;
    const isSignupSource = router.query.source === 'signup';

    const reason =
      isSignupSource && intentContext
        ? CONTEXT_SIGNUP_REASON[intentContext as EbookBannerContext] ?? null
        : null;

    updateEbookConsent(setIsLoading, reason, toast, t, onSuccess);

    const {
      [EBOOK_CONSENT_QUERY_PARAM]: _a,
      [EBOOK_CONTEXT_QUERY_PARAM]: _b,
      [STUDY_MODE_VERSE_KEY_QUERY_PARAM]: _d,
      [STUDY_MODE_TAB_QUERY_PARAM]: _e,
      source: _c,
      ...rest
    } = router.query;
    router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
  }, [router, mutate, isLoggedIn, toast, t, onSuccess]);

  if (!isLoading && isLoggedIn && userData?.consents?.ebook === true && !isSubscribed) {
    return null;
  }

  const isPastHideDate = Date.now() >= HIDE_DATE.getTime();

  if (isPastHideDate || (isDismissible && isDismissed)) {
    return null;
  }

  return (
    <div
      className={classNames(styles.ebookBanner, containerClassName, {
        [styles.ebookBannerFloating]: floating,
        [styles.ebookBannerBlock]: !floating,
        [styles.disableMobile]: disableMobile,
        [styles.disableDesktop]: disableDesktop,
      })}
    >
      <div className={styles.ebookBannerContent}>
        <p className={classNames(styles.ebookBannerTitle, titleClassName)}>{t('ebook.title')}</p>
        <ul className={classNames(styles.ebookBannerDescription, descriptionClassName)}>
          <li>{t('ebook.descriptions.line1')}</li>
          <li>{t('ebook.descriptions.line2')}</li>
        </ul>
        <div className={styles.ebookBannerCtaContainer}>
          <Button
            className={classNames(styles.ebookBannerCta, ctaClassName)}
            shape={ButtonShape.Rounded}
            onClick={onSignUpClicked}
            isLoading={isLoading}
            isDisabled={isLoading || isSubscribed}
          >
            {(() => {
              if (isSubscribed) return t('ebook.cta.subscribed');
              if (isLoggedIn) return t('ebook.cta.subscribe');
              return t('ebook.cta.sign-up');
            })()}
          </Button>
        </div>
      </div>

      {isDismissible && (
        <Button
          onClick={onCloseClicked}
          aria-label={t('close')}
          className={styles.closeButton}
          variant={ButtonVariant.Compact}
          size={ButtonSize.Small}
          shape={ButtonShape.Circle}
        >
          <CloseIcon />
        </Button>
      )}
    </div>
  );
};

export default EbookBanner;
