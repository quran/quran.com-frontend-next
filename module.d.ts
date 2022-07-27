declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.scss';

declare module '*.svg' {
  const content: any;
  export const ReactComponent: any;
  export default content;
}
