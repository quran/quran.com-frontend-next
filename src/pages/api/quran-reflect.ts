import getReflectionData from 'src/api';

export default async function handler(req, res) {
  const { chapterId, verseNumber, quranFont, mushafLines, translation } = req.query;

  const data = await getReflectionData({
    chapterId,
    verseNumber,
    quranFont,
    mushafLines,
    translation,
  });

  res.status(200).json(data);
}
