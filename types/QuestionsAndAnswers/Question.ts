import QuestionType from './QuestionType';

export enum AnswerStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
}

export enum QuestionStatus {
  NEW = 'New',
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  ANSWERED = 'Answered',
}

export type Answer = {
  id: string;
  body: string;
  answeredBy: string | null;
  status: AnswerStatus;
  language: string | null;
};

export type Question = {
  id: string;
  body: string;
  type: QuestionType;
  ranges: string[];
  surah: number;
  theme: string[] | null;
  summary: string | null;
  references: string[] | null;
  language: string | null;
  status: QuestionStatus;
  answers: Answer[];
};
