import KalimatResultItem from './KalimatResultItem';

interface KalimatSearchAsYouTypeResultItem extends KalimatResultItem {
  score: number;
  matches: string;
  longestMatchedToken: string;
}

export default KalimatSearchAsYouTypeResultItem;
