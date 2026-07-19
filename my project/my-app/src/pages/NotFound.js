import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
    return (
        <div className="notfound-container">

            <div className="notfound-card">

                <h1 className="error-code">
                    404
                </h1>

                <h2 className="error-title">
                    Page Not Found
                </h2>

                <p className="error-text">
                    Sorry! The page you are looking for doesn't exist or has been moved.
                </p>

                <Link to="/" className="home-link">
                    Go Back Home
                </Link>

            </div>

        </div>
    );
}

export default NotFound;