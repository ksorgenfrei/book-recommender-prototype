// this script generates simulated ratings that connect generated readers to generated books
import { generatedBooks } from "../src/data/generatedBooks";
import { generatedReaderProfiles } from "../src/data/generatedReaderProfiles";

console.log("Generated dataset overview:\n");

console.log(`Books available: ${generatedBooks.length}`);
console.log(`Reader profiles available: ${generatedReaderProfiles.length}`);

console.table(
    generatedReaderProfiles.slice(0, 5).map((reader) =>({
        id: reader.id,
        displayName: reader.displayName,
        dominantGenre: reader.dominantGenre,
        booksReadCount: reader.booksReadCount,
    }))
);

console.table(
    generatedBooks.slice(0, 5).map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        genres: book.genres.join(", "),
    }))
);

