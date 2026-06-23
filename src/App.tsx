import { useState } from "react";

import { generatedBooks as books } from "./data/generatedBooks";
import { generatedReaderProfiles as readerProfiles } from "./data/generatedReaderProfiles";
import { generatedRatings as ratings } from "./data/generatedRatings";

import { genres } from "./data/genres";
import { defaultExperienceThresholds } from "./data/experienceThresholds";

import type { ExperienceFilter, GenreFilter, RecommendationSortOption, Recommendation, ReaderProfile } from "./types/types";

import { getRecommendations } from "./utils/getRecommendations"; // recommendation utility function
import { getExperienceLevel } from "./utils/getExperienceLevel";


type Page = "home" | "recommendations" | "howItWorks" | "readerProfile"; // tell TypeScript that only one of those four page values can be shown

// store the sorting+filter values that were submitted with the Show Recommendations button (separate from dropdown values so that recommendations dont update automatically)
type SubmittedRecommendationQuery = {
  targetGenre: GenreFilter;
  cohortGenre: GenreFilter;
  experienceFilter: ExperienceFilter;
  sortOption: RecommendationSortOption;
}

// lookup from reader ID to reader profile to avoid searching the full readerProfiles array for every displayed rating
const readerProfilesById = new Map(
  readerProfiles.map((reader) => [reader.id, reader])
);

// lookup from book ID to book information
const booksById = new Map(
  books.map((book) => [book.id, book])
);

