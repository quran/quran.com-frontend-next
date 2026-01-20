import useTranslation from 'next-translate/useTranslation';

import styles from './NotesSorter.module.scss';

import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import PopoverMenu, { PopoverMenuAlign } from '@/dls/PopoverMenu/PopoverMenu';
import ArrowRightIcon from '@/icons/arrow-right.svg';
import ArrowsVerticalIcon from '@/icons/arrows-vertical.svg';
import NotesSortOption from '@/types/NotesSortOptions';
import { logEvent } from '@/utils/eventLogger';

type NotesSorterProps = {
  options: { id: NotesSortOption; label: string }[];
  selectedOptionId: NotesSortOption;
  onChange: (optionId: NotesSortOption) => void;
};

const NotesSorter: React.FC<NotesSorterProps> = ({ options, selectedOptionId, onChange }) => {
  const { t } = useTranslation('common');

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      logEvent('notes_sorter_opened');
    } else {
      logEvent('notes_sorter_closed');
    }
  };

  const getRotationClass = (optionId: NotesSortOption) => {
    if (optionId === NotesSortOption.Newest) {
      return styles.arrowDown;
    }
    if (optionId === NotesSortOption.Oldest) {
      return styles.arrowUp;
    }
    return '';
  };

  return (
    <PopoverMenu
      contentClassName={styles.popoverMenuContent}
      align={PopoverMenuAlign.END}
      trigger={
        <button
          type="button"
          className={styles.sortTrigger}
          data-has-selected={selectedOptionId !== null}
        >
          <IconContainer
            className={styles.iconWrapper}
            size={IconSize.Custom}
            shouldForceSetColors={false}
            shouldFlipOnRTL={false}
            icon={<ArrowsVerticalIcon />}
          />

          <span className={styles.sortText}>{t('sort.sort')}</span>
        </button>
      }
      onOpenChange={onOpenChange}
    >
      {options.map((option) => (
        <PopoverMenu.Item
          shouldCloseMenuAfterClick
          key={option.id}
          onClick={() => onChange(option.id)}
          isSelected={option.id === selectedOptionId}
          dataTestId={`notes-sorter-option-${option.id}`}
          className={styles.menuItem}
        >
          <span className={styles.menuItemText}>
            <IconContainer
              className={`${styles.optionIcon} ${getRotationClass(option.id)}`}
              size={IconSize.Custom}
              shouldForceSetColors={false}
              shouldFlipOnRTL={false}
              icon={<ArrowRightIcon />}
            />

            {option.label}
          </span>
        </PopoverMenu.Item>
      ))}
    </PopoverMenu>
  );
};

export default NotesSorter;
