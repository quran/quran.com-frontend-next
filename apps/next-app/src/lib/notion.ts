/* eslint-disable @typescript-eslint/naming-convention */
import { Client } from '@notionhq/client';

const isNotionEnabled = () => {
  return (process.env.NOTION_TOKEN) ? true : false;
}

let notion: Client;

if (isNotionEnabled) {
  notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });
}

export const retrieveDatabase = async (databaseId: string) => {
  if (!isNotionEnabled) {
    return [];
  }

  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
  });
  return response.results;
};

export const retrieveBlockChildren = async (blockId: string) => {
  if (!isNotionEnabled) {
    return [];
  }

  const response = await notion.blocks.children.list({
    block_id: blockId,
  });
  return response.results;
};

export const retrievePage = async (pageId: string) => {
  if (!isNotionEnabled) {
    return [];
  }

  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
};
