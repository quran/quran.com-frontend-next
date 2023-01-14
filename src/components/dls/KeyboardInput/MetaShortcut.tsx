import isClient from '@/utils/isClient';

const MetaShortcut: React.FC = () => {
  const isMacOs = isClient && window.navigator.userAgent.search('Mac') !== -1;

  return <span>{isMacOs ? '⌘' : 'ctrl'}</span>;
};

export default MetaShortcut;
