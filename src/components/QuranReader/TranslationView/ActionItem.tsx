import React from 'react';

import classNames from 'classnames';

import styles from './TranslationViewCell.module.scss';

type ActionItemProps = {
  children: React.ReactNode;
  isPriority?: boolean;
};

/**
 * ActionItem component for wrapping action buttons in the Quran Reader
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - The content to be rendered inside the action item
 * @param {boolean} [props.isPriority] - Whether this action item should have priority styling
 * @returns {JSX.Element} JSX element containing the action item
 */
const ActionItem: React.FC<ActionItemProps> = ({ children, isPriority }) => (
  <div className={classNames(styles.actionItem, { [styles.priorityAction]: isPriority })}>
    {children}
  </div>
);

export default ActionItem;
