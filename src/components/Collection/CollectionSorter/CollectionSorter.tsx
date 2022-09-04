import ChevronDownIcon from '../../../../public/icons/chevron-down.svg';

import styles from './CollectionSorter.module.scss';

import PopoverMenu from 'src/components/dls/PopoverMenu/PopoverMenu';

const CollectionSorter = ({ options, selectedOptionId, onChange }) => {
  const selectedOption = options.find((option) => option.id === selectedOptionId);

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
