import { CmdKey } from '@milkdown/core';
import { redoCommand, undoCommand } from '@milkdown/plugin-history';
import {
  toggleEmphasisCommand,
  toggleStrongCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand,
  wrapInHeadingCommand,
} from '@milkdown/preset-commonmark';

import styles from './MarkdownMenu.module.scss';

const Button = ({ icon, onClick }) => {
  return (
    <button
      className="p-[6px] relative min-h-0 btn-sm btn-circle w-auto h-auto btn-ghost"
      onClick={onClick}
    >
      {icon}
    </button>
  );
};

type Props = {
  call: <T, P>(command: CmdKey<T>, payload?: P) => void;
};

const MarkdownMenu: React.FC<Props> = ({ call }) => {
  return (
    <div className={styles.header}>
      <div className={styles.section}>
        <Button icon={<>MdUndo</>} onClick={() => call(undoCommand.key)} tooltip="Undo" />
        <Button icon={<>MdRedo</>} onClick={() => call(redoCommand.key)} tooltip="Redo" />
      </div>

      <div className={styles.section}>
        <select
          onChange={(e) => {
            call(wrapInHeadingCommand.key, Number(e.target.value));
          }}
          className="text-xs text-gray-300 rounded select select-sm p-1.5 focus:outline-none focus:ring-0"
        >
          <option value={0}>Text</option>
          <option value={1}>Heading 1</option>
          <option value={2}>Heading 2</option>
          <option value={3}>Heading 3</option>
        </select>
      </div>

      <div className={styles.section}>
        <Button
          icon={<>MdFormatBold</>}
          onClick={() => call(toggleStrongCommand.key)}
          tooltip="Bold"
        />
        <Button
          icon={<>MdFormatItalic</>}
          onClick={() => call(toggleEmphasisCommand.key)}
          tooltip="Italic"
        />
      </div>
      <div className={styles.section}>
        <Button
          icon={<>MdFormatListBulleted</>}
          onClick={() => call(wrapInBulletListCommand.key)}
          tooltip="Bullet List"
        />
        <Button
          icon={<>MdFormatListNumbered</>}
          onClick={() => call(wrapInOrderedListCommand.key)}
          tooltip="Numbered List"
        />
      </div>
    </div>
  );
};

export default MarkdownMenu;
