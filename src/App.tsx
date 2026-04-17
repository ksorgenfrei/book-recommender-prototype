import { books } from "./data/books";
import { readerProfiles } from "./data/readerProfiles";

function App() {
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
    </main>
  );
}

export default App;