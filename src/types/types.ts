// this file defines the data structures of the entities used by the book recommender

// Using a union type for genre restricts genre values to the ones listed
export type Genre =
    | "Fantasy"
    | "Romance"
    | "Sci-Fi"
    | "Contemporary"
    | "Classic";

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