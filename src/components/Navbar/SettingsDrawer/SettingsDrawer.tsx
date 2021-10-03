import SettingsBody from './SettingsBody';

import Drawer, { DrawerType } from 'src/components/Navbar/Drawer';

const SettingsDrawer = () => (
  <Drawer type={DrawerType.Settings} header={<div>Settings</div>}>
    <SettingsBody />
  </Drawer>
);

export default SettingsDrawer;
