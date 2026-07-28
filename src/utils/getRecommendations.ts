// this contains the recommendation logic that was initially written in App.tsx for the POC

// imports used by TypeScript for checking the structure of the data
import type {
    Book,
    ExperienceFilter,
    ExperienceThresholds,
    GenreFilter,
    Rating,
    ReaderProfile,
    Recommendation,
    RecommendationSortOption,
} from "../types/types";

import { getExperienceLevel } from "./getExperienceLevel";

// type to define the shape of the object that must be passed to getRecommendations().
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
    targetGenre: GenreFilter;

    // cohort genre (controls which simulated readers are used to calculate recs)
    cohortGenre: GenreFilter;

    // the selected reader experience filter
    experienceFilter: ExperienceFilter;

    // current experience threshold settings
    experienceThresholds: ExperienceThresholds;

    // determines ranking of recs results
    sortOption: RecommendationSortOption;
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
    sortOption,
}: GetRecommendationsParams): Recommendation[] {
    const matchingReaders = readerProfiles.filter((reader) => {
        // find readers of selected cohort (their dominant genre), if "Any", all reader dominant genres are allowed
        const matchesCohortGenre = cohortGenre === "Any" || reader.dominantGenre === cohortGenre;

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
        .filter((book) => {
            // if targetGenre is "Any", keep books from all genres, otherwise, keep only books in selected target genre
            return targetGenre === "Any" || book.genres.includes(targetGenre);
        })

        // for each remaining book, calculate recommendation statistics
        .map((book) => {
            // find ratings for this book from cohort ratings
            const relevantRatings = matchingRatings.filter(
                (rating) => rating.bookId === book.id
            );

            // count the ratings
            const ratingCount = relevantRatings.length;

            // calculate avg rating
            // 1. .reduce() to add up all rating values
            // 2. divide by ratingCount to get mean avg
            // if no ratings use 0
            const averageRating =
                ratingCount > 0
                    ? relevantRatings.reduce((sum, rating) => sum + rating.rating, 0) / ratingCount
                    : 0;

            // return a Recommendation object, the book is a nested object (e.g. recommendation.book.title)
            return {
                book,
                ratingCount,
                averageRating,
                ratingsUsed: relevantRatings,
            };
        })

        // remove books that have no ratings
        .filter((recommendation) => recommendation.ratingCount > 0)
        // sort by descending avg rating
        .sort((a, b) => {
            // compare averages at two decimal places
            const averageDifference = Math.round(b.averageRating * 100) - Math.round(a.averageRating * 100);
            const ratingCountDifference = b.ratingCount - a.ratingCount;
            const titleDifference =  a.book.title.localeCompare(b.book.title);

            // apply selected ranking option
            switch (sortOption) {
                case "averageRating":
                    return (
                        averageDifference || titleDifference
                    );
                
                case "ratingCount":
                    return (
                        ratingCountDifference || titleDifference
                    );
                
                case "averageRatingThenCount":
                    return (
                        averageDifference || ratingCountDifference || titleDifference
                    );
                
                case "ratingCountThenAverage":
                    return (
                        ratingCountDifference || averageDifference || titleDifference
                    );
                
                default:
                    // safe fallback in case of unexpected value
                    return averageDifference || titleDifference;
            }
        })
}
