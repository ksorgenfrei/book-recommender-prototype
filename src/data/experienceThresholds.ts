import type { ExperienceLevel, ExperienceThresholds } from "../types/types";

// stores exp lvls in the order they should be checked, gives the app actual runtime values to loop through
export const experienceLevels: ExperienceLevel[] = [
    "Beginner",
    "Intermediate",
    "Experienced",
];

// default threshold values to define how the system translates
// the system will derive the full ranges from these two numbers
export const defaultExperienceThresholds: ExperienceThresholds = {
    intermediateMinBooksRead: 50,
    experiencedMinBooksRead: 250,
};