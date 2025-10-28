import styles from './ReflectionBodyContainer.module.scss';

import { Tab } from '@/dls/Tabs/Tabs';
import ChatIcon from '@/icons/chat.svg';
import LearningPlanIcon from '@/icons/learning-plan.svg';
import { logErrorToSentry } from '@/lib/sentry';
import { isLoggedIn } from '@/utils/auth/login';
import { logPostView } from '@/utils/quranReflect/apiPaths';
import ContentType from 'types/QuranReflect/ContentType';

export const getReflectionTabs = (t: (key: string) => string): Tab[] => [
  {
    title: (
      <div className={styles.titleContainer}>
        <ChatIcon className={styles.icon} />
        {t('common:reflections')}
      </div>
    ),
    value: ContentType.REFLECTIONS,
  },
  {
    title: (
      <div className={styles.titleContainer}>
        <LearningPlanIcon className={styles.icon} />
        {t('common:lessons')}
      </div>
    ),
    value: ContentType.LESSONS,
  },
];

/**
 * Handle when the reflection is viewed:
 *
 * 1. If the user is logged in, we will call QDC's backend API.
 * 2. Otherwise, we will call QR's API directly.
 */
export const handleReflectionViewed = (reflectionContainer: Element) => {
  const postId = reflectionContainer.getAttribute('data-post-id');
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
