import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import actionStyles from '@/components/Notes/modal/action.module.scss';
import NoteActionController from '@/components/Notes/modal/NoteAction';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import NotesWithPencilFilledIcon from '@/icons/notes-with-pencil-filled.svg';
import NotesWithPencilIcon from '@/icons/notes-with-pencil.svg';

interface ReadingViewNoteActionProps {
  verseKey: string;
  onActionTriggered?: () => void;
  shouldCloseMenuAfterClick?: boolean;
  label?: string;
}

const ReadingViewNoteAction: React.FC<ReadingViewNoteActionProps> = ({
  verseKey,
  onActionTriggered,
  shouldCloseMenuAfterClick = false,
  label,
}) => {
  const { t } = useTranslation('common');
  const noteLabel = label || t('notes.label');

  return (
    <NoteActionController
      verseKey={verseKey}
      onActionTriggered={onActionTriggered}
      isTranslationView={false}
    >
      {({ onClick, hasNote }) => (
        <PopoverMenu.Item
          onClick={onClick}
          dataTestId="notes-menu-item"
          shouldCloseMenuAfterClick={shouldCloseMenuAfterClick}
          icon={
            <IconContainer
              shouldForceSetColors={false}
              size={IconSize.Custom}
              className={classNames(actionStyles.button, { [actionStyles.hasNote]: hasNote })}
              icon={hasNote ? <NotesWithPencilFilledIcon /> : <NotesWithPencilIcon />}
            />
          }
        >
          {noteLabel}
        </PopoverMenu.Item>
      )}
    </NoteActionController>
  );
};

export default ReadingViewNoteAction;
