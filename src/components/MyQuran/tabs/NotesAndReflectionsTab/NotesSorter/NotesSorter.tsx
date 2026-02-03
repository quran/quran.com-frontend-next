import Sorter, { SorterOption } from '@/components/dls/Sorter/Sorter';
import NotesSortOption from '@/types/NotesSortOptions';
import { logEvent } from '@/utils/eventLogger';

type NotesSorterProps = {
  options: SorterOption<NotesSortOption>[];
  selectedOptionId: NotesSortOption;
  onChange: (optionId: NotesSortOption) => void;
};

const NotesSorter: React.FC<NotesSorterProps> = ({ options, selectedOptionId, onChange }) => {
  const onOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      logEvent('notes_sorter_opened');
    } else {
      logEvent('notes_sorter_closed');
    }
  };

  return (
    <Sorter
      options={options}
      selectedOptionId={selectedOptionId}
      onChange={onChange}
      onOpenChange={onOpenChange}
      dataTestPrefix="notes-sorter"
    />
  );
};

export default NotesSorter;
