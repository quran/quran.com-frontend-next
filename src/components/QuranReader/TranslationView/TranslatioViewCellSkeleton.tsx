import classNames from 'classnames';
import { useSelector, shallowEqual } from 'react-redux';

import cellStyles from './TranslationViewCell.module.scss';
import skeletonStyles from './TranslationViewSkeleton.module.scss';

import Button, { ButtonSize } from 'src/components/dls/Button/Button';
import Skeleton from 'src/components/dls/Skeleton/Skeleton';
import verseTextStyles from 'src/components/Verse/VerseText.module.scss';
import useGetQueryParamOrReduxValue from 'src/hooks/useGetQueryParamOrReduxValue';
import { selectQuranReaderStyles } from 'src/redux/slices/QuranReader/styles';
import { getFontClassName } from 'src/utils/fontFaceHelper';
import QueryParam from 'types/QueryParam';
import { QuranFont } from 'types/QuranReader';

const TRANSLATION_TEXT_SAMPLE =
  'He has revealed to you ˹O Prophet˺ the Book in truth, confirming what came before it, as He revealed the Torah and the Gospel';
const TRANSLATION_AUTHOR_SAMPLE = '— Dr. Mustafa Khattab, the Clear Quran';
const VERSE_KEY_SAMPLE = '1:12';

interface Props {
  hasActionMenuItems?: boolean;
}

const TranslationViewCellSkeleton: React.FC<Props> = ({ hasActionMenuItems = true }) => {
  const { value: selectedTranslations }: { value: number[] } = useGetQueryParamOrReduxValue(
    QueryParam.Translations,
  );
  const { quranFont, quranTextFontScale, translationFontScale, mushafLines } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  );

  const isTajweedFont = quranFont === QuranFont.Tajweed;

  return (
    <div className={classNames(cellStyles.cellContainer, skeletonStyles.cellContainer)}>
      <div className={cellStyles.actionContainer}>
        <Skeleton className={cellStyles.actionContainerLeft}>
          <Button size={ButtonSize.Small}>{VERSE_KEY_SAMPLE}</Button>
        </Skeleton>
        {hasActionMenuItems && (
          <div className={cellStyles.actionContainerRight}>
            <Skeleton className={cellStyles.actionItem}>
              <Button size={ButtonSize.Small} />
            </Skeleton>
            <Skeleton className={cellStyles.actionItem}>
              <Button size={ButtonSize.Small} />
            </Skeleton>
            <Skeleton className={cellStyles.actionItem}>
              <Button size={ButtonSize.Small} />
            </Skeleton>
            <Skeleton className={cellStyles.actionItem}>
              <Button size={ButtonSize.Small} />
            </Skeleton>
          </div>
        )}
      </div>

      {/* We're not using VersePreview as Skeleton's children here 
      because it has layout shift problem when loading the font. Which is not ideal for skeleton */}
      <Skeleton
        className={classNames(skeletonStyles.verseContainer, {
          [verseTextStyles[getFontClassName(quranFont, quranTextFontScale, mushafLines)]]:
            !isTajweedFont,
        })}
      />
      <div className={classNames(skeletonStyles[`translation-font-size-${translationFontScale}`])}>
        {selectedTranslations.map((translation) => (
          <span key={translation}>
            <div>
              <Skeleton className={classNames(skeletonStyles.translationText)}>
                {TRANSLATION_TEXT_SAMPLE}
              </Skeleton>
            </div>
            <div>
              <Skeleton className={classNames(skeletonStyles.translationAuthor)}>
                {TRANSLATION_AUTHOR_SAMPLE}
              </Skeleton>
            </div>
          </span>
        ))}
      </div>
    </div>
  );
};

export default TranslationViewCellSkeleton;
