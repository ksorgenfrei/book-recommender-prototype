import { describe, expect, test } from "vitest";

import type { Book, ReaderProfile, Rating, } from "../types/types";

import { defaultExperienceThresholds } from "../data/experienceThresholds";
import { getRecommendations } from "./getRecommendations";


//hand-written data for these tests instead of generated data to make it more deterministic, readable, and diagnostic
const testBooks: Book[] = [
    {
        id: 1,
        title: "Alpha Book",
        author: "Author One",
        genres: ["Fantasy"],
    },
    {
        id: 2,
        title: "Beta Book",
        author: "Author Two",
        genres: ["Fantasy"],
    },
    {
        id: 3,
        title: "Gamma Book",
        author: "Author Three",
        genres: ["Contemporary"],
    },
];

const testReaders: ReaderProfile[] = [
    {
        id: 1,
        displayName: "Reader One",
        dominantGenre: "Fantasy",
        booksReadCount: 25,
    },
    {
        id: 2,
        displayName: "Reader Two",
        dominantGenre: "Fantasy",
        booksReadCount: 100,
    },
    {
        id: 3,
        displayName: "Reader Three",
        dominantGenre: "Contemporary",
        booksReadCount: 100,
    },
    {
        id: 4,
        displayName: "Reader Four",
        dominantGenre: "Contemporary",
        booksReadCount: 300,
    },
];

const testRatings: Rating[] = [
    { id: 1, bookId: 1, readerId: 1, rating: 4 },
    { id: 2, bookId: 1, readerId: 2, rating: 5 },
    { id: 3, bookId: 1, readerId: 3, rating: 3 },

    { id: 4, bookId: 2, readerId: 1, rating: 5 },
    { id: 5, bookId: 2, readerId: 2, rating: 3 },
    { id: 6, bookId: 2, readerId: 4, rating: 4 },

    { id: 7, bookId: 3, readerId: 3, rating: 5 },
    { id: 8, bookId: 3, readerId: 4, rating: 4 },
];

// this is for testing the sorting specifically
const sortingTestRatings: Rating[] = [
    { id: 101, bookId: 1, readerId: 1, rating: 4 },
    { id: 102, bookId: 1, readerId: 2, rating: 4 },

    { id: 103, bookId: 2, readerId: 1, rating: 4 },
    { id: 104, bookId: 2, readerId: 2, rating: 4 },
    { id: 105, bookId: 2, readerId: 3, rating: 4 },

    { id: 106, bookId: 3, readerId: 1, rating: 5 },
    { id: 107, bookId: 3, readerId: 2, rating: 5 },
];

