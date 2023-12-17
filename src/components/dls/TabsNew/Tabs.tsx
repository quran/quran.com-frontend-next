import * as TabsPrimitive from '@radix-ui/react-tabs';

import IconContainer, { IconSize } from '../IconContainer/IconContainer';

import styles from './Tabs.module.scss';

type Tab = {
  title: string;
  icon?: JSX.Element;
  value: string;
  body: JSX.Element;
};
type TabsProps = {
  tabs: Tab[];
  /** The value of the tab to select by default, if uncontrolled */
  defaultValue?: string;
  /** The value for the selected tab, if controlled */
  value?: string;
  /** A function called when a new tab is selected */
  onValueChange?: (value: string) => void;
};

const Tabs: React.FC<TabsProps> = (props) => {
  const { tabs, onValueChange, defaultValue, value } = props;
  return (
    <TabsPrimitive.Root
      className={styles.tabsRoot}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
    >
      <TabsPrimitive.List className={styles.tabsList}>
        {tabs.map((tab) => {
          const { icon, title, value: tabValue } = tab;
          return (
            <TabsPrimitive.Trigger className={styles.tabItem} key={tabValue} value={tabValue}>
              {icon && <IconContainer className={styles.icon} size={IconSize.Small} icon={icon} />}
              {title}
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsPrimitive.List>
      {tabs.map((tab) => {
        const { value: tabValue, body } = tab;
        return (
          <TabsPrimitive.Content className={styles.tabContent} key={tabValue} value={tabValue}>
            {body}
          </TabsPrimitive.Content>
        );
      })}
    </TabsPrimitive.Root>
  );
};

export default Tabs;
