import Collapse from './Collapse';

export default {
  title: 'dls/Collapse',
};

export const Preview = () => {
  return (
    <div style={{ maxWidth: 800 }}>
      <Collapse>
        <Collapse.Item title="Question A">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Collapse.Item>
        <Collapse.Item title="Question B">
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
          nulla pariatur.
        </Collapse.Item>
      </Collapse>
    </div>
  );
};
