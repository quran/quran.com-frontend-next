/* eslint-disable react/no-multi-comp */
import Button, { ButtonSize, ButtonVariant } from '../Button/Button';
import PopoverMenu from '../PopoverMenu/PopoverMenu';

import Collapsible from './Collapsible';

import ChevronDownIcon from '@/icons/chevron-down.svg';
import OverflowMenuIcon from '@/icons/menu_more_horiz.svg';

export default {
  title: 'dls/Collapsible',
  component: Collapsible,
};

export const Example = () => {
  return (
    <Collapsible
      title="Woman in Quran"
      prefix={<ChevronDownIcon />}
      suffix={
        <PopoverMenu
          isPortalled={false}
          trigger={
            <Button variant={ButtonVariant.Ghost} size={ButtonSize.Small}>
              <OverflowMenuIcon />
            </Button>
          }
        >
          <PopoverMenu.Item>aa</PopoverMenu.Item>
        </PopoverMenu>
      }
    >
      {({ isOpen }) => {
        if (!isOpen) return null;
        return <div>Content example here</div>;
      }}
    </Collapsible>
  );
};

export const OpenByDefault = () => {
  return (
    <Collapsible
      isDefaultOpen
      title="Woman in Quran"
      prefix={<ChevronDownIcon />}
      suffix={
        <PopoverMenu
          isPortalled={false}
          trigger={
            <Button variant={ButtonVariant.Ghost} size={ButtonSize.Small}>
              <OverflowMenuIcon />
            </Button>
          }
        >
          <PopoverMenu.Item>aa</PopoverMenu.Item>
        </PopoverMenu>
      }
    >
      {({ isOpen }) => {
        if (!isOpen) return null;
        return <div>Content example here</div>;
      }}
    </Collapsible>
  );
};
