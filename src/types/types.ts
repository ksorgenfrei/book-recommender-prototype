// this file defines the data structures of the entities used by the book recommender

// the genre type is derived from the genre values in genres.ts, as these are fixed options, so this import is needed
import { genres } from "../data/genres"

export type Genre = (typeof genres)[number];

export type Book = {
    id: number;
    title: string;
    author: string;
    genres: Genre[];
};

export type ReaderProfile = {
    id: number;
    displayName: string;
    dominantGenre: Genre;
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