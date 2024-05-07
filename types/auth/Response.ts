export type Pagination = {
  startCursor?: string;
  endCursor?: string;
  hasNextPage: boolean;
  hasPreviousPage?: boolean;
};

/**
 * inspired by http://docs.oasis-open.org/odata/odata-json-format/v4.0/errata02/os/odata-json-format-v4.0-errata02-os-complete.html#_Toc403940655
 * Notes:
 * - we should use string as error code in the future, example https://stripe.com/docs/error-codes , a lot easier to understand compared to number
 * - another example https://developers.notion.com/reference/errors
 */
type Error = {
  code: string;
  message: string;
  details?: Record<string, any>;
};

export type Response<Data = unknown> = {
  success: boolean;
  data?: Data;
  error?: Error;
  pagination?: Pagination;
};
