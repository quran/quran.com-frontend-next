import React from 'react';

import styles from './ReflectionReferences.module.scss';

import ReflectionReferenceIndicator from '@/components/QuranReflect/ReflectionReferenceIndicator';
import VerseAndTranslation from '@/components/Verse/VerseAndTranslation';
import Link from '@/dls/Link/Link';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import Reference from '@/types/QuranReflect/Reference';
import { logButtonClick, logEvent } from '@/utils/eventLogger';
import { isSurahReference } from '@/utils/quranReflect/string';
import Collapsible from 'src/components/dls/Collapsible/Collapsible';

type Props = {
  references: Reference[];
};

/**
 * A component that will be used to display the ranges of a reflection.
 * And also a ranges selector in the future.
 *
 * @param {React.FC<Props>} param
 * @returns {React.ReactElement<any, any>}
 */
const ReflectionReferences: React.FC<Props> = ({ references }: Props) => {
  const onOpenChange = (isCollapseOpen: boolean) => {
    if (isCollapseOpen) {
      logEvent('reflection_reference_collapse_opened');
    } else {
      logEvent('reflection_reference_collapse_closed');
    }
  };

  const onNoteSurahReferenceClicked = () => {
    logButtonClick('reflection_surah_reference');
  };

  return (
    <>
      {references.map((reference) => {
        const { id, chapterId, from, to } = reference;
        const isSurah = isSurahReference(id);
        if (isSurah) {
          return (
            <Link
              key={chapterId}
              className={styles.verseKey}
              href={`/${chapterId}`}
              onClick={onNoteSurahReferenceClicked}
              isNewTab
            >
              <div className={styles.headerContainer}>
                <ReflectionReferenceIndicator reference={reference} />
              </div>
            </Link>
          );
        }
        return (
          <Collapsible
            key={chapterId}
            title={
              <div className={styles.headerContainer}>
                <ReflectionReferenceIndicator reference={reference} />
              </div>
            }
            prefix={<ChevronDownIcon />}
            shouldRotatePrefixOnToggle
            onOpenChange={onOpenChange}
            headerLeftClassName={styles.headerLeftClassName}
          >
            {({ isOpen: isOpenRenderProp }) => {
              if (!isOpenRenderProp) return null;
              return <VerseAndTranslation chapter={chapterId} from={from} to={to} />;
            }}
          </Collapsible>
        );
      })}
    </>
  );
};

export default ReflectionReferences;
