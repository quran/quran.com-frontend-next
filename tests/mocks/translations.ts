import merge from 'lodash/merge';

const mockTranslation = (overrides = {}) =>
  merge(
    {
      id: 722482,
      languageName: 'english',
      text: 'In the Name of Allah—the Most Compassionate, Most Merciful.',
      resourceName: 'Dr. Mustafa Khattab',
      resourceId: 102,
    },
    overrides,
  );

export default mockTranslation;
