/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/no-array-index-key */
import { Fragment } from 'react';

import { CmdKey } from '@milkdown/core';
import { redoCommand, undoCommand } from '@milkdown/plugin-history';
import {
  toggleEmphasisCommand,
  toggleStrongCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand,
  wrapInHeadingCommand,
  insertHrCommand,
  turnIntoTextCommand,
  insertHardbreakCommand,
} from '@milkdown/preset-commonmark';

import styles from './MarkdownMenu.module.scss';
import MenuItem from './MenuItem';

type Props = {
  call: <T, P>(command: CmdKey<T>, payload?: P) => void;
};

const DIVIDER = 'divider';

const MenuBar: React.FC<Props> = ({ call }) => {
  const items = [
    {
      itemKey: 'undo',
      icon: <>MdUndo</>,
      title: 'Undo',
      action: () => call(undoCommand.key),
    },
    {
      itemKey: 'redo',
      icon: <>MdRedo</>,
      title: 'Redo',
      action: () => call(redoCommand.key),
    },
    {
      type: DIVIDER,
    },
    {
      itemKey: 'bold',
      icon: <>Bold</>,
      title: 'Bold',
      action: () => call(toggleStrongCommand.key),
    },
    {
      itemKey: 'italic',
      icon: <>Italic</>,
      title: 'Italic',
      action: () => call(toggleEmphasisCommand.key),
    },
    {
      type: DIVIDER,
    },
    {
      itemKey: 'text',
      icon: <>Text</>,
      title: 'Text',
      action: () => call(turnIntoTextCommand.key, 0),
    },
    {
      itemKey: 'heading1',
      icon: <>Heading 1</>,
      title: 'Heading 1',
      action: () => call(wrapInHeadingCommand.key, 1),
    },
    {
      itemKey: 'heading2',
      icon: <>Text</>,
      title: 'Heading 2',
      action: () => call(wrapInHeadingCommand.key, 2),
    },
    {
      itemKey: 'heading3',
      icon: <>Text</>,
      title: 'Heading 3',
      action: () => call(wrapInHeadingCommand.key, 3),
    },
    {
      type: DIVIDER,
    },
    {
      itemKey: 'bulletList',
      icon: <>ListBulleted</>,
      title: 'ListBulleted',
      action: () => call(wrapInBulletListCommand.key),
    },
    {
      itemKey: 'orderedList',
      icon: <>ListNumbered</>,
      title: 'ListNumbered',
      action: () => call(wrapInOrderedListCommand.key),
    },
    {
      type: DIVIDER,
    },
    {
      itemKey: 'hr',
      icon: <>HR</>,
      title: 'HR',
      action: () => call(insertHrCommand.key),
    },
    {
      itemKey: 'br',
      icon: <>BR</>,
      title: 'BR',
      action: () => call(insertHardbreakCommand.key),
    },
  ];
  return (
    <div className={styles.header}>
      {items.map((item, index) => (
        <Fragment key={index}>
          {item.type === DIVIDER ? (
            <div className={styles.divider} />
          ) : (
            <MenuItem
              title={item.title}
              action={item.action}
              icon={item.icon}
              itemKey={item.itemKey}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default MenuBar;
