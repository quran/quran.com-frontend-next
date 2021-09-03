import Separator, { SeparatorOrientation } from './Separator';

export default {
  title: 'dls/Separator',
  component: Separator,
};

export const Horizontal = () => (
  <div>
    <h1>aa</h1>
    <Separator orientation={SeparatorOrientation.Horizontal} />
    <h1>aa</h1>
  </div>
);

export const Vertical = () => (
  <div style={{ display: 'flex', height: '30px', alignItems: 'center' }}>
    <h1>aa</h1>
    <Separator orientation={SeparatorOrientation.Vertical} />
    <h1>aa</h1>
  </div>
);
