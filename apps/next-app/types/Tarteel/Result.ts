import Event from './Event';
import PartialTranscript from './PartialTranscript';
import SearchResult from './SearchResult';

interface Result {
  event: Event;
  data: SearchResult | PartialTranscript;
}

export default Result;
