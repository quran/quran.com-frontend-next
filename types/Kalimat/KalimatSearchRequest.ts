import KalimatSearchAsYouTypeRequest from './KalimatSearchAsYouTypeRequest';

interface KalimatSearchRequest extends KalimatSearchAsYouTypeRequest {
  exactMatchesOnly?: number;
  getText?: number;
}

export default KalimatSearchRequest;
