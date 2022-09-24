/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { it, expect } from 'vitest';

import { getAllChaptersData } from './chapter';
import { generateVerseKeysBetweenTwoVerseKeys } from './verseKeys';

it('generates verse keys within the same chapter', async () => {
  const chaptersData = await getAllChaptersData();
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '78:1', '78:2')).toEqual([
    '78:1',
    '78:2',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '78:1', '78:30')).toEqual([
    '78:1',
    '78:2',
    '78:3',
    '78:4',
    '78:5',
    '78:6',
    '78:7',
    '78:8',
    '78:9',
    '78:10',
    '78:11',
    '78:12',
    '78:13',
    '78:14',
    '78:15',
    '78:16',
    '78:17',
    '78:18',
    '78:19',
    '78:20',
    '78:21',
    '78:22',
    '78:23',
    '78:24',
    '78:25',
    '78:26',
    '78:27',
    '78:28',
    '78:29',
    '78:30',
  ]);
});

it('generates verse keys for 2 chapters', async () => {
  const chaptersData = await getAllChaptersData();
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:1', '113:1')).toEqual([
    '112:1',
    '112:2',
    '112:3',
    '112:4',
    '113:1',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:1', '113:2')).toEqual([
    '112:1',
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:1', '113:5')).toEqual([
    '112:1',
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:2', '113:1')).toEqual([
    '112:2',
    '112:3',
    '112:4',
    '113:1',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:2', '113:2')).toEqual([
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:2', '113:5')).toEqual([
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:4', '113:1')).toEqual([
    '112:4',
    '113:1',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:4', '113:2')).toEqual([
    '112:4',
    '113:1',
    '113:2',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:4', '113:5')).toEqual([
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
  ]);
});
it('generates verse keys for 3 chapters', async () => {
  const chaptersData = await getAllChaptersData();
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:1', '114:1')).toEqual([
    '112:1',
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:1', '114:2')).toEqual([
    '112:1',
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
    '114:2',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:1', '114:6')).toEqual([
    '112:1',
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
    '114:2',
    '114:3',
    '114:4',
    '114:5',
    '114:6',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:2', '114:1')).toEqual([
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:2', '114:2')).toEqual([
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
    '114:2',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:2', '114:6')).toEqual([
    '112:2',
    '112:3',
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
    '114:2',
    '114:3',
    '114:4',
    '114:5',
    '114:6',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:4', '114:1')).toEqual([
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:4', '114:2')).toEqual([
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
    '114:2',
  ]);
  expect(generateVerseKeysBetweenTwoVerseKeys(chaptersData, '112:4', '114:6')).toEqual([
    '112:4',
    '113:1',
    '113:2',
    '113:3',
    '113:4',
    '113:5',
    '114:1',
    '114:2',
    '114:3',
    '114:4',
    '114:5',
    '114:6',
  ]);
});
