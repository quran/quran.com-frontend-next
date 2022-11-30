import KalimatSearchAsYouTypeRequest from './KalimatSearchAsYouTypeRequest';

interface KalimatSearchRequest extends KalimatSearchAsYouTypeRequest {
  exactMatchesOnly?: number;
}

export default KalimatSearchRequest;
