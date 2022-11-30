import capitalize from 'lodash/capitalize';

import { RadioItem } from '@/dls/Forms/RadioGroup/RadioGroup';
import { SelectOption } from '@/dls/Forms/Select';
import AvailableTranslation from 'types/AvailableTranslation';
import TafsirInfo from 'types/TafsirInfo';

/**
 * Generate the select input options.
 *
 * @param {string[]} options
 * @returns {SelectOption[]}
 */
export const generateSelectOptions = (
  options: Array<{ label: string; value: string | number }>,
): SelectOption[] =>
  options.map((option) => ({
    label: option.label,
    value: option.value,
  }));

/**
 * Generate the radio items.
 *
 * @param {string[]} items
 * @returns {RadioItem[]}
 */
export const generateRadioItems = (items: string[]): RadioItem[] =>
  items.map((item) => ({
    label: item,
    id: item,
    value: item,
  }));

/**
 * Get the translated name of an item along with the language of the item.
 *
 * @param {TafsirInfo | AvailableTranslation} item the item that we want to generate the label for.
 * @returns {string}
 */
export const getTranslatedLabelWithLanguage = (item: TafsirInfo | AvailableTranslation): string =>
  `${capitalize(item.languageName)} - ${item.translatedName.name}`;
