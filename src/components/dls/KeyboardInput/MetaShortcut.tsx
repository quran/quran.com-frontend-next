interface Props {
  isMacOs?: boolean;
}

const MetaShortcut: React.FC<Props> = ({ isMacOs }) => <>{isMacOs ? '⌘' : 'ctrl'}</>;

export default MetaShortcut;
