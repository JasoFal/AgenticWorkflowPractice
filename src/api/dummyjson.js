// All DummyJSON HTTP lives here, behind a single BASE_URL. See CLAUDE.md section 7.
// Components never fetch directly — store actions call these. See section 5.
const BASE_URL = 'https://dummyjson.com'

// fetch() only rejects on network failure, not on 4xx/5xx. Without an explicit
// res.ok check a 500 would fall through to res.json() and fail as a confusing
// parse error instead of a readable HTTP one.
async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`)

  if (!res.ok) {
    throw new Error(`DummyJSON request failed: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

// Returns the raw envelope: { products, total, skip, limit }.
export function fetchProducts({ limit = 30, skip = 0 } = {}) {
  return request(`/products?limit=${limit}&skip=${skip}`)
}

// Returns [{ slug, name, url }] — objects, not strings. Section 7.
export function fetchCategories() {
  return request('/products/categories')
}

// Same envelope as fetchProducts, scoped to one category slug.
export function fetchProductsByCategory(slug, { limit = 30, skip = 0 } = {}) {
  return request(
    `/products/category/${encodeURIComponent(slug)}?limit=${limit}&skip=${skip}`,
  )
}
