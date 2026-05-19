// this script fetches public book metadata from Open Library
// the React app will not call Open Library directly
import type { Book, Genre } from "../src/types/types";

const BOOKS_TO_FETCH = 5;
const CURRENT_GENRE: Genre = "Fantasy"; //testing only one genre for now

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

function convertOpenLibraryDocToBook(
    doc: OpenLibrarySearchDoc,
    id: number,
    genre: Genre
): Book | null { // the function returns either a valid Book or null (null if important data missing in OL)
    if (!doc.key || !doc.title || !doc.author_name?.[0]) {
        return null;
    }

    return {
        id,
        title: doc.title,
        author: doc.author_name[0],
        genres: [genre], // Book type expects array, so []
        openLibraryWorkId: doc.key,
        firstPublished: doc.first_publish_year,
        coverId: doc.cover_i,
    };
}

// create URL object for the Open Library Search API endpoint
const url = new URL("https://openlibrary.org/search.json");

// add query parameter to URL
url.searchParams.set("subject", CURRENT_GENRE.toLowerCase());
// add query param to limit number of results, convert number to String
url.searchParams.set("limit", String(BOOKS_TO_FETCH));
// limit output to relevant fields
url.searchParams.set(
    "fields",
    "key, title, author_name, first_publish_year, cover_i"
)

//contact the API and fetch a response, await until the response comes back before continuing
const response = await fetch(url);

// check whether request worked
if (!response.ok) {
    throw new Error(`Open Library request failed: ${response.status}`);
}

// convert response body from JSON into JS object, so TypeScript can work with it
// treat the JSON response as an OpenLibrarySearchResponse
const data = (await response.json()) as OpenLibrarySearchResponse;

/* // print data as a table in the terminal
console.table(
    data.docs.map((book) => ({
        key: book.key,
        title: book.title,
        author: book.author_name?.[0], // author_name is an array. only take first author
        firstPublished: book.first_publish_year,
        coverId: book.cover_i,
    }))
); */

const generatedBooks: Book[] = data.docs // creat array to contain valid Book objects, go through each OL results array
    .map((doc, index) => // go through each OL result
        convertOpenLibraryDocToBook(doc, index + 1, CURRENT_GENRE) // convert raw OL result into app's Book format
    )
    .filter((book): book is Book => book !== null); // remove failed conversions. book is Book -> TS guard: tell TS that after filtering, the array contains only Book objects, not null

    //print converted books in table
console.table(generatedBooks);

export { };