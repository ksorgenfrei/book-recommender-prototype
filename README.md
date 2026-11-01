# Transparent Book Recommendation Prototype

A client-side book recommendation prototype that lets users control which simulated reader cohort influences their recommendations and inspect the evidence behind each result.

I developed this project to explore how a recommender interface can make its filtering and ranking decisions more visible. Instead of presenting an unexplained list, the application shows the selected criteria, average rating, rating count, contributing ratings, and the simulated reader profiles behind those ratings. 

> This is an exploratory prototype, not a production recommendation service. Reader profiles and ratings are synthetic and do not represent real people or real reading behaviour.

Example query:
<img width="878" height="534" alt="image" src="https://github.com/user-attachments/assets/b9e27bfd-0269-4b3b-b18e-8459ef83f4c7" />


## Features

- Filter books by target genre.
- Define a reader cohort by its preferred genre and reading experience.
- Customize the thresholds used to classify beginner, intermediate, and experienced readers.
- Rank results by average rating, rating count, or a combination of both.
- Inspect every simulated rating used to calculate a recommendation.
- Open contributing reader profiles and view their rating histories.
- Paginate recommendation, evidence, and reader-history lists.
- Use responsive, keyboard-accessible controls with validation and visible focus states.

## How recommendations are produced

1. The user selects the type of book they want and the characteristics of the reader cohort whose ratings should be considered.
2. The application finds simulated readers who match the submitted cohort criteria.
3. It keeps only ratings from those readers and books matching the requested genre.
4. It calculates each book's average rating and rating count.
5. It ranks the results using the selected sorting method and retains the contributing ratings as inspectable evidence.

The calculation is deterministic and rule-based. It runs entirely in the browser and does not use machine learning or an external recommendation API.

## Data

The included demonstration dataset contains:

- 207 books created from public Open Library metadata
- 250 reproducibly generated reader profiles
- 11,947 reproducibly generated ratings

The book metadata is stored locally in the project. Cover images are requested from Open Library when the application runs. Reader profiles and ratings are synthetic, generated with fixed seeds, and are intended only to demonstrate and test the interface and recommendation logic.

## Technology

- React 19 and TypeScript
- Vite
- React-Bootstrap and Bootstrap
- Vitest
- ESLint

## Run locally

You will need a recent version of Node.js and npm.

```bash
git clone https://github.com/ksorgenfrei/book-recommender-prototype.git
cd book-recommender-prototype
npm install
npm run dev
```

Open the local URL printed by Vite in your browser.

## Quality checks

```bash
npm test
npm run lint
npm run build
```

The test suite covers the recommendation filters and ranking rules, experience-level boundaries, pagination, evidence consistency, empty-data behavior, and source-data immutability. The current suite contains 30 unit tests across three test files.

I reviewed the prototype through structured usability and accessibility checks, including keyboard navigation, form labelling, focus visibility, colour contrast, responsive layouts, alternative text, and appropriate ARIA attributes, guided by WCAG 2.2.

## Regenerate the demonstration data

The generated data is already committed, so regeneration is not required to run the application. To rebuild it:

```bash
npm run generate:readers
npm run generate:books
npm run generate:ratings
```

Run the commands in that order because ratings depend on the generated books and reader profiles. Book generation retrieves metadata from the Open Library Search API and requires an internet connection. Regenerating the books may produce different results if the API data has changed.

## Project structure

```text
scripts/                 Reproducible data-generation scripts
src/components/          Navigation and recommendation controls
src/data/                Book metadata and synthetic demonstration data
src/types/               Shared TypeScript data models
src/utils/               Recommendation, experience, and pagination logic
src/utils/*.test.ts      Unit tests for the core logic
```

## Current scope

This prototype is intentionally client-side and uses a static dataset. It does not include accounts, authentication, persistent storage, personal-data collection, a backend, or model-based recommendations. A production version would require secure server-side services, a database, privacy controls, broader accessibility and device testing, and evaluation with real users before making claims about recommendation quality or user satisfaction.

## Metadata source

Book metadata and cover images are provided by [Open Library](https://openlibrary.org/).
