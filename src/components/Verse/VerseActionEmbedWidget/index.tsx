import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { useDispatch } from 'react-redux';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import CodeIcon from '@/icons/code.svg';
import { updateAyahWidgetOverrides } from '@/redux/slices/ayahWidget';
import { WordVerse } from '@/types/Word';
import { logButtonClick } from '@/utils/eventLogger';

type VerseActionEmbedWidgetProps = {
  verse: WordVerse;
  isTranslationView: boolean;
  onActionTriggered?: () => void;
};

/**
 * Action item to open the Ayah Widget Builder with the current verse.
 *
 * @returns {JSX.Element} PopoverMenu.Item component.
 */
const VerseActionEmbedWidget = ({
  verse,
  isTranslationView,
  onActionTriggered,
}: VerseActionEmbedWidgetProps) => {
  const { t } = useTranslation('quran-reader');
  const router = useRouter();
  const dispatch = useDispatch();

  const onClick = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`${isTranslationView ? 'translation_view' : 'reading_view'}_embed_widget`);

    // Parse verse key (e.g., "2:255" -> surah=2, ayah=255)
    const [surahStr, ayahStr] = verse.verseKey.split(':');
    const surah = Number(surahStr);
    const ayah = Number(ayahStr);

    // Update Redux state with the selected verse
    dispatch(updateAyahWidgetOverrides({ selectedSurah: surah, selectedAyah: ayah }));

    // Navigate to widget builder (Redux will pre-fill the verse)
    router.push('/ayah-widget');

    if (onActionTriggered) {
      onActionTriggered();
    }
  };

  return (
    <PopoverMenu.Item
      icon={
        <IconContainer
          icon={<CodeIcon />}
          color={IconColor.tertiary}
          size={IconSize.Custom}
          shouldFlipOnRTL={false}
        />
      }
      onClick={onClick}
    >
      {t('embed-widget')}
    </PopoverMenu.Item>
  );
};

export default VerseActionEmbedWidget;
