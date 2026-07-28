// Constructing an Intl formatter is not free and the options never vary, so
// build it once at module scope. Shared by the card, detail page, and cart —
// previously duplicated in each.
const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export function formatPrice(value) {
  return priceFormatter.format(value)
}
