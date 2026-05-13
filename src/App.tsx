import { useState } from "react";
import { books } from "./data/books";
import { readerProfiles } from "./data/readerProfiles";
import { ratings } from "./data/ratings";
import { genres } from "./data/genres";
import type { Genre } from "./types/types";

function App() {

  // useState stores the selected filter values
  const [targetGenre, setTargetGenre] = useState<Genre>("Romance");
  const [cohortGenre, setCohortGenre] = useState<Genre>("Fantasy");

  // filter reader profiles to keep only the ones whose dominant genre matches the selected cohort genre
  const matchingReaders = readerProfiles.filter(
    (reader) => reader.dominantGenre === cohortGenre
  );

  // find matching readers and extract their IDs for later matching against ratings
  const matchingReaderIds = matchingReaders.map((reader) => reader.id);

  // filter ratings to keep only the ones from the selected cohort
  const matchingRatings = ratings.filter((rating) =>
    matchingReaderIds.includes(rating.readerId)
  );

  // Recommendation list
  const recommendations = books
    .filter((book) => book.genres.includes(targetGenre))            // only keep books belonging to selected target genre
    .map((book) => {                                                // for each book, calculate recommendation statistics
      const relevantRatings = matchingRatings.filter((rating) =>    // find all ratings for current book from selected matching cohort
        rating.bookId === book.id
      );

      const ratingCount = relevantRatings.length;                   // count number of matching ratings for the current book


      // calculate avg rating. 1. .reduce() to add up all rating values, 2. divide by ratingCount to get mean avg, if no ratings use 0
      const averageRating =
        ratingCount > 0
          ? relevantRatings.reduce((sum, rating) => sum + rating.rating, 0) / ratingCount
        : 0;

      // return a new object with all original book properties + rating statistics
      return {
        ...book, // spread operator takes all properties from existing object and copies them into a new object
        ratingCount,
        averageRating,
      };
    })
    .filter((book) => book.ratingCount > 0)               // remove books without ratings from selected cohort
    .sort((a, b) => b.averageRating - a.averageRating);   // highest-rated book appears first in the list
  
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
      </div>

      <p>
        Current query: Show <strong>{targetGenre}</strong> books rated by readers who usually read <strong>{cohortGenre}</strong>.
      </p>

      <h2>Recommendations</h2>
      
      <ul>
        {/* Render rec results after filtering and ranking */}
        {recommendations.map((book) => (
          <li key={book.id}>
            <strong>{book.title}</strong> by {book.author} - Average rating:{" "}
            {book.averageRating.toFixed(2)}  ({book.ratingCount} ratings)
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
            <strong>{reader.displayName}</strong> usually reads <em>{reader.dominantGenre}</em>
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