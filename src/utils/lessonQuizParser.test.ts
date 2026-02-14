import { describe, expect, it } from 'vitest';

import parseLessonQuizFromHtml from './lessonQuizParser';

describe('lessonQuizParser', () => {
  it('returns null when there is no question section', () => {
    const html = '<h3>Lesson & Reflection</h3><p>Some content</p>';
    expect(parseLessonQuizFromHtml(html)).toBeNull();
  });

  it('extracts a terminal question block with inline <br> options', () => {
    const html =
      '<p>Lesson body</p><h3><strong>Question on Ayah 1</strong></h3><p><strong>What is this?</strong><br>A) Option A<br>B) Option B<br>C) Option C<br>D) Option D</p><p></p>';

    const result = parseLessonQuizFromHtml(html);
    expect(result).not.toBeNull();
    expect(result?.contentWithoutQuizSection).toBe('<p>Lesson body</p>');
    expect(result?.headingText).toBe('Question on Ayah 1');
    expect(result?.question.question).toBe('What is this?');
    expect(result?.question.options.map((option) => option.text)).toEqual([
      'Option A',
      'Option B',
      'Option C',
      'Option D',
    ]);
    expect(result?.question.correctOptionId).toBe('a');
  });

  it('extracts a terminal question block with options in separate paragraphs', () => {
    const html =
      '<p>Lesson body</p><h3 dir="ltr"><strong>Question on Ayah 2</strong></h3><p><strong>Why?</strong></p><p>A) Because A</p><p>B) Because B</p><p>C) Because C</p><p>D) Because D</p><p></p>';

    const result = parseLessonQuizFromHtml(html);
    expect(result).not.toBeNull();
    expect(result?.headingText).toBe('Question on Ayah 2');
    expect(result?.question.question).toBe('Why?');
    expect(result?.question.options.map((option) => option.text)).toEqual([
      'Because A',
      'Because B',
      'Because C',
      'Because D',
    ]);
  });

  it('preserves wrapped text on the final option line', () => {
    const html =
      '<p>Lesson body</p><h3><strong>Question on Ayah 1</strong></h3><p><strong>What is this?</strong><br>A) Option A<br>B) Option B<br>C) Option C<br>D) Option D part 1<br>part 2</p>';

    const result = parseLessonQuizFromHtml(html);
    expect(result).not.toBeNull();
    expect(result?.question.options[3].text).toBe('Option D part 1 part 2');
  });

  it('keeps content that appears after the quiz block', () => {
    const html =
      '<p>Lesson body</p><h3><strong>Question on Ayah 24</strong></h3><p><strong>Why?</strong><br>A) Because A<br>B) Because B<br>C) Because C<br>D) Because D</p><p>Closing note after quiz.</p>';

    const result = parseLessonQuizFromHtml(html);
    expect(result).not.toBeNull();
    expect(result?.contentWithoutQuizSection).toBe(
      '<p>Lesson body</p><p>Closing note after quiz.</p>',
    );
  });

  it('uses the final question heading when multiple headings exist', () => {
    const html =
      '<p>Lesson body</p><h3><strong>Question on Ayah 1</strong></h3><p><strong>Q1?</strong><br>A) A1<br>B) B1<br>C) C1<br>D) D1</p><p></p><h3><strong>Question on Ayah 2</strong></h3><p><strong>Q2?</strong><br>A) A2<br>B) B2<br>C) C2<br>D) D2</p><p></p>';

    const result = parseLessonQuizFromHtml(html);
    expect(result).not.toBeNull();
    expect(result?.headingText).toBe('Question on Ayah 2');
    expect(result?.question.question).toBe('Q2?');
    expect(result?.contentWithoutQuizSection).toBe(
      '<p>Lesson body</p><h3><strong>Question on Ayah 1</strong></h3><p><strong>Q1?</strong><br>A) A1<br>B) B1<br>C) C1<br>D) D1</p><p></p>',
    );
  });

  it('parses the final question section when an earlier question heading is not a quiz block', () => {
    const html =
      '<p>Lesson intro</p><h3><strong>Question on Ayah 1</strong></h3><p>Reflect on this question in your journal.</p><h3><strong>Question on Ayah 2</strong></h3><p><strong>What now?</strong><br>A) A<br>B) B<br>C) C<br>D) D</p>';

    const result = parseLessonQuizFromHtml(html);
    expect(result).not.toBeNull();
    expect(result?.headingText).toBe('Question on Ayah 2');
    expect(result?.question.question).toBe('What now?');
    expect(result?.contentWithoutQuizSection).toBe(
      '<p>Lesson intro</p><h3><strong>Question on Ayah 1</strong></h3><p>Reflect on this question in your journal.</p>',
    );
  });

  it('returns null when the detected question block is malformed', () => {
    const html =
      '<p>Lesson body</p><h3><strong>Question on Ayah 1</strong></h3><p><strong>What is this?</strong><br>A) Option A<br>B) Option B<br>C) Option C</p>';

    expect(parseLessonQuizFromHtml(html)).toBeNull();
  });
});
