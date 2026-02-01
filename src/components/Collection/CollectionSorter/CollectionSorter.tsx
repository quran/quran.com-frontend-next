import Sorter, { SorterOption } from '@/components/dls/Sorter/Sorter';
import {
  CollectionDetailSortOption,
  CollectionListSortOption,
} from '@/types/CollectionSortOptions';
import { logEvent } from '@/utils/eventLogger';

type SortType = CollectionDetailSortOption | CollectionListSortOption;

type CollectionSorterProps = {
  options: SorterOption<SortType>[];
  selectedOptionId: SortType;
  onChange: (optionId: SortType) => void;
  isSingleCollection: boolean;
  collectionId: string | null;
};

const CollectionSorter: React.FC<CollectionSorterProps> = ({
  options,
  selectedOptionId,
  onChange,
  isSingleCollection,
  collectionId = null,
}) => {
  const onOpenChange = (isOpen: boolean) => {
    const eventData = { collectionId };

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
    <Sorter
      options={options}
      selectedOptionId={selectedOptionId}
      onChange={onChange}
      onOpenChange={onOpenChange}
      dataTestPrefix="collection-sorter"
    />
  );
};

export default CollectionSorter;
