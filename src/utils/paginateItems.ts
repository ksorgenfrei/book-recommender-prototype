export function paginateItems<T>(
  items: readonly T[],
  currentPage: number,
  itemsPerPage: number
) {
  const totalPages = Math.ceil(items.length / itemsPerPage);

  const firstItemIndex = (currentPage - 1) * itemsPerPage;

  const itemsForCurrentPage = items.slice(
    firstItemIndex,
    firstItemIndex + itemsPerPage
  );

  const firstDisplayedItemNumber =
    items.length === 0 ? 0 : firstItemIndex + 1;

  const lastDisplayedItemNumber = Math.min(
    firstItemIndex + itemsPerPage,
    items.length
  );

  return {
    itemsForCurrentPage,
    totalPages,
    firstDisplayedItemNumber,
    lastDisplayedItemNumber,
  };
}