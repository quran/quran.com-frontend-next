interface Pagination {
  startCursor?: string;
  endCursor?: string;
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
}

export default Pagination;
