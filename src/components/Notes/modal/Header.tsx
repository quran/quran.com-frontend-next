import classNames from 'classnames';

import modalStyles from './Modal.module.scss';

import IconContainer, { IconSize } from '@/dls/IconContainer/IconContainer';
import ArrowIcon from '@/icons/arrow.svg';

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {}

const Header: React.FC<HeaderProps> = ({ onClick, children, className, ...props }) => {
  if (onClick) {
    return (
      <button
        type="button"
        className={classNames(modalStyles.headerButton, modalStyles.title, className)}
        onClick={onClick}
        {...props}
      >
        <IconContainer
          icon={<ArrowIcon />}
          shouldForceSetColors={false}
          size={IconSize.Custom}
          className={modalStyles.arrowIcon}
        />

        {children}
      </button>
    );
  }

  return (
    <h2 className={classNames(modalStyles.title, className)} {...props}>
      {children}
    </h2>
  );
};

export default Header;
