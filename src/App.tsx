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

  const getBookTitle = (bookId: number) => {
    const book = books.find((b) => b.id === bookId);
    return book ? book.title : "Unknown book";
  };

  const getReaderName = (readerId: number) => {
    const reader = readerProfiles.find((r) => r.id === readerId);
    return reader ? reader.displayName : "Unknown reader";
  };

  return (
    <main>
      <h1>Book Recommendation Prototype</h1>

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