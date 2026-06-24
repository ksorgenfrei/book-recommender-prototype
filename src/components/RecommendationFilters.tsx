import type { GenreFilter, ExperienceFilter, RecommendationSortOption, ExperienceThresholds } from "../types/types";

type RecommendationFiltersProps = {
    genres: readonly string[];

    targetGenre: GenreFilter;
    cohortGenre: GenreFilter;
    experienceFilter: ExperienceFilter;
    experienceThresholds: ExperienceThresholds;
    sortOption: RecommendationSortOption;

    onTargetGenreChange: (newTargetGenre: GenreFilter) => void;
    onCohortGenreChange: (newCohortGenre: GenreFilter) => void;
    onExperienceFilterChange: (newExperienceFilter: ExperienceFilter) => void;
    onSortOptionChange: (newSortOption: RecommendationSortOption) => void;
};

export function RecommendationFilters({
    genres,
    targetGenre,
    cohortGenre,
    experienceFilter,
    experienceThresholds,
    sortOption,
    onTargetGenreChange,
    onCohortGenreChange,
    onExperienceFilterChange,
    onSortOptionChange,
}: RecommendationFiltersProps) {
    return (
        <div className="filter-panel">
            <label className="filter-control">
                Books in genre:{" "}
                <select // creates dropdown menu
                    value={targetGenre}
                    onChange={(event) => onTargetGenreChange(event.target.value as GenreFilter)} // "as GenreFilter" tells TypeScript to treat the selected option as one of the valid genre values instead of a plain string
                >
                    <option value="Any">Any genre</option>
                    {genres.map((genre) => ( // for each item in the genres array, create one <option>
                        <option key={genre} value={genre}>
                            {genre}
                        </option>
                    ))}
                </select>
            </label>


            <label className="filter-control">
                Rated by readers who usually read:{" "}
                <select
                    value={cohortGenre}
                    onChange={(event) => onCohortGenreChange(event.target.value as GenreFilter)}
                >
                    <option value="Any">Any genre</option>
                    {genres.map((genre) => (
                        <option key={genre} value={genre}>
                            {genre}
                        </option>
                    ))}
                </select>
            </label>

            <label className="filter-control">
                Reader experience:{" "}
                <select
                    value={experienceFilter}
                    onChange={(event) =>
                        onExperienceFilterChange(event.target.value as ExperienceFilter)
                    }
                >
                    <option value="Any">Any experience</option>
                    <option value="Beginner">
                        Beginner (0-{experienceThresholds.intermediateMinBooksRead - 1} books)
                    </option>
                    <option value="Intermediate">
                        Intermediate ({experienceThresholds.intermediateMinBooksRead}-{experienceThresholds.experiencedMinBooksRead - 1} books)
                    </option>
                    <option value="Experienced">
                        Experienced ({experienceThresholds.experiencedMinBooksRead}+ books)
                    </option>
                </select>
            </label>

            <label className="filter-control">
                Sort by:{" "}
                <select
                    value={sortOption}
                    onChange={(event) =>
                        onSortOptionChange(event.target.value as RecommendationSortOption)
                    }>
                    <option value="averageRating">
                        Highest average rating
                    </option>

                    <option value="ratingCount">
                        Most ratings
                    </option>

                    <option value="averageRatingThenCount">
                        Highest average rating, then most ratings
                    </option>

                    <option value="ratingCountThenAverage">
                        Most ratings, then highest average rating
                    </option>
                </select>
            </label>

        </div>
    );
}