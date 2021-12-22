// import * as Dialog from '@radix-ui/react-dialog';

// import CloseIcon from '../../../../public/icons/close.svg';
// import Button, { ButtonShape, ButtonVariant } from '../Button/Button';

// import styles from './EmbeddableContent.module.scss';

type EmbeddableContentProps = {
  isOpen?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  hasCloseButton?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const EmbeddableContent = (props: EmbeddableContentProps) => {
  return <div>{/* return nothing for now */}</div>;
  // return (
  //   <Dialog.Root open={isOpen}>
  //     <Dialog.Portal>
  //       <Dialog.Overlay className={styles.overlay}>
  //         <Dialog.Content className={styles.content} onInteractOutside={onClose}>
  //           {hasCloseButton && (
  //             <Dialog.Close className={styles.closeIcon}>
  //               <Button variant={ButtonVariant.Ghost} shape={ButtonShape.Circle} onClick={onClose}>
  //                 <CloseIcon />
  //               </Button>
  //             </Dialog.Close>
  //           )}
  //           {children}
  //         </Dialog.Content>
  //       </Dialog.Overlay>
  //     </Dialog.Portal>
  //   </Dialog.Root>
  // );
};

export default EmbeddableContent;
