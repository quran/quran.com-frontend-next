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
  hasNotes?: boolean;
}

const ReadingViewNoteAction: React.FC<ReadingViewNoteActionProps> = ({
  verseKey,
  onActionTriggered,
  hasNotes,
}) => {
  const { t } = useTranslation('common');

  return (
    <NoteActionController
      verseKey={verseKey}
      onActionTriggered={onActionTriggered}
      isTranslationView={false}
      hasNotes={hasNotes}
    >
      {({ onClick, hasNote }) => (
        <PopoverMenu.Item
          onClick={onClick}
          dataTestId="notes-menu-item"
          icon={
            <IconContainer
              shouldForceSetColors={false}
              size={IconSize.Custom}
              className={classNames(actionStyles.button, { [actionStyles.hasNote]: hasNote })}
              icon={hasNote ? <NotesWithPencilFilledIcon /> : <NotesWithPencilIcon />}
            />
          }
        >
          {t('notes.label')}
        </PopoverMenu.Item>
      )}
    </NoteActionController>
  );
};

export default ReadingViewNoteAction;
