import RenameCollectionModal from './RenameCollectionModal';

export default {
  title: 'collection/RenameCollectionModal',
  component: RenameCollectionModal,
};

export const Example = () => {
  return (
    <RenameCollectionModal
      isOpen
      onSubmit={() => {
        // do nothing
      }}
    />
  );
};
