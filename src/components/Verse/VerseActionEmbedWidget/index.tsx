import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

import IconContainer, { IconColor, IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import CodeIcon from '@/icons/code-embed.svg';
import { logButtonClick } from '@/utils/eventLogger';
import { navigateToExternalUrl } from '@/utils/url';
import Verse from 'types/Verse';

type VerseActionEmbedWidgetProps = {
  verse: Verse;
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
  const { locale } = useRouter();

  const onClick = () => {
    // eslint-disable-next-line i18next/no-literal-string
    logButtonClick(`${isTranslationView ? 'translation_view' : 'reading_view'}_embed_widget`);

    // Parse verse key (e.g., "2:255" -> surah=2, ayah=255)
    const [surahStr, ayahStr] = verse.verseKey.split(':');
    const surah = Number(surahStr);
    const ayah = Number(ayahStr);

    // Open widget builder with the selected verse in a new tab
    const versesParam = `${surah}:${ayah}`;
    const localePrefix = locale === 'en' ? '' : `/${locale}`;
    const url = `${localePrefix}/embed?verses=${encodeURIComponent(versesParam)}`;
    navigateToExternalUrl(url);

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
