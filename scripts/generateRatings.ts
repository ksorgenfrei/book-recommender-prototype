// this script generates simulated ratings that connect generated readers to generated books
import { generatedBooks } from "../src/data/generatedBooks";
import { generatedReaderProfiles } from "../src/data/generatedReaderProfiles";

import { defaultExperienceThresholds } from "../src/data/experienceThresholds"; // give the script default exp boundaries
import { getExperienceLevel } from "../src/utils/getExperienceLevel"; // let the script calculate exp level

import type { Book, ReaderProfile } from "../src/types/types"; // type function params properly

// fixed seed produces the same rating-count pattern each time
const SEED = 67890;
// 70% of the the time, try to select a book matching reader's dominant genre
const DOMINANT_GENRE_SELECTION_CHANCE = 0.7;

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

// function to pick one random item from an array
function getRandomItem<T>(items: readonly T[]): T {
    if (items.length === 0) {
        throw new Error("Empty array. Cannot pick a random item.");
    }

    const randomIndex = Math.floor(random() * items.length);
    const selectedItem = items[randomIndex];

    if (selectedItem === undefined) {
        throw new Error("Random item selection failed.");
    }

    return selectedItem;
}

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

//
function selectBooksForReader(
    reader: ReaderProfile,
    plannedRatingCount: number
): Book[] {
    // how many books in the available catalogue of generated books a reader can rate (to avoid having more planned ratings than available books)
    const MAX_CATALOGUE_COVERAGE = 0.5;

    const maxCatalogueRatings = Math.ceil(generatedBooks.length * MAX_CATALOGUE_COVERAGE);

    // a reader can't rate more books than they read, more books than exist in the books dataset, or the entire books dataset
    const maxRatingCount = Math.min(plannedRatingCount, reader.booksReadCount, maxCatalogueRatings);

    const selectedBooks: Book[] = [];

    // stores the IDs of books that have already been selected. Set stores unique values, so no duplicates
    const selectedBookIds = new Set<number>();

    // keep selecting books until maxRatingCount is matched
    while (selectedBooks.length < maxRatingCount) {
        // decide whether this book selection attempt should be from the dominant genre
        const shouldPreferDominantGenre = random() < DOMINANT_GENRE_SELECTION_CHANCE;

        const candidateBooks = generatedBooks.filter((book) => {
            // check if book already selected (if in Set already)
            const alreadySelected = selectedBookIds.has(book.id);

            // if already selected, do not include
            if (alreadySelected) {
                return false;
            }

            // check if book belongs to dominant genre
            const matchesDominantGenre = book.genres.includes(reader.dominantGenre);

            // if this selection prefers dominant genre, keep only books that match the reader's dominant genre
            if (shouldPreferDominantGenre) {
                return matchesDominantGenre;
            }

            // otherwise, keep books across genres that do not match dominant genre
            return !matchesDominantGenre;
        });

        // fallback: list of selectable books if candidateBooks is empty (e.g. there are no unselected Fantasy books)
        const fallbackBooks = generatedBooks.filter((book) => !selectedBookIds.has(book.id));

        // decide whether to choose from candidateBooks or fallbackBooks
        const booksToChooseFrom = candidateBooks.length > 0 ? candidateBooks : fallbackBooks;

        // prevent infinite loop if all available books have already been selected
        if (booksToChooseFrom.length === 0) {
            break;
        }

        // pick one random book from available book selection choices
        const selectedBook = getRandomItem(booksToChooseFrom);

        // add to the reader's books to rate
        selectedBooks.push(selectedBook);

        // add selected book's ID to avoid duplicates
        selectedBookIds.add(selectedBook.id);
    }

    return selectedBooks;
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

        const plannedRatingCount = getRatingCountForReader(reader);
        const selectedBooks = selectBooksForReader(reader, plannedRatingCount);

        const dominantGenreSelections = selectedBooks.filter((book) =>
            book.genres.includes(reader.dominantGenre)
        ).length;

        const crossGenreSelections = selectedBooks.length - dominantGenreSelections;

        return {
            id: reader.id,
            displayName: reader.displayName,
            dominantGenre: reader.dominantGenre,
            booksReadCount: reader.booksReadCount,
            experienceLevel,
            plannedRatingCount,
            selectedBookCount: selectedBooks.length,
            dominantGenreSelections,
            crossGenreSelections,
        };
    })
);

