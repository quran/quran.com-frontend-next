import React from 'react';

import { defaultValueCtx, Editor, rootCtx, editorViewOptionsCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { Milkdown, useEditor } from '@milkdown/react';

import styles from '@/components/MarkdownEditor/MarkdownEditor.module.scss';

type Props = {
  isEditable?: boolean;
  defaultValue?: string;
};

const MarkdownEditor: React.FC<Props> = ({ isEditable = true, defaultValue }) => {
  useEditor((root) => {
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
      .use(commonmark);
  }, []);

  return (
    <div className={styles.content}>
      <Milkdown />
    </div>
  );
};

export default MarkdownEditor;
