import React from 'react';

import { CmdKey, Editor, editorViewOptionsCtx, rootCtx } from '@milkdown/core';
import { block } from '@milkdown/plugin-block';
import { clipboard } from '@milkdown/plugin-clipboard';
import { cursor } from '@milkdown/plugin-cursor';
import { history } from '@milkdown/plugin-history';
import { indent } from '@milkdown/plugin-indent';
import { commonmark } from '@milkdown/preset-commonmark';
import { Milkdown, useEditor } from '@milkdown/react';
import { callCommand } from '@milkdown/utils';

import styles from './Editor.module.scss';
import MenuBar from './MenuBar';

const NotesEditor = () => {
  const { get } = useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        // Add attributes to the editor container
        ctx.update(editorViewOptionsCtx, (prev) => ({
          ...prev,
          attributes: { class: styles.editor, spellcheck: 'false' },
        }));
      })
      .use(commonmark)
      .use(block)
      .use(clipboard)
      .use(cursor)
      .use(history)
      .use(indent);
  }, []);

  const call = <T, P>(command: CmdKey<T>, payload?: P) => {
    return get()?.action(callCommand(command, payload));
  };

  return (
    <div className={styles.container}>
      <MenuBar call={call} />
      <div className={styles.content}>
        <Milkdown key={123} />
      </div>
    </div>
  );
};

export default NotesEditor;
