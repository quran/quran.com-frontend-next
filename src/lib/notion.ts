/* eslint-disable @typescript-eslint/naming-convention */
import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const retrieveDatabase = async (databaseId: string) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: 'Name',
        timestamp: 'created_time',
        direction: 'ascending',
      },
    ],
  });
  return response.results;
};

export const retrieveBlockChildren = async (blockId: string) => {
  const response = await notion.blocks.children.list({
    block_id: blockId,
  });
  return response.results;
};
