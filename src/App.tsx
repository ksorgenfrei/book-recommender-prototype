import { useState } from "react";
import { books } from "./data/books";
import { readerProfiles } from "./data/readerProfiles";
import { ratings } from "./data/ratings";
import { genres } from "./data/genres";
import { defaultExperienceThresholds } from "./data/experienceThresholds";

import type { ExperienceFilter, Genre } from "./types/types";

import { getRecommendations } from "./utils/getRecommendations"; // recommendation utility function
import { getExperienceLevel } from "./utils/getExperienceLevel";

function App() {

  // useState stores the selected filter values
  const [targetGenre, setTargetGenre] = useState<Genre>("Romance");
  const [cohortGenre, setCohortGenre] = useState<Genre>("Fantasy");
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>("Any");

  // Recommendation list
  const recommendations = getRecommendations({
    books,
    readerProfiles,
    ratings,
    targetGenre,
    cohortGenre,
    experienceFilter,
    experienceThresholds: defaultExperienceThresholds,
  });
  
  // Helper function: given bookId, find matching book title
  const getBookTitle = (bookId: number) => {
    const book = books.find((b) => b.id === bookId);
    return book ? book.title : "Unknown book";
  };

  // Helper function: given readerId, find matching simulated reader name
  const getReaderName = (readerId: number) => {
    const reader = readerProfiles.find((r) => r.id === readerId);
    return reader ? reader.displayName : "Unknown reader";
  };

  const selectedCohortDescription =
    experienceFilter === "Any"
      ? `${cohortGenre} readers of any experience level`
      : `${experienceFilter.toLowerCase()} ${cohortGenre} readers`;

  return (
    <main>
      <h1>User-Controlled Cohort-Based Book Recommendation Prototype</h1>
      <p>Interactive prototype for exploring cohort-based book recommendations</p>

      <h2>Recommendation Query</h2>
      <div>
        <label>
          Books in genre:{" "}
          <select // creates dropdown menu
            value={targetGenre}
            onChange={(event) => setTargetGenre(event.target.value as Genre)} // "as Genre" tells TypeScript to treat the selected option as one of the valid genre values instead of a plain string
          >
            {genres.map((genre) => ( // for each item in the genres array, create one <option>
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>

        {/*add left margin so second dropdown doest touch the first, moved to CSS later*/}
        <label style={{ marginLeft: "1rem" }}>
          Rated by readers who usually read:{" "}
          <select
            value={cohortGenre}
            onChange={(event) => setCohortGenre(event.target.value as Genre)}
          >
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>
        
        <label style={{ marginLeft: "1rem" }}>
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
                Intermediate ({defaultExperienceThresholds.intermediateMinBooksRead}-{defaultExperienceThresholds.experiencedMinBooksRead -1} books)
              </option>
              <option value="Experienced">
                Experienced ({defaultExperienceThresholds.experiencedMinBooksRead}+ books)
              </option>
            </select>
        </label>

      </div>

      <p>
        Current query: Show <strong>{targetGenre}</strong> books rated by {" "} <strong>{selectedCohortDescription}</strong>.
      </p>

      <h2>Recommendations</h2>
      
      <ul>
        {/* Render rec results after filtering and ranking */}
        {recommendations.map((recommendation) => (
          <li key={recommendation.book.id}>
            <strong>{recommendation.book.title}</strong> by {recommendation.book.author} - Average rating:{" "}
            {recommendation.averageRating.toFixed(2)}  ({recommendation.ratingCount} ratings)
          </li>
        ))}
      </ul>
      
      <br></br>
      <br></br>
      <h2>Available Books</h2>

      <ul>
        {books.map((book) => (// for each book in the books array, create one list item, key={book.id} is used since react needs a unique key for each rendered item in a list for tracking
          <li key={book.id}>
            <strong>{book.title}</strong> by {book.author} - <em>{book.genres.join(", ")}</em>
          </li>
        ))}
      </ul>

      <h2>Simulated Reader Profiles</h2>
      <ul>
        {readerProfiles.map((reader) => (
          <li key={reader.id}>
            <strong>{reader.displayName}</strong> usually reads {" "}
            <em>{reader.dominantGenre}</em> - {reader.booksReadCount} books read - {" "}
            <strong>
              {getExperienceLevel(
                reader.booksReadCount,
                defaultExperienceThresholds
              )}
            </strong>
          </li>
        ))}
      </ul>

      <h2>Ratings</h2>
      <ul>
        {ratings.map((rating) => (
          <li key={rating.id}>
            <strong>{getReaderName(rating.readerId)}</strong> rated{" "}
            <strong>{getBookTitle(rating.bookId)}</strong> {rating.rating}/5.
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;