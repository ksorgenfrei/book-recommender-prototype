type MainNavigationProps = {
    currentPage: "home" | "recommendations" | "howItWorks";
    onCurrentPageChange: (newCurrentPage: "home" | "recommendations" | "howItWorks") => void;
};

export function MainNavigation({
    currentPage,
    onCurrentPageChange,
}: MainNavigationProps) {
    return (
        <nav className="main-nav" aria-label="Main navigation">
            <button
                type="button"
                className="primary-button"
                onClick={() => onCurrentPageChange("home")}
                // tell assitive technologies which section is currently active
                aria-current={currentPage === "home" ? "page" : undefined}>
                Home
            </button>

            <button
                type="button"
                className="primary-button"
                onClick={() => onCurrentPageChange("recommendations")}
                // tell assitive technologies which section is currently active
                aria-current={currentPage === "recommendations" ? "page" : undefined}>
                Recommendations
            </button>

            <button
                type="button"
                className="primary-button"
                onClick={() => onCurrentPageChange("howItWorks")}
                // tell assitive technologies which section is currently active
                aria-current={currentPage === "howItWorks" ? "page" : undefined}>
                How It Works
            </button>
        </nav>
    );
}
