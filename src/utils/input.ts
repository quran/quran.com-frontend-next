import capitalize from 'lodash/capitalize';

import { RadioItem } from 'src/components/dls/Forms/RadioGroup/RadioGroup';
import { SelectOption } from 'src/components/dls/Forms/Select';
import AvailableTranslation from 'types/AvailableTranslation';
import TafsirInfo from 'types/TafsirInfo';

/**
 * Generate the select input options.
 *
 * @param {string[]} options
 * @returns {SelectOption[]}
 */
export const generateSelectOptions = (options: string[]): SelectOption[] =>
  options.map((option) => ({
    label: capitalize(option),
    value: option,
  }));

/**
 * Generate the radio items.
 *
 * @param {string[]} options
 * @returns {RadioItem[]}
 */
export const generateRadioItems = (items: string[]): RadioItem[] =>
  items.map((item) => ({
    label: capitalize(item),
    id: item,
    value: item,
  }));

/**
 * Get the translated name of an item along with the language of the item.
 *
 * @param {TafsirInfo | AvailableTranslation} item the item that we want to generate the label for.
 * @returns {String}
 */
export const getTranslatedLabelWithLanguage = (item: TafsirInfo | AvailableTranslation): string =>
  `${capitalize(item.languageName)} - ${item.translatedName.name}`;
