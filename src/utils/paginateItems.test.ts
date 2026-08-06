import { describe, expect, test } from "vitest";

import { paginateItems } from "./paginateItems";

describe("paginateItems", () => {
  const items = Array.from({ length: 25 }, (_, index) => index + 1);

  test("returns the first page of items and the correct display range", () => {
    const result = paginateItems(items, 1, 10);

    expect(result).toStrictEqual({
      itemsForCurrentPage: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      totalPages: 3,
      firstDisplayedItemNumber: 1,
      lastDisplayedItemNumber: 10,
    });
  });

  test("returns a middle page of items and the correct display range", () => {
    const result = paginateItems(items, 2, 10);

    expect(result).toStrictEqual({
      itemsForCurrentPage: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      totalPages: 3,
      firstDisplayedItemNumber: 11,
      lastDisplayedItemNumber: 20,
    });
  });

  test("returns a partial final page and the correct display range", () => {
    const result = paginateItems(items, 3, 10);

    expect(result).toStrictEqual({
      itemsForCurrentPage: [21, 22, 23, 24, 25],
      totalPages: 3,
      firstDisplayedItemNumber: 21,
      lastDisplayedItemNumber: 25,
    });
  });

  test("returns one page when the number of items is below page size", () => {
    const shortList = [1, 2, 3, 4, 5];

    const result = paginateItems(shortList, 1, 10);

    expect(result).toStrictEqual({
      itemsForCurrentPage: [1, 2, 3, 4, 5],
      totalPages: 1,
      firstDisplayedItemNumber: 1,
      lastDisplayedItemNumber: 5,
    });
  });

  test("returns an empty result and zero display range for an empty list", () => {
    const result = paginateItems([], 1, 10);

    expect(result).toStrictEqual({
      itemsForCurrentPage: [],
      totalPages: 0,
      firstDisplayedItemNumber: 0,
      lastDisplayedItemNumber: 0,
    });
  });
});