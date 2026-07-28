import { Route, Routes } from 'react-router'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import ProductList from './pages/ProductList.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import NotFound from './pages/NotFound.jsx'

// Layout order follows Ply's navbar-page.html: the skip link first, then a
// full-bleed nav.navbar outside the container, then units-container wrapping
// main#main. BrowserRouter is mounted in main.jsx.
export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <div className="units-container">
        <main id="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </>
  )
}
