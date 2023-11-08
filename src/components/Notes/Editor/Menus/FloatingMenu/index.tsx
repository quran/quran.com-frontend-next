import React from 'react';

import { Editor, FloatingMenu as TipTapFloatingMenu } from '@tiptap/react';

import styles from './FloatingMenu.module.scss';
import FloatingMenuItem from './FloatingMenuItem';

type Props = {
  editor: Editor;
};

const TIPPY_OPTIONS = { duration: 100 };

const FloatingMenu: React.FC<Props> = ({ editor }) => {
  const onH1Clicked = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
  const onH2Clicked = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const onH3Clicked = () => editor.chain().focus().toggleHeading({ level: 3 }).run();
  const onBulletListClicked = () => editor.chain().focus().toggleBulletList().run();
  return (
    <TipTapFloatingMenu
      className={styles.floatingMenu}
      tippyOptions={TIPPY_OPTIONS}
      editor={editor}
    >
      <FloatingMenuItem
        isActive={editor.isActive('heading', { level: 1 })}
        text="H1"
        onClick={onH1Clicked}
      />
      <FloatingMenuItem
        isActive={editor.isActive('heading', { level: 2 })}
        text="H2"
        onClick={onH2Clicked}
      />
      <FloatingMenuItem
        isActive={editor.isActive('heading', { level: 3 })}
        text="H3"
        onClick={onH3Clicked}
      />
      <FloatingMenuItem
        isActive={editor.isActive('bulletList')}
        text="Bullet List"
        onClick={onBulletListClicked}
      />
    </TipTapFloatingMenu>
  );
};

export default FloatingMenu;
