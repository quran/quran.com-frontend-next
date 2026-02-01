import { ArrowDirection, SorterOption } from '@/dls/Sorter/Sorter';
import { CollectionSortOption } from '@/hooks/useCollections';

type TranslateFn = (key: string, query?: Record<string, unknown>) => string;

const getCollectionsSortOptions = (t: TranslateFn): SorterOption<CollectionSortOption>[] => [
  {
    id: CollectionSortOption.RECENTLY_UPDATED,
    label: t('collections.sort.recently-updated'),
    direction: ArrowDirection.Down,
  },
  {
    id: CollectionSortOption.ALPHABETICAL_ASC,
    label: t('collections.sort.a-z'),
    direction: ArrowDirection.Down,
  },
  {
    id: CollectionSortOption.ALPHABETICAL_DESC,
    label: t('collections.sort.z-a'),
    direction: ArrowDirection.Up,
  },
];

export default getCollectionsSortOptions;
