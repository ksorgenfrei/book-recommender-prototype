// this script generates simulated ratings that connect generated readers to generated books
import { generatedBooks } from "../src/data/generatedBooks";
import { generatedReaderProfiles } from "../src/data/generatedReaderProfiles";

import { defaultExperienceThresholds } from "../src/data/experienceThresholds"; // give the script default exp boundaries
import { getExperienceLevel } from "../src/utils/getExperienceLevel"; // let the script calculate exp level

import type { Book, Rating, ReaderProfile } from "../src/types/types"; // type function params properly

// fixed seed produces the same rating-count pattern each time
const SEED = 67890;
// 70% of the the time, try to select a book matching reader's dominant genre
const DOMINANT_GENRE_SELECTION_CHANCE = 0.7;

const MAX_CATALOGUE_COVERAGE = 0.5;

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

// an object that allows the below function to return both plannedRatingCount and targetRatingCount for inspection purposes
type RatingCountPlan = {
    plannedRatingCount: number;
    targetRatingCount: number;
};

// rating count function: return the number of ratings a reader should contribute
function getRatingCountForReader(reader: ReaderProfile): RatingCountPlan {
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

    // multiply reader's booksReadCount by the selected percentage -> intended num of ratings with minimum of 1
    const plannedRatingCount = Math.max(1, Math.round(reader.booksReadCount * ratingPercentage));
    // max number of books this reader should rate from the generated books catalogue
    const maxCatalogueRatings = Math.ceil(generatedBooks.length * MAX_CATALOGUE_COVERAGE);

    const targetRatingCount = Math.min(
        Math.max(1, plannedRatingCount),
        reader.booksReadCount,
        maxCatalogueRatings
    );

    // final target rating count (reader cannot rate fewer than 1 book, more books than read, more than the allowed proportion of the generated catalogue)
    return { plannedRatingCount, targetRatingCount };
}

//
function selectBooksForReader(
    reader: ReaderProfile,
    targetRatingCount: number
): Book[] {

    // getRatingCountForReader() already applies the main constraints but this prevents
    // the selector from trying to choose more unique books than exist in the generated books catalogue
    const maxRatingCount = Math.min(targetRatingCount, generatedBooks.length);

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

function generateRatingValue(reader: ReaderProfile, book: Book): number {
    //check whther the selected book belongs to the reader's dominant genre
    const matchesDominantGenre = book.genres.includes(reader.dominantGenre);

    // generate random decimal betw. 0 and 1. used to choose a rating according to probability ranges below
    const chance = random();

    // if book matches dominant genre, use rating distribution biased slightly higher
    if (matchesDominantGenre) {
        // 3% chance of 1 star rating
        if (chance < 0.05) {
            return 1;
        }
        // 7% chance of 2 star rating
        if (chance < 0.1) {
            return 2;
        }
        if (chance < 0.3) {
            return 3;
        }
        if (chance < 0.75) {
            return 4;
        }
        return 5;
    }
    // if book does not match dominant genre, use a more mixed rating distribution
    if (chance < 0.1) {
        return 1;
    }
    if (chance < 0.35) {
        return 2;
    }
    if (chance < 0.7) {
        return 3;
    }
    if (chance < 0.9) {
        return 4;
    }
    return 5;
}

function generateRatings(): Rating[] {
    const generatedRatings: Rating[] = [];

    // first rating ID (increases with every generated rating)
    let nextRatingId = 1;

    // loop through every generated reader profile
    for (const reader of generatedReaderProfiles) {
        // how many ratings the current reader should contribute
        const ratingCountPlan = getRatingCountForReader(reader);

        // select the books for this reader to rate
        const selectedBooks = selectBooksForReader(reader, ratingCountPlan.targetRatingCount);

        // loop through each selected book and turn it into a Rating record
        for (const book of selectedBooks) {
            // create one Rating object
            const rating: Rating = {
                id: nextRatingId,
                bookId: book.id,
                readerId: reader.id,
                rating: generateRatingValue(reader, book),
            };

            // add Rating obj to ratings array
            generatedRatings.push(rating);

            nextRatingId++;
        }
    }
    return generatedRatings;
}

const generatedRatings = generateRatings();

console.log("Generated dataset overview:\n");

console.log(`Books available: ${generatedBooks.length}`);
console.log(`Reader profiles available: ${generatedReaderProfiles.length}`);

console.table(
    generatedReaderProfiles.slice(0, 10).map((reader) => {
        const experienceLevel = getExperienceLevel(
            reader.booksReadCount,
            defaultExperienceThresholds
        );

        const ratingCountPlan = getRatingCountForReader(reader);

        const selectedBooks = selectBooksForReader(
            reader,
            ratingCountPlan.targetRatingCount
        );

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
            plannedRatingCount: ratingCountPlan.plannedRatingCount,
            targetRatingCount: ratingCountPlan.targetRatingCount,
            selectedBookCount: selectedBooks.length,
            dominantGenreSelections,
            crossGenreSelections,
        };
    })
);

console.log(`Ratings generated: ${generatedRatings.length}`);

console.table(
    generatedRatings.slice(0, 20).map((rating) => {
        const reader = generatedReaderProfiles.find(
            (readerProfile) => readerProfile.id === rating.readerId
        );

        const book = generatedBooks.find(
            (generatedBook) => generatedBook.id === rating.bookId
        );

        return {
            id: rating.id,
            reader: reader?.displayName,
            readerGenre: reader?.dominantGenre,
            book: book?.title,
            bookGenres: book?.genres.join(", "),
            rating: rating.rating,
        };
    })
);
