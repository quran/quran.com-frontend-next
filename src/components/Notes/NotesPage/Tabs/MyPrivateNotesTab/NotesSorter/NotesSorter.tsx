import styles from './NotesSorter.module.scss';

import PopoverMenu from '@/dls/PopoverMenu/PopoverMenu';
import ChevronDownIcon from '@/icons/chevron-down.svg';
import { logEvent } from '@/utils/eventLogger';

const NotesSorter = ({ options, selectedOptionId, onChange }) => {
  const selectedOption = options.find((option) => option.id === selectedOptionId);

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      logEvent('notes_sorter_opened');
    } else {
      logEvent('notes_sorter_closed');
    }
  };

  return (
    <div className={styles.sorter}>
      <PopoverMenu
        trigger={
          <span className={styles.sortTrigger}>
            {selectedOption.label}
            <span className={styles.itemIcon}>
              <ChevronDownIcon />
            </span>
          </span>
        }
        onOpenChange={onOpenChange}
      >
        {options.map((option) => (
          <PopoverMenu.Item
            shouldCloseMenuAfterClick
            key={option.id}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </PopoverMenu.Item>
        ))}
      </PopoverMenu>
    </div>
  );
};

export default NotesSorter;
