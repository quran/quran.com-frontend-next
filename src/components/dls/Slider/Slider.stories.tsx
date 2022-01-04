/* eslint-disable max-lines */
/* eslint-disable react/no-multi-comp */
import React, { useState, useCallback } from 'react';

import Slider, { Orientation, Direction } from '.';

export default {
  title: 'dls/Slider',
  component: Slider,
  args: {
    min: 0,
    max: 100,
    step: 1,
    minStepsBetweenThumbs: 0,
    direction: Direction.ltr,
    orientation: Orientation.Horizontal,
    disabled: false,
    showThumbs: true,
  },

  argTypes: {
    label: {
      control: {
        type: 'text',
      },
      description: 'The value that will be used with aria-label',
      table: {
        category: 'Required',
      },
    },
    name: {
      description: `The name of the slider. Submitted with its owning form as part of a name/value pair.`,
      control: { type: 'text' },
      table: {
        category: 'Optional',
      },
    },
    onValueChange: {
      table: {
        category: 'Optional',
      },
      description: 'This is a callback to handle when the value changes.',
    },
    min: {
      description: `The value of the minimum value.`,
      control: { type: 'number' },
      table: {
        category: 'Optional',
      },
    },
    max: {
      description: `The value of the minimum value.`,
      control: { type: 'number' },
      table: {
        category: 'Optional',
      },
    },
    step: {
      description: `The value of each step when the user slides.`,
      control: { type: 'number' },
      table: {
        category: 'Optional',
      },
    },
    minStepsBetweenThumbs: {
      description: `The minimum permitted steps between multiple thumbs.`,
      control: { type: 'number' },
      table: {
        category: 'Optional',
      },
    },
    direction: {
      description: `The direction of the slider.`,
      options: Object.values(Direction).map((direction) => direction),
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
    },
    orientation: {
      description: `The orientation of the slider.`,
      options: Object.values(Orientation).map((orientation) => orientation),
      control: { type: 'radio' },
      table: {
        category: 'Optional',
      },
    },
    showThumbs: {
      description: 'Whether we should show any thumbs or not.',
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
    },
    disabled: {
      description: 'Whether sliding is disabled or not.',
      control: { type: 'boolean' },
      table: {
        category: 'Optional',
      },
    },
    defaultValue: {
      table: {
        category: 'Optional',
      },
      description: 'The default selected values.',
    },
    value: {
      table: {
        category: 'Optional',
      },
      description: 'Controlled selected values.',
    },
  },
};

const Template = (args) => (
  <div style={{ width: 500 }}>
    <Slider {...args} />
  </div>
);

const ControlledTemplate = (args) => {
  const [value, setValue] = useState([0]);
  const onChange = useCallback((newValue: number[]) => {
    setValue(newValue);
  }, []);
  return (
    <div style={{ width: 500 }}>
      <Slider value={value} onValueChange={onChange} {...args} />
    </div>
  );
};

export const DefaultSlider = Template.bind({});
DefaultSlider.args = {
  defaultValue: [0],
};

export const WithMultipleThumbsSlider = Template.bind({});
WithMultipleThumbsSlider.args = {
  defaultValue: [0, 50],
  minStepsBetweenThumbs: 1,
};

export const WithBigStepsSlider = Template.bind({});
WithBigStepsSlider.args = {
  defaultValue: [0],
  step: 10,
};

export const ControlledSlider = ControlledTemplate.bind({});
ControlledSlider.args = {};
