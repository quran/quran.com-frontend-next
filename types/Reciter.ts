interface Reciter {
  id: number;
  name: string;
  recitationStyle: string;
  relativePath: string;
  profilePicture?: string;
  coverImage?: string;
  bio?: string;
  qirat?: {
    languageName: string;
    name: string;
  };
  style?: {
    languageName: string;
    name: string;
  };
  translatedName?: {
    languageName: string;
    name: string;
  };
}
export default Reciter;
