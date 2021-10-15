import { useState } from 'react';

import Tabs from '../Tabs/Tabs';

import Collapse from './Collapse';

export default {
  title: 'dls/Collapse',
};

export const Preview = () => {
  const [selected, setSelected] = useState('trending');
  return (
    <div style={{ maxWidth: 400 }}>
      <Collapse>
        <Collapse.Item id="recently-read" title="Recently Read">
          test
        </Collapse.Item>
        <Collapse.Item id="Collections" title="Collections">
          test
        </Collapse.Item>
        <Collapse.Item
          id="popular-trending-bookmarks"
          headerAction={
            <Tabs
              hasBorderBottom={false}
              tabs={[
                { title: 'Popular', value: 'popular' },
                { title: 'Trending', value: 'trending' },
                { title: 'Bookmarks', value: 'Bookmarks' },
              ]}
              selected={selected}
              onSelect={(value) => setSelected(value)}
            />
          }
        >
          test
        </Collapse.Item>

        <Collapse.Item id="faq-question" title="Some FAQ Question ?">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat voluptatem beatae aliquam
          nostrum dolorum facere repudiandae accusamus, hic dolore id harum assumenda quas obcaecati
          suscipit voluptatum inventore cum quod accusantium.
        </Collapse.Item>
      </Collapse>
    </div>
  );
};
