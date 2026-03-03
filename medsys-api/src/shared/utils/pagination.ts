export function toSkipTake(page: number, limit: number): { skip: number; take: number } {
  const safePage = page > 0 ? page : 1;
  const safeLimit = limit > 0 ? limit : 20;
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}
