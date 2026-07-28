import { Link } from 'react-router'

export default function NotFound() {
  return (
    <div className="units-row">
      <div className="unit-100">
        <h1>Page not found</h1>
        <p>That URL doesn&rsquo;t match any route.</p>
        <Link className="btn btn-primary" to="/">
          Back to home
        </Link>
      </div>
    </div>
  )
}