function App() {
  // store which main section is currently displayed
  const [currentPage, setCurrentPage] = useState<Page>("home");

  // useState stores the selected filter values
  const [targetGenre, setTargetGenre] = useState<GenreFilter>("Any");
  const [cohortGenre, setCohortGenre] = useState<GenreFilter>("Any");
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>("Any");
  // store the last filter combination submitted with the Show Recs 
  // null = user has not submitted a recs query yet
  const [submittedQuery, setSubmittedQuery] = useState<SubmittedRecommendationQuery | null>(null);
  // store ranking method selected by user
  const [sortOption, setSortOption] = useState<RecommendationSortOption>("averageRatingThenCount");
  // store the book ID for the rec whose contributing ratings the user wants to inspect. null = no rec selected
  const [selectedRecommendationBookId, setSelectedRecommendationBookId] = useState<Recommendation["book"]["id"] | null>(null);
  // store the reader ID for the reader profile the user wants to inspect. null = no reader selected
  const [selectedReaderId, setSelectedReaderId] = useState<ReaderProfile["id"] | null>(null);


  // Recommendation list
  // recs are only calculated after the user submits a query,
  // preventing the list from changing automatically when dropdown values change
  const recommendations = submittedQuery === null ? []
    : getRecommendations({
      books,
      readerProfiles,
      ratings,
      targetGenre: submittedQuery.targetGenre,
      cohortGenre: submittedQuery.cohortGenre,
      experienceFilter: submittedQuery.experienceFilter,
      experienceThresholds: defaultExperienceThresholds,
      sortOption: submittedQuery.sortOption,
    });

  const selectedReader = selectedReaderId === null ? null
    : readerProfilesById.get(selectedReaderId) ?? null;   // if the map lookup returns undefined, use null instead

  const selectedExperienceLevel = selectedReader === null ? null
    : getExperienceLevel(
      selectedReader.booksReadCount,
      defaultExperienceThresholds
    );

  //selected reader's full rating history
  const selectedReaderRatings = selectedReaderId === null ? []
    : ratings.filter(rating =>
      rating.readerId === selectedReaderId
    );

  // build a readable description of the selected book genre
  function getTargetGenreDescription(selectedTargetGenre: GenreFilter) {
    return selectedTargetGenre === "Any" ? "books of any genre" : `${selectedTargetGenre} books`;
  }

  // build a readable description of the selected reader cohort
  function getCohortDescription(selectedCohortGenre: GenreFilter, selectedExperienceFilter: ExperienceFilter) {
    if (selectedCohortGenre === "Any" && selectedExperienceFilter === "Any") {
      return "readers of any genre and any experience level";
    }
    if (selectedCohortGenre === "Any") {
      return `${selectedExperienceFilter.toLowerCase()} readers of any genre`;
    }

    if (selectedExperienceFilter === "Any") {
      return `readers who usually read ${selectedCohortGenre}`;
    }

    return `${selectedExperienceFilter.toLowerCase()} readers who usually read ${selectedCohortGenre}`;
  }

  // convert the internal sorting value into wording that can be shown to the user
  function getSortDescription(
    selectedSortOption: RecommendationSortOption
  ) {
    if (selectedSortOption === "averageRating") {
      return "highest average rating";
    }
    if (selectedSortOption === "ratingCount") {
      return "most ratings";
    }
    if (selectedSortOption === "averageRatingThenCount") {
      return "highest average rating, then most ratings";
    }
    if (selectedSortOption === "ratingCountThenAverage") {
      return "most ratings, then highest average rating";
    }
  }

  // these descs are now bosed on the submitted query,
  // not the live dropdown values
  const selectedTargetGenreDescription = submittedQuery === null ? ""
    : getTargetGenreDescription(submittedQuery.targetGenre);

  const selectedCohortDescription = submittedQuery === null ? ""
    : getCohortDescription(submittedQuery.cohortGenre, submittedQuery.experienceFilter);

  // describe the selected sorting method from the submitted query
  const selectedSortDescription = submittedQuery === null ? ""
    : getSortDescription(submittedQuery.sortOption);

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>User-Controlled Cohort-Based Book Recommendation Prototype</h1>

        <nav className="main-nav" aria-label="Main navigation">
          <button
            type="button"
            className="primary-button"
            onClick={() => setCurrentPage("home")}
            // tell assitive technologies which section is currently active
            aria-current={currentPage === "home" ? "page" : undefined}>
            Home
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => setCurrentPage("recommendations")}
            // tell assitive technologies which section is currently active
            aria-current={currentPage === "recommendations" ? "page" : undefined}>
            Recommendations
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => setCurrentPage("howItWorks")}
            // tell assitive technologies which section is currently active
            aria-current={currentPage === "howItWorks" ? "page" : undefined}>
            How It Works
          </button>
        </nav>
      </header>

      {currentPage === "home" && (
        <section className="content-card">
          <h2>About this prototype</h2>

          <p>This prototype aims to explore transparent, user-controlled book recommendations
            based on simulated reader profiles and genre and experience cohorts.</p>
          <p>Book recommendation filtering is user-customizable.
            Users can choose which reader cohort should influence recommendations, instead of relying on overall popularity,
            influencer-promoted recommendations, or ranking via opaque recommender algorithms.</p>
          <p>The prototype uses publicly available book metadata obtained from Open Library.
            Synthetic reader profile data and ratings were generated by a hand-written script
            to demonstrate functionality and simulate user behavior.
            No real reader profiles or personal data are used for this prototype.</p>

          <button
            type="button"
            className="primary-button"
            onClick={() => setCurrentPage("recommendations")}>
            Explore recommendations
          </button>
        </section>
      )}
      {currentPage === "recommendations" && (
        <section className="content-card">
          <h2>Recommendation Query</h2>
          <div className="filter-panel">
            <label className="filter-control">
              Books in genre:{" "}
              <select // creates dropdown menu
                value={targetGenre}
                onChange={(event) => setTargetGenre(event.target.value as GenreFilter)} // "as Genre" tells TypeScript to treat the selected option as one of the valid genre values instead of a plain string
              >
                <option value="Any">Any genre</option>
                {genres.map((genre) => ( // for each item in the genres array, create one <option>
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </label>


            <label className="filter-control">
              Rated by readers who usually read:{" "}
              <select
                value={cohortGenre}
                onChange={(event) => setCohortGenre(event.target.value as GenreFilter)}
              >
                <option value="Any">Any genre</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-control">
              Reader experience:{" "}
              <select
                value={experienceFilter}
                onChange={(event) =>
                  setExperienceFilter(event.target.value as ExperienceFilter)
                }
              >
                <option value="Any">Any experience</option>
                <option value="Beginner">
                  Beginner (0-{defaultExperienceThresholds.intermediateMinBooksRead - 1} books)
                </option>
                <option value="Intermediate">
                  Intermediate ({defaultExperienceThresholds.intermediateMinBooksRead}-{defaultExperienceThresholds.experiencedMinBooksRead - 1} books)
                </option>
                <option value="Experienced">
                  Experienced ({defaultExperienceThresholds.experiencedMinBooksRead}+ books)
                </option>
              </select>
            </label>

            <label className="filter-control">
              Sort by:{" "}
              <select
                value={sortOption}
                onChange={(event) =>
                  setSortOption(event.target.value as RecommendationSortOption)
                }>
                <option value="averageRating">
                  Highest average rating
                </option>

                <option value="ratingCount">
                  Most ratings
                </option>

                <option value="averageRatingThenCount">
                  Highest average rating, then most ratings
                </option>

                <option value="ratingCountThenAverage">
                  Most ratings, then highest average rating
                </option>
              </select>
            </label>

          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setSubmittedQuery({
                targetGenre,
                cohortGenre,
                experienceFilter,
                sortOption,
              });

              // close any ratings view opened for the previous query
              setSelectedRecommendationBookId(null);
              setSelectedReaderId(null);
            }}>
            Show recommendations
          </button>

          {submittedQuery !== null && (
            <p>
              Current query: Show <strong>{selectedTargetGenreDescription}</strong>{" "}
              rated by {" "} <strong>{selectedCohortDescription}</strong>,
              sorted by{" "}<strong>{selectedSortDescription}</strong>.
            </p>
          )}

          <h2>Recommendations</h2>

          {submittedQuery === null ? (
            // shows before user submits a query
            <p>Choose your recommendation filters, then select <strong>Show Recommendations</strong>.</p>
          ) : recommendations.length === 0 ? (
            // shows if there are no matching recs
            <p>No recommendations found for this selection. Try changing the book genre, reader genre, or experience level.</p>
          ) : (
            // shows when recs are available
            <ul className="recommendations-list">
              {recommendations.map((recommendation) => (
                <li key={recommendation.book.id}>
                  <strong>{recommendation.book.title}</strong> by {recommendation.book.author} - Average rating:{" "}
                  {recommendation.averageRating.toFixed(2)}  ({recommendation.ratingCount} ratings)

                  <button
                    type="button"
                    className="primary-button"
                    aria-expanded={
                      selectedRecommendationBookId === recommendation.book.id
                    }
                    onClick={() =>
                      setSelectedRecommendationBookId((currentBookId) =>
                        currentBookId === recommendation.book.id
                          ? null
                          : recommendation.book.id
                      )
                    }
                  >
                    {selectedRecommendationBookId === recommendation.book.id
                      ? "Hide ratings used"
                      : "View ratings used"}
                  </button>

                  {selectedRecommendationBookId === recommendation.book.id && (
                    <div className="content-card">
                      <h3>
                        Ratings used for {recommendation.book.title}
                      </h3>

                      <p>
                        These {recommendation.ratingCount} ratings produced an average rating of{" "}
                        {recommendation.averageRating.toFixed(2)}.
                      </p>

                      <ul>
                        {recommendation.ratingsUsed.map((rating) => {
                          // Retrieve reader profile linked to this rating
                          const reader = readerProfilesById.get(rating.readerId);

                          // fallback if no matching reader profile is found
                          if (reader === undefined) {
                            return (
                              <li key={`${rating.readerId}-${rating.bookId}`}>
                                Reader profile unavailable for reader ID: {rating.readerId}.
                              </li>
                            )
                          }

                          // calculate this reader's exp lvl using thresholds
                          const experienceLevel = getExperienceLevel(
                            reader.booksReadCount,
                            defaultExperienceThresholds
                          );

                          return (
                            <li key={`${rating.readerId}-${rating.bookId}`}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedReaderId(reader.id);
                                  setCurrentPage("readerProfile");
                                }}>
                                {reader.displayName}
                              </button>: {rating.rating}/5
                              {" - "}
                              {experienceLevel} ({reader.booksReadCount} books read, usually {reader.dominantGenre})
                            </li>
                          );
                        })}

                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {currentPage === "readerProfile" && (
        <section className="content-card">
          <h2>Reader Profile</h2>
          <button
            type="button"
            className="primary-button"
            onClick={() =>
              setCurrentPage("recommendations")
            }>
            Back to recommendations
          </button>
          {selectedReader === null ? (
            <p>No reader profile selected.</p>
          )
            : <>
              <dl>
                <dt>Reader name:</dt>
                <dd>{selectedReader.displayName}</dd>
                <dt>Dominant genre:</dt>
                <dd>{selectedReader.dominantGenre}</dd>
                <dt>Books read count:</dt>
                <dd>{selectedReader.booksReadCount}</dd>
                <dt>Experience level:</dt>
                <dd>{selectedExperienceLevel}</dd>
              </dl>

              <h2>Rating history</h2>

              {selectedReaderRatings.length === 0 ? (
                <p>No ratings available.</p>
              ) : (
                <ul>
                  {selectedReaderRatings.map((rating) => {
                    const matchingBook = booksById.get(rating.bookId);

                    if (matchingBook === undefined) {
                      return (
                        <li key={`${rating.bookId}-${rating.readerId}`}>
                          Book information unavailable for book ID: {rating.bookId}.
                        </li>
                      );
                    }

                    return (
                      <li key={`${rating.bookId}-${rating.readerId}`}>
                        <strong>{matchingBook.title}</strong> by {matchingBook.author} {" "}
                        ({matchingBook.genres.join(", ")}) -{" "}
                        {rating.rating}/5
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          }
        </section>
      )}

      {currentPage === "howItWorks" && (
        <section className="content-card">
          <h2>How it works</h2>

          <ol>
            <li>Select the genre of books you would like to see recommendations for.</li>
            <li>Select the dominant genre and reading experience level of the reader cohort whose ratings should be used.</li>
            <li>The prototype will calculate average book ratings using only ratings from the selected cohort.</li>
            <li>Select how recommendations should be ranked. Combined sorting options
              use the second criterion when results are tied on the first criterion.</li>
            <li>Rating counts show how many ratings from the selected cohort contributed
              to each recommendation.</li>
            <li>
              Select "View ratings used" to inspect the individual simulated ratings and
              reader characteristics that contributed to a recommendation.
            </li>
            <li>
              Select a reader name to open that simulated reader's profile, showing their
              dominant genre, experience level, books read count, and rating history.
            </li>
          </ol>

          <p>The recommendations are suitable for testing the prototype logic but
            should not be interpreted as evidence of real reader preferences, as the reader profiles and
            ratings are synthetically generated by a script.
            Some assumptions were made and constraints put on the data generator script to ensure realistic reflection of possible reader behavior.</p>
        </section>
      )}
    </main>
  );
}

export default App;