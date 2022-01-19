import { isValidTranslationsQueryParamValue } from './queryParamValidator';

it('Returns false when empty', () => {
  expect(isValidTranslationsQueryParamValue('')).toBe(false);
});
it('Returns true when 1 valid translation id exists', () => {
  expect(isValidTranslationsQueryParamValue('124')).toBe(true);
});
it('Returns false when 1 invalid translation id exists', () => {
  expect(isValidTranslationsQueryParamValue('sdfsdfdf')).toBe(false);
});
it('Returns false when 1 invalid translation id and 1 empty id exist', () => {
  expect(isValidTranslationsQueryParamValue('sdfsdf,')).toBe(false);
});
it('Returns false when 1 valid id and 1 empty id exist', () => {
  expect(isValidTranslationsQueryParamValue('123,')).toBe(false);
});
it('Returns false when 2 valid ids and 1 empty id exist', () => {
  expect(isValidTranslationsQueryParamValue('151,54,')).toBe(false);
});
it('Returns true when 2 valid translation id exist', () => {
  expect(isValidTranslationsQueryParamValue('123,444')).toBe(true);
});
it('Returns false when one of many ids is not valid', () => {
  expect(isValidTranslationsQueryParamValue('123,sdfsdf,1234')).toBe(false);
});
