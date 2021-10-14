import { useState } from 'react';

import Tabs from '../Tabs/Tabs';

import Collapse from './Collapse';

export default {
  title: 'dls/Collapse',
};

export const Preview = () => {
  const [selected, setSelected] = useState('surah');
  return (
    <div style={{ maxWidth: 400 }}>
      <Collapse>
        <Collapse.Item
          headerAction={
            <Tabs
              hasBorderBottom={false}
              tabs={[
                { title: 'Surah', value: 'surah' },
                { title: 'Juz', value: 'juz' },
                { title: 'Juz', value: 'uz' },
              ]}
              selected={selected}
              onSelect={(value) => setSelected(value)}
            />
          }
          id="test1"
          title="Surah"
        >
          test
        </Collapse.Item>
        <Collapse.Item id="test2" title="how">
          test
        </Collapse.Item>
        <Collapse.Item id="test3" title="?">
          test
        </Collapse.Item>
      </Collapse>
    </div>
  );
};
