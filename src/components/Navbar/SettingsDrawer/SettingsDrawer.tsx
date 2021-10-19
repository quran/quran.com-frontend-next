/* eslint-disable react/no-multi-comp */
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';

import Spinner from 'src/components/dls/Spinner/Spinner';
import Drawer, { DrawerType } from 'src/components/Navbar/Drawer';
import { selectNavbar } from 'src/redux/slices/navbar';

const SettingsBody = dynamic(() => import('./SettingsBody'), {
  ssr: false,
  loading: () => <Spinner />,
});

const SettingsDrawer = () => {
  const { isSettingsDrawerOpen } = useSelector(selectNavbar);
  return (
    <Drawer type={DrawerType.Settings} header={<div>Settings</div>}>
      {isSettingsDrawerOpen && <SettingsBody />}
    </Drawer>
  );
};

export default SettingsDrawer;
