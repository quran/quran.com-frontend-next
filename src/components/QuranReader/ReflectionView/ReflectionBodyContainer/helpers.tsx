import classNames from 'classnames';

import styles from './ReflectionBodyContainer.module.scss';

import { Tab } from '@/dls/Tabs/Tabs';
import ChatIcon from '@/icons/chat.svg';
import LearningPlanIcon from '@/icons/learning-plan.svg';
import { logErrorToSentry } from '@/lib/sentry';
import { isLoggedIn } from '@/utils/auth/login';
import { logPostView } from '@/utils/quranReflect/apiPaths';
import ContentType from 'types/QuranReflect/ContentType';

export const getReflectionTabs = (t: (key: string) => string, isModal: boolean): Tab[] => [
  {
    title: (
      <div className={classNames(styles.titleContainer, { [styles.modalTitleContainer]: isModal })}>
        <ChatIcon />
        {t('common:reflections')}
      </div>
    ),
    value: ContentType.REFLECTIONS,
  },
  {
    title: (
      <div className={classNames(styles.titleContainer, { [styles.modalTitleContainer]: isModal })}>
        <LearningPlanIcon />
        {t('common:lessons')}
      </div>
    ),
    value: ContentType.LESSONS,
  },
];

/**
 * Handle when the reflection is viewed by logging the post view.
 * The login status only affects the Sentry transaction name for error tracking.
 */
export const handleReflectionViewed = (reflectionContainer: Element) => {
  const postId = reflectionContainer.getAttribute('data-post-id');

  if (!postId) {
    return;
  }

  logPostView(postId).catch((e) => {
    logErrorToSentry(e, {
      transactionName: isLoggedIn()
        ? 'post_reflection_views_logged_in'
        : 'post_reflection_views_logged_out',
      metadata: {
        postId,
      },
    });
  });
};
