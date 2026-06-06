export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export const getPaginationParams = (query: any): PaginationParams => {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(query.limit as string, 10) || 10);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};
