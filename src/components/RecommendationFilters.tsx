import type { GenreFilter, ExperienceFilter, RecommendationSortOption, ExperienceThresholds } from "../types/types";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

type RecommendationFiltersProps = {
    genres: readonly string[];

    targetGenre: GenreFilter;
    cohortGenre: GenreFilter;
    experienceFilter: ExperienceFilter;
    experienceThresholds: ExperienceThresholds;
    sortOption: RecommendationSortOption;

    appliedIntermediateMinBooksRead: string;
    appliedExperiencedMinBooksRead: string;
    showExperienceThresholdModal: boolean;
    experienceThresholdError: string | null;
    draftExperienceThresholds: ExperienceThresholds | null;


    onTargetGenreChange: (newTargetGenre: GenreFilter) => void;
    onCohortGenreChange: (newCohortGenre: GenreFilter) => void;
    onExperienceFilterChange: (newExperienceFilter: ExperienceFilter) => void;
    onSortOptionChange: (newSortOption: RecommendationSortOption) => void;

    onAppliedIntermediateMinBooksReadChange: (newValue: string) => void;
    onAppliedExperiencedMinBooksReadChange: (newValue: string) => void;
    onOpenExperienceThresholdModal: () => void;
    onCloseExperienceThresholdModal: () => void;
    onResetExperienceThresholds: () => void;

    onApplyExperienceThresholds: () => void;
};

export function RecommendationFilters({
    genres,
    targetGenre,
    cohortGenre,
    experienceFilter,
    experienceThresholds,
    sortOption,
    appliedIntermediateMinBooksRead,
    appliedExperiencedMinBooksRead,
    showExperienceThresholdModal,
    experienceThresholdError,
    draftExperienceThresholds,
    onTargetGenreChange,
    onCohortGenreChange,
    onExperienceFilterChange,
    onSortOptionChange,
    onAppliedIntermediateMinBooksReadChange,
    onAppliedExperiencedMinBooksReadChange,
    onOpenExperienceThresholdModal,
    onCloseExperienceThresholdModal,
    onResetExperienceThresholds,
    onApplyExperienceThresholds,
}: RecommendationFiltersProps) {
    return (
        <div className="filter-panel">
            <div className="filter-control">
                <label htmlFor="target-genre">
                    Books in genre:
                </label>

                <select
                    id="target-genre"
                    value={targetGenre}
                    onChange={(event) =>
                        onTargetGenreChange(event.target.value as GenreFilter)
                    }
                >
                    <option value="Any">Any genre</option>

                    {genres.map((genre) => (
                        <option key={genre} value={genre}>
                            {genre}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-control">
                <label htmlFor="cohort-genre">
                    Rated by readers of:
                </label>

                <select
                    id="cohort-genre"
                    value={cohortGenre}
                    onChange={(event) =>
                        onCohortGenreChange(event.target.value as GenreFilter)
                    }
                >
                    <option value="Any">Any genre</option>

                    {genres.map((genre) => (
                        <option key={genre} value={genre}>
                            {genre}
                        </option>
                    ))}
                </select>
            </div>

            <div className="filter-control">
                <label htmlFor="experience-level">
                    Reader experience:
                </label>

                <select
                    id="experience-level"
                    value={experienceFilter}
                    onChange={(event) =>
                        onExperienceFilterChange(
                            event.target.value as ExperienceFilter
                        )
                    }
                >
                    <option value="Any">Any experience</option>

                    <option value="Beginner">
                        Beginner (0-
                        {experienceThresholds.intermediateMinBooksRead - 1} books)
                    </option>

                    <option value="Intermediate">
                        Intermediate (
                        {experienceThresholds.intermediateMinBooksRead}-
                        {experienceThresholds.experiencedMinBooksRead - 1} books)
                    </option>

                    <option value="Experienced">
                        Experienced (
                        {experienceThresholds.experiencedMinBooksRead}+ books)
                    </option>
                </select>

                <Button
                    className="threshold-button"
                    type="button"
                    variant="outline-secondary"
                    size="sm"
                    onClick={onOpenExperienceThresholdModal}
                >
                    Customize thresholds
                </Button>
            </div>


            <div className="filter-control">
                <label htmlFor="sort-option">
                    Sort by:
                </label>

                <select
                    id="sort-option"
                    value={sortOption}
                    onChange={(event) =>
                        onSortOptionChange(
                            event.target.value as RecommendationSortOption
                        )
                    }
                >
                    <option value="averageRating">
                        Highest rated
                    </option>

                    <option value="ratingCount">
                        Most ratings
                    </option>

                    <option value="averageRatingThenCount">
                        Rating, then count
                    </option>

                    <option value="ratingCountThenAverage">
                        Count, then rating
                    </option>
                </select>
            </div>

            <Modal show={showExperienceThresholdModal} onHide={onCloseExperienceThresholdModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Customize experience thresholds</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <label htmlFor="intermediate-threshold">
                        Intermediate starts at
                    </label>
                    <input
                        id="intermediate-threshold"
                        type="number"
                        min="0"
                        step="1"
                        value={appliedIntermediateMinBooksRead}
                        onChange={(event) => onAppliedIntermediateMinBooksReadChange(event.target.value)}
                        aria-invalid={experienceThresholdError !== null}
                        aria-describedby="experience-threshold-feedback"
                    />

                    <label htmlFor="experienced-threshold">
                        Experienced starts at
                    </label>
                    <input
                        id="experienced-threshold"
                        type="number"
                        min="0"
                        step="1"
                        value={appliedExperiencedMinBooksRead}
                        onChange={(event) => onAppliedExperiencedMinBooksReadChange(event.target.value)}
                        aria-invalid={experienceThresholdError !== null}
                        aria-describedby="experience-threshold-feedback"
                    />

                    <div id="experience-threshold-feedback" className="mt-3">
                        {experienceThresholdError !== null ? (
                            <p role="alert" className="text-danger mb-0">
                                {experienceThresholdError}
                            </p>
                        ) : draftExperienceThresholds !== null ? (
                            <>
                                <p className="mb-1"><strong>Resulting ranges:</strong></p>
                                <ul className="mb-0">
                                    <li>
                                        Beginner: 0-
                                        {draftExperienceThresholds.intermediateMinBooksRead - 1} books
                                    </li>
                                    <li>
                                        Intermediate:{" "}
                                        {draftExperienceThresholds.intermediateMinBooksRead}-
                                        {draftExperienceThresholds.experiencedMinBooksRead - 1} books
                                    </li>
                                    <li>
                                        Experienced:{" "}
                                        {draftExperienceThresholds.experiencedMinBooksRead}+ books
                                    </li>
                                </ul>
                            </>
                        ) : null}
                    </div>

                </Modal.Body>

                <Modal.Footer>
                    <Button type="button" className="secondary-button" variant="secondary" onClick={onResetExperienceThresholds}>
                        Reset to defaults
                    </Button>
                    <Button type="button" className="primary-button" variant="primary" disabled={experienceThresholdError !== null} onClick={onApplyExperienceThresholds}>
                        Done
                    </Button>

                </Modal.Footer>
            </Modal>

        </div>
    );
}