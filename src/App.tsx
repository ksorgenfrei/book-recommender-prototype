import Container from "react-bootstrap/Container";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import ListGroup from "react-bootstrap/ListGroup";

import { useState } from "react";
import { RecommendationFilters } from "./components/RecommendationFilters";

import { generatedBooks as books } from "./data/generatedBooks";
import { generatedReaderProfiles as readerProfiles } from "./data/generatedReaderProfiles";
import { generatedRatings as ratings } from "./data/generatedRatings";

import { genres } from "./data/genres";
import { defaultExperienceThresholds } from "./data/experienceThresholds";

import type { ExperienceFilter, GenreFilter, RecommendationSortOption, Recommendation, ReaderProfile } from "./types/types";

import { getRecommendations } from "./utils/getRecommendations"; // recommendation utility function
import { getExperienceLevel } from "./utils/getExperienceLevel";
import { MainNavigation } from "./components/MainNavigation";


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

type StarRatingProps = {
  rating: number;
  maxRating?: number;
};

function StarRating({ rating, maxRating = 5 }: StarRatingProps) {
  const ratingPercentage = Math.max(
    0,
    Math.min(100, (rating / maxRating) * 100)
  );

  return (
    <span className="star-rating" aria-hidden="true">
      <span className="star-rating-empty">★★★★★</span>
      <span
        className="star-rating-filled"
        style={{ width: `${ratingPercentage}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}

// get the books covers from Open Library
function getOpenLibraryCoverUrl(coverId: number) {
  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

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
    <Container className="py-4">
      <header className="app-header">
        <h1>User-Controlled Cohort-Based Book Recommendation Prototype</h1>

        <MainNavigation
          // if currentPage is readerProfile, highlight recommendations (since it's part of that main page)
          currentPage={currentPage === "readerProfile" ? "recommendations" : currentPage}
          onCurrentPageChange={setCurrentPage}
        />
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

          <Button
            type="button"
            variant="primary"
            onClick={() => setCurrentPage("recommendations")}>
            Explore recommendations
          </Button>
        </section>
      )}
      {currentPage === "recommendations" && (
        <section className="content-card">
          <h2>Recommendation Query</h2>
          <RecommendationFilters
            genres={genres}
            targetGenre={targetGenre}
            cohortGenre={cohortGenre}
            experienceFilter={experienceFilter}
            experienceThresholds={defaultExperienceThresholds}
            sortOption={sortOption}
            onTargetGenreChange={setTargetGenre}
            onCohortGenreChange={setCohortGenre}
            onExperienceFilterChange={setExperienceFilter}
            onSortOptionChange={setSortOption}
          />

          <Button
            type="button"
            variant="primary"
            className="mb-3"
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
          </Button>

          {submittedQuery !== null && (
            <Card
              as="section"
              className="query-summary mb-4 mt-4"
              aria-label="Current recommendation query"
            >
              <Card.Body>
                <Card.Subtitle as="h3" className="h5 mb-2">
                  Current query
                </Card.Subtitle>

                <p className="mb-0">
                  Showing <strong>{selectedTargetGenreDescription}</strong>{" "}
                  rated by <strong>{selectedCohortDescription}</strong>{" "}
                  and sorted by <strong>{selectedSortDescription}</strong>.
                </p>
              </Card.Body>
            </Card>
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
                  <Card className="mb-3">
                    <Card.Body>
                      <div className="recommendation-card-layout">
                        {recommendation.book.coverId !== undefined && (
                          <Image
                            src={getOpenLibraryCoverUrl(recommendation.book.coverId)}
                            alt={`Cover image of ${recommendation.book.title}`}
                            className="recommendation-cover"
                            rounded
                          />
                        )}

                        <div className="recommendation-card-content">
                          <Card.Title>{recommendation.book.title}</Card.Title>

                          <Card.Subtitle className="mb-2 text-muted">by {recommendation.book.author}</Card.Subtitle>

                          <p className="mb-2">
                            <StarRating rating={recommendation.averageRating} />{" "}

                            {recommendation.averageRating.toFixed(2)} {" "}

                            ({recommendation.ratingCount} rating
                            {recommendation.ratingCount === 1 ? "" : "s"})
                          </p>

                          <p className="mb-2 text-muted">
                            First published: {recommendation.book.firstPublished}
                          </p>
                          <div className="mb-2">
                            {recommendation.book.genres.map((genre) => (
                              <Badge key={genre} bg="secondary" className="me-1">
                                {genre}
                              </Badge>
                            ))}
                          </div>

                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            aria-expanded={selectedRecommendationBookId === recommendation.book.id}
                            onClick={() =>
                              setSelectedRecommendationBookId(
                                selectedRecommendationBookId === recommendation.book.id
                                  ? null
                                  : recommendation.book.id
                              )
                            }
                          >
                            {selectedRecommendationBookId === recommendation.book.id
                              ? "Hide ratings used"
                              : "View ratings used"}
                          </Button>
                        </div>
                      </div>

                      {selectedRecommendationBookId === recommendation.book.id && (
                        <div className="content-card mt-4">
                          <h3>
                            Ratings used for <em>{recommendation.book.title}</em>
                          </h3>

                          <p>
                            These {recommendation.ratingCount} ratings produced an average rating of{" "}
                            {recommendation.averageRating.toFixed(2)} out of 5.
                          </p>

                          <ListGroup className="ratings-used-list">
                            {recommendation.ratingsUsed.map((rating) => {
                              // Retrieve reader profile linked to this rating
                              const reader = readerProfilesById.get(rating.readerId);

                              // Fallback if no matching reader profile is found
                              if (reader === undefined) {
                                return (
                                  <ListGroup.Item key={`${rating.readerId}-${rating.bookId}`}>
                                    Reader profile unavailable for reader ID: {rating.readerId}.
                                  </ListGroup.Item>
                                );
                              }

                              // Calculate this reader's experience level using thresholds
                              const experienceLevel = getExperienceLevel(
                                reader.booksReadCount,
                                defaultExperienceThresholds
                              );

                              return (
                                <ListGroup.Item
                                  key={`${rating.readerId}-${rating.bookId}`}
                                  className="rating-evidence-item"
                                >
                                  <div className="rating-evidence-header">
                                    <Button
                                      type="button"
                                      variant="outline-primary"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedReaderId(reader.id);
                                        setCurrentPage("readerProfile");
                                      }}
                                    >
                                      {reader.displayName}
                                    </Button>

                                    <div className="rating-evidence-rating">
                                      <StarRating rating={rating.rating} />{" "}
                                      <span>({rating.rating}/5)</span>
                                    </div>
                                  </div>

                                  <div className="rating-evidence-meta">
                                    <Badge bg="secondary">{experienceLevel}</Badge>
                                    <span>{reader.booksReadCount} books read</span>
                                    <span aria-hidden="true">•</span>
                                    <span>Usually reads {reader.dominantGenre}</span>
                                  </div>
                                </ListGroup.Item>
                              );
                            })}
                          </ListGroup>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {currentPage === "readerProfile" && (
        <section className="content-card">
          <h2>Reader Profile</h2>

          <Button
            type="button"
            variant="primary"
            className="mb-3"
            size="sm"
            onClick={() =>
              setCurrentPage("recommendations")
            }>
            Back to recommendations
          </Button>

          {selectedReader === null ? (
            <p>No reader profile selected.</p>
          )
            : <>
              <Card className="mb-4 reader-profile-summary">
                <Card.Body>
                  <Card.Title>{selectedReader.displayName}</Card.Title>

                  <dl className="reader-profile-details">
                    <div>
                      <dt>Dominant genre</dt>
                      <dd>
                        <Badge bg="secondary">{selectedReader.dominantGenre}</Badge>
                      </dd>
                    </div>

                    <div>
                      <dt>Books read</dt>
                      <dd>{selectedReader.booksReadCount}</dd>
                    </div>

                    <div>
                      <dt>Experience level</dt>
                      <dd>
                        <Badge bg="primary">{selectedExperienceLevel}</Badge>
                      </dd>
                    </div>
                  </dl>
                </Card.Body>
              </Card>

              <h2>Rating history</h2>

              {selectedReaderRatings.length === 0 ? (
                <p>No ratings available.</p>
              ) : (
                <ul className="recommendations-list rating-history-list">
                  {selectedReaderRatings.map((rating) => {
                    const matchingBook = booksById.get(rating.bookId);

                    if (matchingBook === undefined) {
                      return (
                        <li key={`${rating.bookId}-${rating.readerId}`}>
                          <Card className="mb-3">
                            <Card.Body>
                              Book information unavailable for book ID: {rating.bookId}.
                            </Card.Body>
                          </Card>
                        </li>
                      );
                    }

                    return (
                      <li key={`${rating.bookId}-${rating.readerId}`}>
                        <Card className="mb-3">
                          <Card.Body>
                            <div className="recommendation-card-layout">
                              {matchingBook.coverId !== undefined && (
                                <Image
                                  src={getOpenLibraryCoverUrl(matchingBook.coverId)}
                                  alt={`Cover image of ${matchingBook.title}`}
                                  className="recommendation-cover"
                                  rounded
                                />
                              )}

                              <div className="recommendation-card-content">
                                <Card.Title>{matchingBook.title}</Card.Title>

                                <Card.Subtitle className="mb-2 text-muted">
                                  by {matchingBook.author}
                                </Card.Subtitle>

                                <p className="mb-2 text-muted">
                                  First published: {matchingBook.firstPublished}
                                </p>

                                <div className="mb-2">
                                  {matchingBook.genres.map((genre) => (
                                    <Badge key={genre} bg="secondary" className="me-1">
                                      {genre}
                                    </Badge>
                                  ))}
                                </div>

                                <p className="mb-0">
                                  <StarRating rating={rating.rating} />{" "}
                                  <span>({rating.rating}/5)</span>
                                </p>
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
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
    </Container>
  );
}

export default App;