import React from 'react';

import { MilkdownProvider } from '@milkdown/react';
import Trans from 'next-translate/Trans';

import styles from './WeeklyVerses.module.scss';

import MarkdownEditor from '@/components/MarkdownEditor';

type Props = {
  description: string;
};

const ReflectionPrompts: React.FC<Props> = ({ description }) => {
  if (!description) {
    return null;
  }

  return (
    <>
      <h3 className={styles.promptsTitle}>
        <Trans
          i18nKey="quranic-calendar:reflection-prompts"
          components={{
            span: <span className={styles.promptsTitleSpan} />,
          }}
        />
      </h3>
      <MilkdownProvider>
        <MarkdownEditor isEditable={false} defaultValue={description} />
      </MilkdownProvider>
    </>
  );
};

export default ReflectionPrompts;
