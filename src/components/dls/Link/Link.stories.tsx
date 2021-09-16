/* eslint-disable react/no-multi-comp */
import Link, { LinkVariant } from './Link';

export default {
  title: 'dls/Link',
  component: Link,
};

export const Default = () => <Link href="/test">No styling be default</Link>;

export const WithOtherComponentInside = () => (
  <Link href="/test">
    <div
      style={{
        border: '1px solid #000',
        borderRadius: '4px',
        padding: '4px 10px',
        maxWidth: '100px',
      }}
    >
      I am a div inside Link
    </div>
  </Link>
);

export const Highlight = () => (
  <Link variant={LinkVariant.Highlight} href="/test">
    Highlighted
  </Link>
);

export const Primary = () => (
  <Link variant={LinkVariant.Primary} href="/test">
    Primary variant
  </Link>
);

export const Secondary = () => (
  <Link variant={LinkVariant.Secondary} href="/test">
    Secondary variant
  </Link>
);

export const Blend = () => (
  <div
    style={{
      color: 'blue',
      border: '1px solid blue',
      padding: '10px 10px',
      borderRadius: '4px',
    }}
  >
    <Link variant={LinkVariant.Blend} href="/test">
      Blend
    </Link>
    , works well with other component
  </div>
);
