import React from 'react';

import { Editor, BubbleMenu as TipTapBubbleMenu } from '@tiptap/react';

import styles from './BubbleMenu.module.scss';
import BubbleMenuItem from './BubbleMenuItem';

type Props = {
  editor: Editor;
};

const TIPPY_OPTIONS = { duration: 100 };

const BubbleMenu: React.FC<Props> = ({ editor }) => {
  const onBoldClicked = () => editor.chain().focus().toggleBold().run();
  const onItalicClicked = () => editor.chain().focus().toggleItalic().run();
  const onStrikeClicked = () => editor.chain().focus().toggleStrike().run();

  return (
    <TipTapBubbleMenu className={styles.bubbleMenu} tippyOptions={TIPPY_OPTIONS} editor={editor}>
      <BubbleMenuItem isActive={editor.isActive('bold')} text="Bold" onClick={onBoldClicked} />
      <BubbleMenuItem
        isActive={editor.isActive('italic')}
        text="Italic"
        onClick={onItalicClicked}
      />
      <BubbleMenuItem
        isActive={editor.isActive('strike')}
        text="Strike"
        onClick={onStrikeClicked}
      />
    </TipTapBubbleMenu>
  );
};

export default BubbleMenu;
