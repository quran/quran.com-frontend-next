/* eslint-disable react/no-multi-comp */
import Link, { LinkVariant } from './Link';

export default {
  title: 'dls/Link',
  component: Link,
  argTypes: {
    variant: {
      control: {
        type: 'select',
      },
      defaultValue: LinkVariant.Primary,
      options: Object.values(LinkVariant),
      table: {
        category: 'Optional',
      },
    },
    href: {
      control: {
        type: 'text',
      },
      defaultValue: 'https://www.quran.com',
      description: 'The href of the link.',
      table: {
        category: 'Required',
      },
    },
    newTab: {
      control: {
        type: 'boolean',
      },
      defaultValue: true,
      table: {
        category: 'Optional',
      },
    },
  },
};

export const Default = (args) => (
  <span className="previewWrapper">
    <Link href="/test" {...args}>
      No styling be default
    </Link>
  </span>
);

export const WithOtherComponentInside = (args) => (
  <span className="previewWrapper">
    <Link href="/test" {...args}>
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
  </span>
);

export const Highlight = (args) => (
  <span className="previewWrapper">
    <Link variant={LinkVariant.Highlight} href="/test" {...args}>
      Highlighted
    </Link>
  </span>
);

export const Primary = (args) => (
  <span className="previewWrapper">
    <Link variant={LinkVariant.Primary} href="/test" {...args}>
      Primary variant
    </Link>
  </span>
);

export const Secondary = (args) => (
  <span className="previewWrapper">
    <Link variant={LinkVariant.Secondary} href="/test" {...args}>
      Secondary variant
    </Link>
  </span>
);

export const Blend = (args) => (
  <div
    className="previewWrapper"
    style={{
      color: 'blue',
      border: '1px solid blue',
      padding: '10px 10px',
      borderRadius: '4px',
    }}
  >
    <Link variant={LinkVariant.Blend} href="/test" {...args}>
      Blend
    </Link>
    , works well with other component
  </div>
);
