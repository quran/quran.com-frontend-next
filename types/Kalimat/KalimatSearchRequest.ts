import KalimatSearchAsYouTypeRequest from './KalimatSearchAsYouTypeRequest';

interface KalimatSearchRequest extends KalimatSearchAsYouTypeRequest {
  exactMatchesOnly?: 1 | 0;
  getText?: 1 | 0;
}

export default KalimatSearchRequest;
