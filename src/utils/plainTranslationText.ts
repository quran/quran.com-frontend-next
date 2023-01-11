// Remove html tags and other special characters from translation text
const getPlainTranslationText = (translationText: string): string => {
  // Remove the sup tags and all the content inside them
  return translationText.replace(/<sup[^>]*>.*?<\/sup>/g, '');
};

export default getPlainTranslationText;
