import RenameCollectionModal from './RenameCollectionModal';

export default {
  title: 'collection/RenameCollectionModal',
  component: RenameCollectionModal,
};

export const Example = () => {
  return (
    <RenameCollectionModal
      isOpen
      defaultValue="Woman in Quran"
      onSubmit={() => {
        // do nothing
      }}
    />
  );
};
