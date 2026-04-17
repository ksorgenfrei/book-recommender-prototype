import { books } from "./data/books";
import { readerProfiles } from "./data/readerProfiles";
import { ratings } from "./data/ratings";

function App() {

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