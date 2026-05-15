// this file defines the data structures of the entities used by the book recommender

// the genre type is derived from the genre values in genres.ts, as these are fixed options, so this import is needed
import { genres } from "../data/genres"

export type Genre = (typeof genres)[number];

// not stored permanently, as this can change based on experience tresholds set by users. reader stores booksReadCount instead
export type ExperienceLevel = "Beginner" | "Intermediate" | "Experienced";

// possible values in reader experience filter
export type ExperienceFilter = "Any" | ExperienceLevel;

export type ExperienceThresholds = Record<
    ExperienceLevel,
    {
    minBooksRead: number;
    maxBooksRead?: number; // this one is optional because "Experienced" has no upper limit
    }
>;

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
};