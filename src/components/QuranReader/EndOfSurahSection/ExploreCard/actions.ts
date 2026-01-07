import { ModalType } from '@/components/QuranReader/TranslationView/BottomActionsModals';
import BookIcon from '@/icons/book-open.svg';
import ChatIcon from '@/icons/chat.svg';
import LearningPlanIcon from '@/icons/learning-plan.svg';
import LightbulbIcon from '@/icons/lightbulb.svg';
import {
  getVerseAnswersNavigationUrl,
  getVerseLessonNavigationUrl,
  getVerseReflectionNavigationUrl,
  getVerseSelectedTafsirNavigationUrl,
} from '@/utils/navigation';
import { getVerseAndChapterNumbersFromKey } from '@/utils/verse';

export interface ActionButton {
  key: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  namespace?: 'quran-reader' | 'common';
  modalType: ModalType;
  getNavigationUrl: (args: {
    chapterNumber: number;
    verseKey: string;
    selectedTafsirs: string[];
  }) => string;
}

export const buildTafsirUrl = ({
  chapterNumber,
  verseKey,
  selectedTafsirs,
}: {
  chapterNumber: number;
  verseKey: string;
  selectedTafsirs: string[];
}): string => {
  if (!selectedTafsirs?.length) return '';
  const [, verseNumber] = getVerseAndChapterNumbersFromKey(verseKey);
  const tafsirId = selectedTafsirs[0];
  return getVerseSelectedTafsirNavigationUrl(chapterNumber, Number(verseNumber), tafsirId);
};

export const ACTION_BUTTONS: ActionButton[] = [
  {
    key: 'tafsir.title',
    icon: BookIcon,
    namespace: 'common',
    modalType: ModalType.TAFSIR,
    getNavigationUrl: buildTafsirUrl,
  },
  {
    key: 'reflections',
    icon: ChatIcon,
    namespace: 'common',
    modalType: ModalType.REFLECTION,
    getNavigationUrl: ({ verseKey }) => getVerseReflectionNavigationUrl(verseKey),
  },
  {
    key: 'lessons',
    icon: LearningPlanIcon,
    namespace: 'common',
    modalType: ModalType.LESSON,
    getNavigationUrl: ({ verseKey }) => getVerseLessonNavigationUrl(verseKey),
  },
  {
    key: 'answers',
    icon: LightbulbIcon,
    namespace: 'common',
    modalType: ModalType.QUESTIONS,
    getNavigationUrl: ({ verseKey }) => getVerseAnswersNavigationUrl(verseKey),
  },
];
