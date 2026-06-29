import Button from "react-bootstrap/Button";
import { ButtonGroup } from "react-bootstrap";

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
            <ButtonGroup>
                <Button
                    type="button"
                    className="primary-button"
                    active={currentPage === "home"}
                    onClick={() => onCurrentPageChange("home")}
                    // tell assitive technologies which section is currently active
                    aria-current={currentPage === "home" ? "page" : undefined}>
                    Home
                </Button>

                <Button
                    type="button"
                    className="primary-button"
                    active={currentPage === "recommendations"}
                    onClick={() => onCurrentPageChange("recommendations")}
                    // tell assitive technologies which section is currently active
                    aria-current={currentPage === "recommendations" ? "page" : undefined}>
                    Recommendations
                </Button>

                <Button
                    type="button"
                    className="primary-button"
                    active={currentPage === "howItWorks"}
                    onClick={() => onCurrentPageChange("howItWorks")}
                    // tell assitive technologies which section is currently active
                    aria-current={currentPage === "howItWorks" ? "page" : undefined}>
                    How It Works
                </Button>
            </ButtonGroup>
        </nav>
    );
}
