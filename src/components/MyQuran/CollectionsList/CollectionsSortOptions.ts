import { CollectionSortOption } from '@/hooks/useCollections';

type TranslateFn = (key: string, query?: Record<string, unknown>) => string;

const getCollectionsSortOptions = (t: TranslateFn) => [
  {
    label: t('collections.sort.recently-updated'),
    value: CollectionSortOption.RECENTLY_UPDATED,
  },
  {
    label: t('collections.sort.a-z'),
    value: CollectionSortOption.ALPHABETICAL_ASC,
  },
  {
    label: t('collections.sort.z-a'),
    value: CollectionSortOption.ALPHABETICAL_DESC,
  },
];

export default getCollectionsSortOptions;
