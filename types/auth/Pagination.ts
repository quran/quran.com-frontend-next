interface Pagination {
  startCursor?: string;
  endCursor?: string;
  hasNextPage: boolean;
}

export default Pagination;
