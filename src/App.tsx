import { books } from "./data/books";

function App() {
  return (
    <main>
      <h1>Book Recommendation Prototype</h1>

      <h2>Available Books</h2>

      <ul>
        {books.map((book) => // for each book in the books array, create one list item, key={book.id} is used since react needs a unique key for each rendered item in a list for tracking
          <li key={book.id}>
            <strong>{book.title}</strong> by {book.author} - {book.genres.join(", ")}
          </li>
        )}
      </ul>
    </main>
  );
}

export default App;