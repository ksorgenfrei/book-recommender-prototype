import type { Rating } from "../types/types";

// ratings are stored outside book objects and reader profiles because they are a relationship between one reader and one book

export const ratings: Rating[] = [
    { id: 1, bookId: 1, readerId: 1, rating: 5 },
    { id: 2, bookId: 2, readerId: 1, rating: 3 },
    { id: 3, bookId: 4, readerId: 1, rating: 4 },

    { id: 4, bookId: 1, readerId: 2, rating: 4 },
    { id: 5, bookId: 5, readerId: 2, rating: 2 },

    { id: 6, bookId: 3, readerId: 3, rating: 5 },
    { id: 7, bookId: 1, readerId: 3, rating: 2 },

    { id: 8, bookId: 6, readerId: 4, rating: 5 },
    { id: 9, bookId: 2, readerId: 4, rating: 2 },

    { id: 10, bookId: 2, readerId: 5, rating: 5 },
    { id: 11, bookId: 5, readerId: 5, rating: 4 },

    { id: 12, bookId: 1, readerId: 6, rating: 4 },
    { id: 13, bookId: 4, readerId: 6, rating: 3 },
];