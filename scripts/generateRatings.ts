// this script generates simulated ratings that connect generated readers to generated books
import { generatedBooks } from "../src/data/generatedBooks";
import { generatedReaderProfiles } from "../src/data/generatedReaderProfiles";

import { defaultExperienceThresholds } from "../src/data/experienceThresholds"; // give the script default exp boundaries
import { getExperienceLevel } from "../src/utils/getExperienceLevel"; // let the script calculate exp level

import type { ReaderProfile } from "../src/types/types"; // type function params properly

// fixed seed produces the same rating-count pattern each time
const SEED = 67890;

function createSeededRandom(seed: number) {
    let currentSeed = seed;

    const multiplier = 9301;
    const increment = 49297;
    const modulus = 233280;

    return function random() {
        currentSeed = (currentSeed * multiplier + increment) % modulus;
        return currentSeed / modulus;
    };
}

const random = createSeededRandom(SEED);

// rating count function: return the number of ratings a reader should contribute
function getRatingCountForReader(reader: ReaderProfile): number {
    const experienceLevel = getExperienceLevel(
        reader.booksReadCount,
        defaultExperienceThresholds
    );

    let minRatingPercentage: number;
    let maxRatingPercentage: number;

    if (experienceLevel === "Beginner") {
        minRatingPercentage = 0.3;
        maxRatingPercentage = 0.7;
    } else if (experienceLevel === "Intermediate") {
        minRatingPercentage = 0.2;
        maxRatingPercentage = 0.5;
    } else {
        minRatingPercentage = 0.1;
        maxRatingPercentage = 0.35;
    }

    // choose a random percentage inside the range
    const ratingPercentage = minRatingPercentage + random() * (maxRatingPercentage - minRatingPercentage);

    // multiply reader's booksReadCount by the selected percentage
    const plannedRatingCount = Math.round(reader.booksReadCount * ratingPercentage);

    // every generated reader has at least one rating (later capped by available generated books)
    return Math.max(1, plannedRatingCount);
}


console.log("Generated dataset overview:\n");

console.log(`Books available: ${generatedBooks.length}`);
console.log(`Reader profiles available: ${generatedReaderProfiles.length}`);

console.table(
    generatedReaderProfiles.slice(0, 10).map((reader) => {
        const experienceLevel = getExperienceLevel(
            reader.booksReadCount,
            defaultExperienceThresholds
        );

        return {
            id: reader.id,
            displayName: reader.displayName,
            dominantGenre: reader.dominantGenre,
            booksReadCount: reader.booksReadCount,
            experienceLevel,
            plannedRatingCount: getRatingCountForReader(reader),
        };
    })
);

