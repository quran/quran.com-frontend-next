import styles from './CollectionSorter.module.scss';

import ChevronDownIcon from '@/icons/chevron-down.svg';
import { logEvent } from '@/utils/eventLogger';
import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';

const CollectionSorter = ({
  options,
  selectedOptionId,
  onChange,
  isSingleCollection,
  collectionId = null,
}) => {
  const selectedOption = options.find((option) => option.id === selectedOptionId);

  const onOpenChange = (isOpen: boolean) => {
    const eventData = {
      collectionId,
    };
    if (isSingleCollection) {
      if (isOpen) {
        logEvent('collection_sorter_opened', eventData);
      } else {
        logEvent('collection_sorter_closed', eventData);
      }
    } else if (isOpen) {
      logEvent('collections_sorter_opened', eventData);
    } else {
      logEvent('collections_sorter_closed', eventData);
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

export default CollectionSorter;
