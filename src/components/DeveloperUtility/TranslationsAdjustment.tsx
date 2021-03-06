import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { getAvailableTranslations } from 'src/api';
import AvailableTranslation from 'types/AvailableTranslation';
import useTranslation from 'next-translate/useTranslation';
import {
  selectTranslations,
  setSelectedTranslations,
} from 'src/redux/slices/QuranReader/translations';

/**
 * Convert an array of numbers to an array of strings.
 *
 * @param {number[]} numbersArray
 * @returns {string[]}
 */
const numbersToStringsArray = (numbersArray: number[]): string[] =>
  numbersArray.map((number) => String(number));

const TranslationsAdjustment = () => {
  const dispatch = useDispatch();
  const selectedTranslations = useSelector(selectTranslations) as number[];
  const { lang } = useTranslation();
  const [translations, setTranslations] = useState<AvailableTranslation[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    getAvailableTranslations(lang)
      .then((res) => {
        // if there is an internal server error.
        if (res.status === 500) {
          setHasError(true);
        } else {
          setTranslations(res.translations);
        }
      })
      .catch(() => {
        setHasError(true);
      });
  }, [lang]);

  if (hasError) {
    return null;
  }

  /**
   * Handle when an item(s) get selected or un-selected.
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} e
   */
  const onSelectedTranslationsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // extract the selected translation IDs
    const selectedTranslationsIDs = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value),
    );
    dispatch({ type: setSelectedTranslations.type, payload: selectedTranslationsIDs });
  };

  return (
    <div>
      Selected translations{' '}
      <button type="button" onClick={() => setIsExpanded((prevIsExpanded) => !prevIsExpanded)}>
        <p>{isExpanded ? 'Hide' : 'Show'} Translations</p>
      </button>
      {isExpanded && (
        <StyledSelect
          onChange={onSelectedTranslationsChange}
          defaultValue={numbersToStringsArray(selectedTranslations)}
        >
          {translations.map((translation) => (
            <option key={translation.id} value={translation.id}>
              {translation.translatedName.name}
            </option>
          ))}
        </StyledSelect>
      )}
    </div>
  );
};

const StyledSelect = styled.select.attrs({
  name: 'translations',
  multiple: true,
})`
  background-color: white;
  width: 100%;
  height: calc(5 * ${(props) => props.theme.spacing.mega});
`;

export default TranslationsAdjustment;
