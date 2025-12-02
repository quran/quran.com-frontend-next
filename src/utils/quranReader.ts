import { QuranReaderDataType } from '@/types/QuranReader';

/**
 * Determine whether the chapter/page sync hook should run for the provided data type.
 * We must skip syncing for the Page view since the page is user-driven and should not be
 * overridden by chapter-derived defaults.
 *
 * @param {QuranReaderDataType} dataType
 * @returns {boolean}
 */
const shouldSyncChapterPageForDataType = (dataType: QuranReaderDataType): boolean =>
  dataType !== QuranReaderDataType.Page;

export default shouldSyncChapterPageForDataType;
