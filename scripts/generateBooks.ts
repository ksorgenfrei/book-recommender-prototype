// this script fetches public book metadata from Open Library
// the React app will not call Open Library directly

const BOOKS_TO_FETCH = 5;

// create URL object for the Open Library Search API endpoint
const url = new URL("https://openlibrary.org/search.json");

// add query parameter to URL
url.searchParams.set("subject", "fantasy");
// add query param to limit number of results, convert number to String
url.searchParams.set("limit", String(BOOKS_TO_FETCH));

//contact the API and fetch a response, await until the response comes back before continuing
const response = await fetch(url);

// check whether request worked
if (!response.ok) {
    throw new Error(`Open Library request failed: ${response.status}`);
}

// convert response body from JSON into JS object, so TypeScript can work with it
const data = await response.json();

console.log(data);

export {};