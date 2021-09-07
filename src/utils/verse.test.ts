import { sortVerseWordPosition } from './verse';

describe('sort verse word position', () => {
  it('should sort based on chapter', () => {
    const input = ['3:0:0', '2:0:0'];
    const expected = ['2:0:0', '3:0:0'];

    expect(sortVerseWordPosition(input)).toEqual(expected);
  });

  it('should sort based on chapter', () => {
    const input = ['2:3:0', '2:2:0'];
    const expected = ['2:2:0', '2:3:0'];
    const result = sortVerseWordPosition(input);

    expect(result).toEqual(expected);
  });

  it('should sort based on word position', () => {
    const input = ['2:2:2', '2:2:1'];
    const expected = ['2:2:1', '2:2:2'];
    const result = sortVerseWordPosition(input);

    expect(result).toEqual(expected);
  });

  it('can sort with multi digit position', () => {
    const input = ['2:2:2', '2:2:10'];
    const expected = ['2:2:2', '2:2:10'];
    const result = sortVerseWordPosition(input);

    expect(result).toEqual(expected);
  });

  it('can sort with multi digit verse', () => {
    const input = ['2:9:2', '2:10:2'];
    const expected = ['2:9:2', '2:10:2'];
    const result = sortVerseWordPosition(input);

    expect(result).toEqual(expected);
  });
});
