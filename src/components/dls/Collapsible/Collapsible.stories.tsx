/* eslint-disable react/no-multi-comp */
import ChevronDownIcon from '../../../../public/icons/chevron-down.svg';
import OverflowMenuIcon from '../../../../public/icons/menu_more_horiz.svg';

import Collapsible from './Collapsible';

export default {
  title: 'dls/Collapsible',
  component: Collapsible,
};

export const Example = () => {
  return (
    <Collapsible title="Woman in Quran" prefix={<ChevronDownIcon />} suffix={<OverflowMenuIcon />}>
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
      suffix={<OverflowMenuIcon />}
    >
      {({ isOpen }) => {
        if (!isOpen) return null;
        return <div>Content example here</div>;
      }}
    </Collapsible>
  );
};
