import classNames from 'classnames';
import useTranslation from 'next-translate/useTranslation';

import actionStyles from '@/components/Notes/modal/action.module.scss';
import NoteActionController from '@/components/Notes/modal/NoteAction';
import translationViewStyles from '@/components/QuranReader/TranslationView/TranslationViewCell.module.scss';
import Button, { ButtonShape, ButtonSize, ButtonType, ButtonVariant } from '@/dls/Button/Button';
import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import NotesWithPencilFilledIcon from '@/icons/notes-with-pencil-filled.svg';
import NotesWithPencilIcon from '@/icons/notes-with-pencil.svg';

interface TranslationViewNoteActionProps {
  verseKey: string;
  onActionTriggered?: () => void;
  hasNotes?: boolean;
}

const TranslationViewNoteAction: React.FC<TranslationViewNoteActionProps> = ({
  verseKey,
  onActionTriggered,
  hasNotes,
}) => {
  const { t } = useTranslation('notes');

  return (
    <NoteActionController
      verseKey={verseKey}
      onActionTriggered={onActionTriggered}
      isTranslationView
      hasNotes={hasNotes}
    >
      {({ onClick, hasNote }) => (
        <Button
          className={classNames(
            translationViewStyles.iconContainer,
            translationViewStyles.verseAction,
            actionStyles.button,
            { [actionStyles.hasNote]: hasNote },
          )}
          onClick={onClick}
          data-has-notes={hasNote}
          tooltip={t('take-a-note-or-reflection')}
          type={ButtonType.Primary}
          shape={ButtonShape.Circle}
          variant={ButtonVariant.Ghost}
          size={ButtonSize.Small}
          ariaLabel={t('take-a-note-or-reflection')}
          data-testid="notes-action-button"
        >
          <span className={translationViewStyles.icon}>
            <IconContainer
              icon={hasNote ? <NotesWithPencilFilledIcon /> : <NotesWithPencilIcon />}
              shouldForceSetColors={false}
              size={IconSize.Custom}
            />
          </span>
        </Button>
      )}
    </NoteActionController>
  );
};

export default TranslationViewNoteAction;
