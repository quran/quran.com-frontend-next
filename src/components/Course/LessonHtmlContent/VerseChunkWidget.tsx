import styles from './LessonHtmlContent.module.scss';

import QuranWidget from '@/components/AyahWidget/QuranWidget';
import HtmlContent from '@/components/RichText/HtmlContent';
import Skeleton from '@/dls/Skeleton/Skeleton';
import useVerseWidgetData from '@/hooks/useVerseWidgetData';
import type { VerseReference } from '@/utils/lessonContentParser';

type Props = {
  reference: VerseReference;
  fallbackHtml: string;
};

const VerseChunkWidget: React.FC<Props> = ({ reference, fallbackHtml }) => {
  const { data, error, isValidating } = useVerseWidgetData(reference);

  if (isValidating && !data) {
    return <Skeleton className={styles.widgetSkeleton} />;
  }

  if (error || !data?.verses?.length) {
    return <HtmlContent html={fallbackHtml} />;
  }

  return <QuranWidget verses={data.verses} options={data.options} />;
};

export default VerseChunkWidget;
