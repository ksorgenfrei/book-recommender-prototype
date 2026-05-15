import type {
    ExperienceLevel,
    ExperienceThresholds,
} from "../types/types";

// calculate reader's experience from booksReadCount without using hardcoded numbers
// receives current threshold settings as an argument (to allow for customization)
export function getExperienceLevel(
    booksReadCount: number,
    thresholds: ExperienceThresholds
): ExperienceLevel {
    // determine exp lvl
    if (booksReadCount >= thresholds.experiencedMinBooksRead) {
        return "Experienced";
    }
    if (booksReadCount >= thresholds.intermediateMinBooksRead) {
        return "Intermediate";
    }
    return "Beginner";
}