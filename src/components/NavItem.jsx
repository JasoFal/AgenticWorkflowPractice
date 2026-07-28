import { Link, useMatch } from 'react-router'

// Ply marks the active nav item on the <li> (`li.active a` in _navigation.scss),
// not on the anchor. React Router's NavLink puts its className on the <a>, so it
// can't drive Ply's indicator — the match is computed here and applied to the <li>.
//
// `pattern` lets a link stay active on deeper routes: Products passes
// '/products/*', which matches both /products and /products/:id.
export default function NavItem({ to, pattern, children }) {
  const isActive = Boolean(useMatch(pattern ?? to))

  return (
    <li className={isActive ? 'active' : undefined}>
      <Link to={to} aria-current={isActive ? 'page' : undefined}>
        {children}
      </Link>
    </li>
  )
}
