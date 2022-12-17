import KalimatResultType from './KalimatResultType';

interface KalimatResultItem {
  id: string;
  enText: string;
  text: string;
  type: KalimatResultType;
  navigational: 1 | 0;
}

export default KalimatResultItem;
