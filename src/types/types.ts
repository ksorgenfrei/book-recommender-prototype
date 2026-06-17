// this file defines the data structures of the entities used by the book recommender

// the genre type is derived from the genre values in genres.ts, as these are fixed options, so this import is needed
import { genres } from "../data/genres"

export type Genre = (typeof genres)[number];
export type GenreFilter = "Any" | Genre; // add Any to make genre selection optional
// possible values in reader experience filter
export type ExperienceFilter = "Any" | ExperienceLevel;

// ranking methods users can select for recs
export type RecommendationSortOption =
    | "averageRating"
    | "ratingCount"
    | "averageRatingThenCount"
    | "ratingCountThenAverage";

// not stored permanently, as this can change based on experience thresholds set by users. reader stores booksReadCount instead
export type ExperienceLevel = "Beginner" | "Intermediate" | "Experienced";

export type ExperienceThresholds = {
    intermediateMinBooksRead: number;
    experiencedMinBooksRead: number;
};

export type Book = {
    id: number;
    title: string;
    author: string;
    genres: Genre[]; // a book can belong to more than one genre

    // these are optional for now so the current hand-written dataset does not have to be changed immediately
    openLibraryWorkId?: string;
    firstPublished?: number;
    coverId?: number;
};

export type ReaderProfile = {
    id: number;
    displayName: string;
    dominantGenre: Genre;
    booksReadCount: number;
};

export type Rating = {
    id: number;
    bookId: number;
    readerId: number;
    rating: number;
};

export type Recommendation = {
    book: Book;
    averageRating: number;
    ratingCount: number;
    // store exact ratings used to calculate this rec (to later display them to users)
    ratingsUsed: Rating[];
};