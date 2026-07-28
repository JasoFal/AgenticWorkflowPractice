import NavItem from './NavItem.jsx'

// Structure follows Ply's navbar snippets: a bare <ul> inside nav.navbar.
// The role="menubar"/"menuitem" attributes shown in navbar-page.html are
// deliberately omitted — that ARIA pattern is for application menus and makes
// screen readers announce arrow-key semantics this component doesn't implement.
// responsive-header.html omits them too. aria-current="page" marks the active
// route, which is the correct affordance for site navigation.
export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <ul>
        <NavItem to="/">Home</NavItem>
        <NavItem to="/products" pattern="/products/*">
          Products
        </NavItem>
        <NavItem to="/cart">Cart</NavItem>
      </ul>
    </nav>
  )
}
