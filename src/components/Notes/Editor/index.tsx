import React from 'react';

import { CmdKey, defaultValueCtx, Editor, editorViewOptionsCtx, rootCtx } from '@milkdown/core';
import { block } from '@milkdown/plugin-block';
import { clipboard } from '@milkdown/plugin-clipboard';
import { cursor } from '@milkdown/plugin-cursor';
import { history } from '@milkdown/plugin-history';
import { indent } from '@milkdown/plugin-indent';
import { commonmark } from '@milkdown/preset-commonmark';
import { Milkdown, useEditor } from '@milkdown/react';
import { callCommand } from '@milkdown/utils';

import Menu from './Menu';
import styles from './NotesEditor.module.scss';

const markdown = `# Milkdown

> Milkdown is a WYSIWYG markdown editor framework.
>
> 🍼 Here is the [repo](https://github.com/Milkdown/milkdown) (right click to open link). \
> We ~~only support commonmark~~. GFM is also supported!

You can check the output markdown text in **two columns editing**.

* Features
  * [x] 📝 **WYSIWYG Markdown** - Write markdown in an elegant way
  * [x] 🎨 **Themable** - Theme can be shared and used with npm packages
  * [x] 🎮 **Hackable** - Support your awesome idea by plugin
  * [x] 🦾 **Reliable** - Built on top of [prosemirror](https://prosemirror.net/) and [remark](https://github.com/remarkjs/remark)
  * [x] ⚡ **Slash & Tooltip** - Write fast for everyone, driven by plugin
  * [x] 🧮 **Math** - LaTeX math equations support, driven by plugin
  * [x] 📊 **Table** - Table support with fluent ui, driven by plugin
  * [x] 📰 **Diagram** - Diagram support with [mermaid](https://mermaid-js.github.io/mermaid/#/), driven by plugin
  * [x] 🍻 **Collaborate** - Shared editing support with [yjs](https://docs.yjs.dev/), driven by plugin
  * [x] 💾 **Clipboard** - Support copy and paste markdown, driven by plugin
  * [x] 👍 **Emoji** - Support emoji shortcut and picker, driven by plugin
* Made by
  * Programmer: [Mirone](https://github.com/Milkdown)
  * Designer: [Mirone](https://github.com/Milkdown)

***`;

const NotesEditor = () => {
  const editorInfo = useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, markdown);
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
    return editorInfo?.get()?.action(callCommand(command, payload));
  };

  return (
    <div className={styles.container}>
      <Menu call={call} />
      <div className={styles.content}>
        <Milkdown />
      </div>
    </div>
  );
};

export default NotesEditor;
