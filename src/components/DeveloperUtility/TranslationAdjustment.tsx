import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { getAvailableTranslations } from 'src/api';
import { TranslationsResponse } from 'types/APIResponses';
import TranslationResource from 'types/TranslationResource';
import useTranslation from 'next-translate/useTranslation';
import {
  selectCurrentTranslations,
  setCurrentTranslations,
} from 'src/redux/slices/QuranReader/translations';

const StyledSelect = styled.select.attrs({
  name: 'translations',
  multiple: true,
})`
  background-color: white;
  width: 100%;
  height: 220px;
`;

const TranslationAdjustment = () => {
  const dispatch = useDispatch();
  const currentTranslations = useSelector(selectCurrentTranslations) as string[];
  const { lang } = useTranslation();
  const [translations, setTranslations] = useState<TranslationResource[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    getAvailableTranslations(lang)
      .then((res: TranslationsResponse) => {
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
   * Handle when and item(s) get selected or un-selected.
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} e
   */
  const onSelectedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // extract the selected translation IDs as an arrays of strings
    const selectedTranslations = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    ) as string[];
    dispatch({ type: setCurrentTranslations.type, payload: selectedTranslations });
  };

  return (
    <div>
      <button type="button" onClick={() => setIsExpanded((prevIsExpanded) => !prevIsExpanded)}>
        <p>{isExpanded ? 'Hide' : 'Show'} Translations</p>
      </button>
      {isExpanded && (
        <StyledSelect onChange={onSelectedChange} defaultValue={currentTranslations}>
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

export default TranslationAdjustment;
