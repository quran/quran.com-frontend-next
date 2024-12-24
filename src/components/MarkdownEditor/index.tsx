import React, { useEffect } from 'react';

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
    if (defaultValue) {
      get()?.action(replaceAll(defaultValue));
    }
  }, [defaultValue, get]);

  return (
    <div className={styles.content}>
      <Milkdown />
    </div>
  );
};

export default MarkdownEditor;
