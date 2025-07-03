import React from 'react';

import styles from './TranslationViewCell.module.scss';

type ActionItemProps = {
  children: React.ReactNode;
};

/**
 * ActionItem component for wrapping action buttons in the Quran Reader
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - The content to be rendered inside the action item
 * @returns {JSX.Element} JSX element containing the action item
 */
const ActionItem: React.FC<ActionItemProps> = ({ children }) => (
  <div className={styles.actionItem}>{children}</div>
);

export default ActionItem;
