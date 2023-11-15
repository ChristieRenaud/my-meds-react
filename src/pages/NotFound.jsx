import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="not-found-container">
      <h2>Sorry, the page you were looking for was not found.</h2>
      <Link to="/" className="btn btn-back">
        Return to Login
      </Link>
    </div>
  )
}
