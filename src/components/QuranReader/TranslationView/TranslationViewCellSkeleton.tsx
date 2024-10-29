import classNames from 'classnames';
import range from 'lodash/range';
import { useSelector, shallowEqual } from 'react-redux';

import cellStyles from './TranslationViewCell.module.scss';
import skeletonStyles from './TranslationViewSkeleton.module.scss';

import verseTextStyles from '@/components/Verse/VerseText.module.scss';
import Button, { ButtonSize } from '@/dls/Button/Button';
import Skeleton from '@/dls/Skeleton/Skeleton';
import useGetQueryParamOrReduxValue from '@/hooks/useGetQueryParamOrReduxValue';
import { selectQuranReaderStyles } from '@/redux/slices/QuranReader/styles';
import { getFontClassName } from '@/utils/fontFaceHelper';
import QueryParam from 'types/QueryParam';

const TRANSLATION_TEXT_SAMPLE =
  'He has revealed to you ˹O Prophet˺ the Book in truth, confirming what came before it, as He revealed the Torah and the Gospel';
const TRANSLATION_AUTHOR_SAMPLE = '— Dr. Mustafa Khattab, the Clear Quran';

interface Props {
  hasActionMenuItems?: boolean;
}

const TranslationViewCellSkeleton: React.FC<Props> = ({ hasActionMenuItems = true }) => {
  const { value: selectedTranslations }: { value: number[] } = useGetQueryParamOrReduxValue(
    QueryParam.TRANSLATIONS,
  );
  const { quranFont, quranTextFontScale, translationFontScale, mushafLines } = useSelector(
    selectQuranReaderStyles,
    shallowEqual,
  );

  return (
    <div className={classNames(cellStyles.cellContainer, skeletonStyles.cellContainer)}>
      <div className={cellStyles.actionContainer}>
        <div className={cellStyles.actionContainerLeft}>
          {range(0, 4).map((index) => (
            <Skeleton key={index} className={skeletonStyles.actionItem}>
              <Button size={ButtonSize.Small} />
            </Skeleton>
          ))}
        </div>
        {hasActionMenuItems && (
          <div className={cellStyles.actionContainerRight}>
            <Skeleton className={cellStyles.actionItem}>
              <Button size={ButtonSize.Small} />
            </Skeleton>
          </div>
        )}
      </div>

      {/* We're not using VersePreview as Skeleton's children here
      because it has layout shift problem when loading the font. Which is not ideal for skeleton */}
      <div className={cellStyles.contentContainer}>
        <Skeleton
          className={classNames(
            skeletonStyles.verseContainer,
            cellStyles.arabicVerseContainer,
            verseTextStyles[getFontClassName(quranFont, quranTextFontScale, mushafLines)],
          )}
        />
        <div
          className={classNames(
            cellStyles.verseTranslationsContainer,
            skeletonStyles[`translation-font-size-${translationFontScale}`],
          )}
        >
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
    </div>
  );
};

export default TranslationViewCellSkeleton;