describe("getRecommendations", () => {
    test("returns all rated books when no filters are applied", () => {
        const results = getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: testRatings,
            targetGenre: "Any",
            cohortGenre: "Any",
            experienceFilter: "Any",
            experienceThresholds: defaultExperienceThresholds,
            sortOption: "averageRatingThenCount",
        });

        expect(results.map((recommendation) => recommendation.book.id)).toEqual([
            3,
            1,
            2,
        ]);
    });

    test("returns only books matching the selected target genre", () => {
        const results = getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: testRatings,
            targetGenre: "Fantasy",
            cohortGenre: "Any",
            experienceFilter: "Any",
            experienceThresholds: defaultExperienceThresholds,
            sortOption: "averageRatingThenCount",
        });

        expect(results.map((recommendation) => recommendation.book.id)).toEqual([
            1,
            2,
        ]);
    });

    test("uses only ratings from readers matching the selected cohort genre", () => {
        const results = getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: testRatings,
            targetGenre: "Any",
            cohortGenre: "Fantasy",
            experienceFilter: "Any",
            experienceThresholds: defaultExperienceThresholds,
            sortOption: "averageRatingThenCount",
        });

        expect(results.map((recommendation) => recommendation.book.id)).toEqual([
            1,
            2,
        ]);
    });

    test("uses only ratings from readers matching the selected experience level", () => {
        const results = getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: testRatings,
            targetGenre: "Any",
            cohortGenre: "Any",
            experienceFilter: "Intermediate",
            experienceThresholds: defaultExperienceThresholds,
            sortOption: "averageRatingThenCount",
        });

        expect(results.map((recommendation) => recommendation.book.id)).toEqual([
            3,
            1,
            2,
        ]);
    });

    test("applies target genre, cohort genre, and experience filters together", () => {
        const results = getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: testRatings,
            targetGenre: "Fantasy",
            cohortGenre: "Fantasy",
            experienceFilter: "Beginner",
            experienceThresholds: defaultExperienceThresholds,
            sortOption: "averageRatingThenCount",
        });

        expect(results.map((recommendation) => recommendation.book.id)).toEqual([
            2,
            1,
        ]);
    });

    test("returns an empty array when no ratings match the selected filters", () => {
        const results = getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: testRatings,
            targetGenre: "Contemporary",
            cohortGenre: "Fantasy",
            experienceFilter: "Any",
            experienceThresholds: defaultExperienceThresholds,
            sortOption: "averageRatingThenCount",
        });

        expect(results).toEqual([]);
    });


    test("sorts by highest average rating with an alphabetical tie break", () => {
        const results = getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: sortingTestRatings,
            targetGenre: "Any",
            cohortGenre: "Any",
            experienceFilter: "Any",
            experienceThresholds: defaultExperienceThresholds,
            sortOption: "averageRating",
        });

        expect(results.map((recommendation) => recommendation.book.id)).toEqual([
            3,
            1,
            2,
        ]);
    });

    test("sorts by most ratings with an alphabetical tie break", () => {
        const results = getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: sortingTestRatings,
            targetGenre: "Any",
            cohortGenre: "Any",
            experienceFilter: "Any",
            experienceThresholds: defaultExperienceThresholds,
            sortOption: "ratingCount",
        });

        expect(results.map((recommendation) => recommendation.book.id)).toEqual([
            2,
            1,
            3,
        ]);
    });

    test("sorts by average rating, then rating count", () => {
        const results = getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: sortingTestRatings,
            targetGenre: "Any",
            cohortGenre: "Any",
            experienceFilter: "Any",
            experienceThresholds: defaultExperienceThresholds,
            sortOption: "averageRatingThenCount",
        });

        expect(results.map((recommendation) => recommendation.book.id)).toEqual([
            3,
            2,
            1,
        ]);
    });

    test("sorts by most ratings, then highest average rating", () => {
        const results = getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: sortingTestRatings,
            targetGenre: "Any",
            cohortGenre: "Any",
            experienceFilter: "Any",
            experienceThresholds: defaultExperienceThresholds,
            sortOption: "ratingCountThenAverage",
        });

        expect(results.map((recommendation) => recommendation.book.id)).toEqual([
            2,
            3,
            1,
        ]);
    });

    test("stores the same number of ratings as the reported rating count", () => {
        const results = getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: testRatings,
            targetGenre: "Any",
            cohortGenre: "Any",
            experienceFilter: "Any",
            experienceThresholds: defaultExperienceThresholds,
            sortOption: "averageRatingThenCount",
        });

        results.forEach((recommendation) => {
            expect(recommendation.ratingCount).toBe(
                recommendation.ratingsUsed.length
            );
        });
    });

    test("calculates the average rating from the stored ratings used", () => {
        const results = getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: testRatings,
            targetGenre: "Any",
            cohortGenre: "Any",
            experienceFilter: "Any",
            experienceThresholds: defaultExperienceThresholds,
            sortOption: "averageRatingThenCount",
        });

        results.forEach((recommendation) => {
            const expectedAverage =
                recommendation.ratingsUsed.reduce(
                    (total, rating) => total + rating.rating,
                    0
                ) / recommendation.ratingsUsed.length;

            expect(recommendation.averageRating).toBeCloseTo(expectedAverage);
        });
    });

    test("does not store ratings from readers outside the selected cohort", () => {
        const results = getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: testRatings,
            targetGenre: "Any",
            cohortGenre: "Fantasy",
            experienceFilter: "Any",
            experienceThresholds: defaultExperienceThresholds,
            sortOption: "averageRatingThenCount",
        });

        results.forEach((recommendation) => {
            recommendation.ratingsUsed.forEach((rating) => {
                expect([1, 2]).toContain(rating.readerId);
            });
        });
    });

    test("returns an empty array safely when no ratings are available", () => {
        const results = getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: [],
            targetGenre: "Any",
            cohortGenre: "Any",
            experienceFilter: "Any",
            experienceThresholds: defaultExperienceThresholds,
            sortOption: "averageRatingThenCount",
        });

        expect(results).toEqual([]);
    });

    test("does not mutate the source data", () => {
        const originalBooks = structuredClone(testBooks);
        const originalReaders = structuredClone(testReaders);
        const originalRatings = structuredClone(testRatings);

        getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: testRatings,
            targetGenre: "Any",
            cohortGenre: "Any",
            experienceFilter: "Any",
            experienceThresholds: defaultExperienceThresholds,
            sortOption: "averageRatingThenCount",
        });

        expect(testBooks).toEqual(originalBooks);
        expect(testReaders).toEqual(originalReaders);
        expect(testRatings).toEqual(originalRatings);
    });

    test("uses custom thresholds when filtering readers by experience", () => {
        const customThresholds = {
            intermediateMinBooksRead: 40,
            experiencedMinBooksRead: 90,
        };

        const results = getRecommendations({
            books: testBooks,
            readerProfiles: testReaders,
            ratings: testRatings,
            targetGenre: "Any",
            cohortGenre: "Any",
            experienceFilter: "Experienced",
            experienceThresholds: customThresholds,
            sortOption: "averageRatingThenCount",
        });

        expect(results.map((recommendation) => recommendation.book.id)).toEqual([
            3,
            1,
            2,
        ]);
    });
});