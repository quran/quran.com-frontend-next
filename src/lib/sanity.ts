import { createClient, SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import groq from 'groq';

const isSanityEnabled = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

let sanityClient: SanityClient;

if (isSanityEnabled) {
  sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 'production' : 'staging',
    useCdn: false, // ensure fresh data
  });
}

export const executeGroqQuery = async (
  query: string,
  params?: Record<string, any>,
  isSingleItem = false,
) => {
  if (!isSanityEnabled) {
    if (isSingleItem) {
      return null;
    }
    return [];
  }

  const response = await sanityClient.fetch(groq`${query}`, params);
  return response;
};

export const getImageUrl = (source) => {
  if (!isSanityEnabled) {
    return '';
  }
  return imageUrlBuilder(sanityClient).image(source).url();
};
