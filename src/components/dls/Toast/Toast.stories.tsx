/* eslint-disable react/no-multi-comp */
/* eslint-disable storybook/story-exports */
// import { ToastStatus } from './Toast';
// import styles from './Toast.stories.module.scss';

// import Button from '@/dls/Button/Button';

export default {
  title: 'dls/Toast',
};

// export const Normal = () => {
//   const notify = () => toast('This is a toast message');
//   return (
//     <div>
//       <Button onClick={notify}>Notify!</Button>
//       <ToastContainer />
//     </div>
//   );
// };

// export const Status = () => {
//   const notify = (status) => toast(`This is ${status} toast message`, { status });
//   return (
//     <div>
//       <Button className={styles.toastBtn} onClick={() => notify(ToastStatus.Error)}>
//         Error!
//       </Button>
//       <Button className={styles.toastBtn} onClick={() => notify(ToastStatus.Warning)}>
//         Warning!
//       </Button>
//       <Button className={styles.toastBtn} onClick={() => notify(ToastStatus.Success)}>
//         Success!
//       </Button>
//       <ToastContainer />
//     </div>
//   );
// };

// export const Preserve = () => {
//   const notify = () => toast('This is a toast message', { preserve: true });
//   return (
//     <div>
//       <Button onClick={notify}>Notify!</Button>
//       <ToastContainer />
//     </div>
//   );
// };

// export const WithCloseButton = () => {
//   const notify = () =>
//     toast('This is a toast message', {
//       actions: [{ text: 'close' }],
//     });
//   return (
//     <div>
//       <Button onClick={notify}>Notify!</Button>
//       <ToastContainer />
//     </div>
//   );
// };

// export const WithAction = () => {
//   const notify = () =>
//     toast('This is a toast message', {
//       actions: [
//         {
//           text: 'undo',
//           primary: true,
//           onClick: () => {
//             // do nothing
//           },
//         },
//       ],
//     });
//   return (
//     <div>
//       <Button onClick={notify}>Notify!</Button>
//       <ToastContainer />
//     </div>
//   );
// };

// export const WithActionAndCloseButton = () => {
//   const notify = () =>
//     toast('This is a toast message', {
//       actions: [
//         {
//           text: 'undo',
//           onClick: () => {
//             // do nothing
//           },
//           primary: true,
//         },
//         {
//           text: 'close',
//         },
//       ],
//     });
//   return (
//     <div>
//       <Button onClick={notify}>Notify!</Button>
//       <ToastContainer />
//     </div>
//   );
// };
