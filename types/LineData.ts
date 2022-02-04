import Word from './Word';

export default class LineData {
  lineNumber: string;
  protected lineVerses: {};
  protected lineWords: Word[];

  constructor(lineNumber:string) {
    this.lineNumber = lineNumber;
    this.lineVerses = {};
    this.lineWords = [];
  }

  addWord(word: Word) {
    this.lineVerses[word.verseKey] ||= [];
    this.lineVerses[word.verseKey].push(word);
    this.lineWords.push(word);
  }

  verseKeys() {
    return Object.keys(this.lineVerses);
  };

  verseWords(key: string){
    return this.lineVerses[key];
  }

  words(){
    return this.lineWords;
  }
}
