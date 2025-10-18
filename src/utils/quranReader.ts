import { QuranReaderDataType } from '@/types/QuranReader';

/**
 * Determine whether chapter/page synchronization should run for the provided reader data type.
 *
 * @param {QuranReaderDataType} dataType
 * @returns {boolean}
 */
const shouldSyncChapterPageForDataType = (dataType: QuranReaderDataType): boolean =>
  dataType !== QuranReaderDataType.Page;

export default shouldSyncChapterPageForDataType;
