import { describe, expect, test } from "vitest";

import { defaultExperienceThresholds } from "../data/experienceThresholds";
import { getExperienceLevel } from "./getExperienceLevel";

describe("getExperienceLevel", () => {
  test.each([
    [0, "Beginner"],
    [49, "Beginner"],
    [50, "Intermediate"],
    [249, "Intermediate"],
    [250, "Experienced"],
  ])(
    "classifies a reader with %i books read as %s using default thresholds",
    (booksReadCount, expectedLevel) => {
      const result = getExperienceLevel(
        booksReadCount,
        defaultExperienceThresholds
      );

      expect(result).toBe(expectedLevel);
    }
  );
});

const customExperienceThresholds = {
  intermediateMinBooksRead: 40,
  experiencedMinBooksRead: 200,
};

test.each([
  [39, "Beginner"],
  [40, "Intermediate"],
  [199, "Intermediate"],
  [200, "Experienced"],
])(
  "classifies a reader with %i books read as %s using custom thresholds",
  (booksReadCount, expectedLevel) => {
    const result = getExperienceLevel(
      booksReadCount,
      customExperienceThresholds
    );

    expect(result).toBe(expectedLevel);
  }
);