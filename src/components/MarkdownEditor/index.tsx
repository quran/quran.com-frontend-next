import React, { useEffect, useState } from 'react';

import { defaultValueCtx, Editor, rootCtx, editorViewOptionsCtx } from '@milkdown/kit/core';
import { commonmark } from '@milkdown/kit/preset/commonmark';
import { replaceAll } from '@milkdown/kit/utils';
import { Milkdown, useEditor } from '@milkdown/react';

import iframePlugin from './plugins/iframe';

import styles from '@/components/MarkdownEditor/MarkdownEditor.module.scss';

type Props = {
  isEditable?: boolean;
  defaultValue?: string;
};

const MarkdownEditor: React.FC<Props> = ({ isEditable = true, defaultValue }) => {
  const [isMounted, setIsMounted] = useState(false);

  const { get } = useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        if (defaultValue) {
          ctx.set(defaultValueCtx, defaultValue);
        }
        // Add attributes to the editor container
        ctx.update(editorViewOptionsCtx, (prev) => ({
          ...prev,
          editable: () => isEditable,
          attributes: { class: styles.editor, spellcheck: 'false' },
        }));
      })
      .use(commonmark)
      .use(iframePlugin);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (defaultValue) {
      get()?.action(replaceAll(defaultValue));
    }
  }, [defaultValue, get]);

  return (
    <div className={styles.content}>
      {!isMounted && defaultValue && <div className={styles.ssrFallback}>{defaultValue}</div>}
      <Milkdown />
    </div>
  );
};

export default MarkdownEditor;
