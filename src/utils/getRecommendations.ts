// this contains the recommendation logic that was initially written in App.tsx for the POC

// imports used by TypeScript for checking the structure of the data
import type {
    Book,
    ExperienceFilter,
    ExperienceThresholds,
    Genre,
    Rating,
    ReaderProfile,
    Recommendation,
} from "../types/types";

import { getExperienceLevel } from "./getExperienceLevel";

// type to define the shope of the object that must be passed to getRecommendations().
// instead of passing five separate arguments like books, readerProfiles etc.,
// one object is passed to make the function call clearer because values are named
type GetRecommendationsParams = {
    // array of all available books
    books: Book[];

    // array of all simulated reader profiles
    readerProfiles: ReaderProfile[];

    // array of all ratings, connecting one reader, one book, one rating value
    ratings: Rating[];

    // selected book genre (controls which books are eligible to appear in recs list)
    targetGenre: Genre;

    // cohort genre (controls which simulated readers are used to calculate recs)
    cohortGenre: Genre;

    // the selected reader experience filter
    experienceFilter: ExperienceFilter;

    // current experience threshold settings
    experienceThresholds: ExperienceThresholds;
};

// calculate the ranked recommendation list
// take all books, reader profiles, ratings, target genre, and cohort genre
// return an array of Recommendation object containing the book itself, avg rating from
// cohort, number of ratings from cohort
export function getRecommendations({
    books,
    readerProfiles,
    ratings,
    targetGenre,
    cohortGenre,
    experienceFilter,
    experienceThresholds,
}: GetRecommendationsParams): Recommendation[] {
    const matchingReaders = readerProfiles.filter((reader) => {
        // find readers of selected cohort (their dominant genre)
        const matchesCohortGenre = reader.dominantGenre === cohortGenre;

        // calculate this reader's exp lvl from booksReadCount & current threshold settings
        const calculatedReaderExperience = getExperienceLevel(
            reader.booksReadCount,
            experienceThresholds
        );

        // check whether reader matches selected experience filter
        const matchesExperienceFilter =
            experienceFilter === "Any" || // all exp lvls allowed
            calculatedReaderExperience === experienceFilter;

        return matchesCohortGenre && matchesExperienceFilter;
    });

    // extract IDs of matching readers, since ratings use readerID
    const matchingReaderIds = matchingReaders.map((reader) => reader.id);

    // keep ratings by readers in selected cohort
    const matchingRatings = ratings.filter((rating) =>
        matchingReaderIds.includes(rating.readerId)
    );

    //  build recs list from books array
    return books
        // filter books by selected target genre
        .filter((book) => book.genres.includes(targetGenre))

        // for each remaining book, calculate recommendation statistics
        .map((book) => {
            // find ratings for this book from cohort ratings
            const relevantRatings = matchingRatings.filter(
                (rating) => rating.bookId === book.id
            );

            // count the ratings
            const ratingCount = relevantRatings.length;

            // calculate avg rating. 1. .reduce() to add up all rating values, 2. divide by ratingCount to get mean avg, if no ratings use 0
            const averageRating =
                ratingCount > 0
                    ? relevantRatings.reduce((sum, rating) => sum + rating.rating, 0) / ratingCount
                    : 0;

            // return a Recommendation object, the book is a nested objects (e.g. recommendation.book.title)
            return {
                book,
                ratingCount,
                averageRating,
            };
        })

        // remove books that have no ratings
        .filter((recommendation) => recommendation.ratingCount > 0)
        // sort by descending avg rating
        .sort((a, b) => b.averageRating - a.averageRating);
}
