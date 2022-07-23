import LookupRange from './LookupRange';

interface LookupRecord extends LookupRange {
  firstVerseKey: string;
  lastVerseKey: string;
}
export default LookupRecord;
