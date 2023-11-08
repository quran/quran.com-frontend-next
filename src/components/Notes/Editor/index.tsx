import React, { forwardRef, useImperativeHandle, useRef } from 'react';

import Link from '@tiptap/extension-link';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';

import BubbleMenu from './Menus/BubbleMenu';
import FloatingMenu from './Menus/FloatingMenu';
import styles from './NotesEditor.module.scss';

import MenuBar from '@/components/Notes/Editor/Menus/MenuBar';
import ExtendedHighlight from '@/utils/tiptap/extensions/highlight';

/**
 * We add forwardRef here to get access to the internal state of the editor.
 * inspired by {@see https://github.com/ueberdosis/tiptap/discussions/2223}
 */
const NotesEditor = forwardRef(({}, ref) => {
  const editor = useEditor({
    editorProps: {
      attributes: {
        class: styles.tiptap,
      },
    },
    extensions: [
      StarterKit,
      ExtendedHighlight,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Markdown.configure({
        transformPastedText: true,
      }),
    ],
  });
  const editorRef: React.MutableRefObject<Editor | null> = useRef(null);
  useImperativeHandle(ref, () => ({
    getJSON: () => {
      return editorRef.current?.getJSON();
    },
    getHTML: () => {
      return editorRef.current?.getHTML();
    },
    getMarkDown: () => {
      return editorRef.current?.storage.markdown.getMarkdown();
    },
  }));
  if (!editor) {
    return null;
  }
  editorRef.current = editor;
  return (
    <div className={styles.editor}>
      <MenuBar editor={editor} />
      <BubbleMenu editor={editor} />
      <FloatingMenu editor={editor} />
      <EditorContent className={styles.editor_content} editor={editor} />
    </div>
  );
});

export default NotesEditor;
