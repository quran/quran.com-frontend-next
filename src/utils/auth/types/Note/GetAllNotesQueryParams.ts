interface GetAllNotesQueryParams {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  withAttachedEntities?: boolean;
}

export default GetAllNotesQueryParams;
