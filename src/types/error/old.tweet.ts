export enum OldTweetErrorCode {
    LIMIT_QUERY_PARAM_TOO_BIG = 'Limit must be less equal than 100',
    ORDER_QUERY_PARAM_INVALID = 'Order must be "asc" or "desc"',
    LAST_ID_QUERY_PARAM_INVALID = 'LastId must be a number greater than 0'
}