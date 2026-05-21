// this script fetches public book metadata from Open Library
// the React app will not call Open Library directly
import type { Book, Genre } from "../src/types/types";
import { writeFileSync } from "fs";

const BOOKS_PER_GENRE = 50;
const BOOKS_FILE = "src/data/generatedBooks.ts";

// define the shape of one search configuration
type GenreSearchConfig = {
    genre: Genre;
    searchTerm: string;
};

const GENRE_SEARCH_CONFIGS: GenreSearchConfig[] = [
    {
        genre: "Fantasy",
        searchTerm: "fantasy",
    },
    {
        genre: "Romance",
        searchTerm: "romance",
    },
    {
        genre: "Sci-Fi",
        searchTerm: "science fiction",
    },
    {
        genre: "Contemporary",
        searchTerm: "contemporary fiction",
    },
    {
        genre: "Classic",
        searchTerm: "classic literature",
    },
];

//define the shape of one book result from Open Library
// use ? to make fields optional, as OL data may not be complete
type OpenLibrarySearchDoc = {
    key?: string;
    title?: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
};

// full OL response has a docs property - an array of OL book results
type OpenLibrarySearchResponse = {
    docs: OpenLibrarySearchDoc[];
};

// hekper function: check whether a text value is suitable for the prototype in English
// allow English letters, digits, whitespace, and some common punctuation characters and hyphens
function usesBasicLatinCharacters(text: string): boolean {
    return /^[A-Za-z0-9\s.,:;'"!?&()\-–—]+$/.test(text); // test() runs the regex against the text value
}

function convertOpenLibraryDocToBook(
    doc: OpenLibrarySearchDoc,
    id: number,
    genre: Genre
): Book | null { 
    const firstPublished = doc.first_publish_year;
    const title = doc.title;
    const author = doc.author_name?.[0];

    // skip OL records that are missing data needed by the prototype (workId, title, author, valid positive publication year)
    if (
        !doc.key ||
        !title ||
        !author ||
        firstPublished === undefined ||
        firstPublished <= 0 ||
        !usesBasicLatinCharacters(title) ||
        !usesBasicLatinCharacters(author)
    ) {
        return null;
    }

    return {
        id,
        title,
        author,
        genres: [genre],
        openLibraryWorkId: doc.key,
        firstPublished,
        coverId: doc.cover_i,
    };
}

// reusable asynchronous function to fetch books from a genre (async because fetching data from OL takes time)
async function fetchBooksForGenre(genre: Genre, searchTerm: string): Promise<Book[]> { // promise: the function eventually will return an array of Book objects
    // create URL object for the Open Library Search API endpoint
    const url = new URL("https://openlibrary.org/search.json");

    // add query parameter to URL
    url.searchParams.set("q", `subject:${searchTerm} language:eng`); // use OL search term instead of hardcoding a genre -> reusable, add language filter
    // add query param to limit number of results, convert number to String
    url.searchParams.set("limit", String(BOOKS_PER_GENRE));
    // limit output to relevant fields
    url.searchParams.set(
        "fields",
        "key, title, author_name, first_publish_year, cover_i"
    )

    //contact the API and fetch a response, await until the response comes back before continuing
    const response = await fetch(url);

    // check whether request worked
    if (!response.ok) {
        throw new Error(`Open Library request failed for ${genre}: ${response.status}`);
    }

    // convert response body from JSON into JS object, so TypeScript can work with it
    // treat the JSON response as an OpenLibrarySearchResponse
    const data = (await response.json()) as OpenLibrarySearchResponse;

    return data.docs // go through each OL results array
        .map((doc, index) => // go through each OL result
            convertOpenLibraryDocToBook(doc, index + 1, genre) // convert raw OL result into app's Book format
        )
        .filter((book): book is Book => book !== null); // remove failed conversions. book is Book -> TS guard: tell TS that after filtering, the array contains only Book objects, not null
}

// function to handle book generation process
async function generateBooks(): Promise<Book[]> {
    const booksByWorkId = new Map<string, Book>(); // map to hold books by OL work id

    for (const config of GENRE_SEARCH_CONFIGS) { // loop through all search configs to fetch books for each genre
        const booksForGenre = await fetchBooksForGenre(
            config.genre,
            config.searchTerm
        );

        for (const book of booksForGenre) {
            const workId = book.openLibraryWorkId;

            if (!workId) {
                continue; // if the book has no workId, skip it
            }

            const existingBook = booksByWorkId.get(workId); // get existing book from booksByWorkId

            if (existingBook) {
                if (!existingBook.genres.includes(config.genre)) { // if the book exists but doesn't have the current genre
                    // add the new genre to existing genres
                    const updatedGenres = [...existingBook.genres, config.genre];

                    // create an updated book and add the updated genre list to it
                    const updatedBook: Book = {
                        ...existingBook,
                        genres: updatedGenres,
                    };

                    // add the updated book into the map
                    booksByWorkId.set(workId, updatedBook);
                }

                continue; // if existing book has the current genre, skip adding it again
            }

            booksByWorkId.set(workId, book); // otherwise, add the new book to the array
        }
    }

    // return the array of books and reassign local IDs starting from 1
    return Array.from(booksByWorkId.values()).map((book, index) => ({
        ...book,
        id: index + 1,
    }));
}

const generatedBooks = await generateBooks();

// JSON.stringify() turns generatedBooks array into a string.
// null = no custom filtering
// 2 = output should use 2-space indentation
const generatedBooksAsText = JSON.stringify(generatedBooks, null, 2);


// create the content for the file, including a comment and an import
// the import is written into the file, so the generated data file can use the existing Book type
const fileContents = `// This file is generated by scripts/generateBooks.ts.
// Do not edit this file manually. Re-run the generator script instead.

import type { Book } from "../types/types";

export const generatedBooks: Book[] = ${generatedBooksAsText};
`;

// write the generated file into src/data/ to be available to the React app
writeFileSync(BOOKS_FILE, fileContents);

//print converted books in table
console.table(generatedBooks);

// confirmation message
console.log(`Generated ${generatedBooks.length} books in ${BOOKS_FILE}.`)