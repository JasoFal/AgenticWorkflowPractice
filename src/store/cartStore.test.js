import { useCartStore, selectItemCount, selectSubtotal } from './cartStore.js'

const mascara = {
  id: 1,
  title: 'Essence Mascara Lash Princess',
  price: 9.99,
  thumbnail: 'https://example.test/1.webp',
  // Fields the cart should NOT copy into its line.
  reviews: [{ rating: 3 }],
  description: 'long text',
}

const palette = {
  id: 2,
  title: 'Eyeshadow Palette with Mirror',
  price: 19.99,
  thumbnail: 'https://example.test/2.webp',
}

const cart = () => useCartStore.getState()

beforeEach(() => {
  useCartStore.getState().reset()
})

describe('add', () => {
  it('adds a new line with quantity 1 by default', () => {
    cart().add(mascara)

    expect(cart().items).toHaveLength(1)
    expect(cart().items[0]).toMatchObject({
      id: 1,
      title: mascara.title,
      price: 9.99,
      quantity: 1,
    })
  })

  it('stores only the fields the cart needs, not the whole product', () => {
    cart().add(mascara)

    expect(Object.keys(cart().items[0]).sort()).toEqual([
      'id',
      'price',
      'quantity',
      'thumbnail',
      'title',
    ])
  })

  it('respects an explicit quantity', () => {
    cart().add(mascara, 3)

    expect(cart().items[0].quantity).toBe(3)
  })

  it('increments quantity instead of creating a duplicate line', () => {
    cart().add(mascara, 2)
    cart().add(mascara, 3)

    expect(cart().items).toHaveLength(1)
    expect(cart().items[0].quantity).toBe(5)
  })

  it('keeps different products on separate lines', () => {
    cart().add(mascara)
    cart().add(palette)

    expect(cart().items.map((i) => i.id)).toEqual([1, 2])
  })
})

describe('remove', () => {
  it('drops the matching line', () => {
    cart().add(mascara)
    cart().add(palette)
    cart().remove(1)

    expect(cart().items.map((i) => i.id)).toEqual([2])
  })

  it('is a no-op for an id that is not in the cart', () => {
    cart().add(mascara)
    cart().remove(999)

    expect(cart().items).toHaveLength(1)
  })
})

describe('setQuantity', () => {
  it('updates the quantity of an existing line', () => {
    cart().add(mascara)
    cart().setQuantity(1, 7)

    expect(cart().items[0].quantity).toBe(7)
  })

  it('removes the line when set to zero', () => {
    cart().add(mascara)
    cart().setQuantity(1, 0)

    expect(cart().items).toHaveLength(0)
  })

  it('removes the line when set negative', () => {
    cart().add(mascara)
    cart().setQuantity(1, -5)

    expect(cart().items).toHaveLength(0)
  })

  it('leaves other lines untouched', () => {
    cart().add(mascara)
    cart().add(palette, 4)
    cart().setQuantity(1, 2)

    expect(cart().items.find((i) => i.id === 2).quantity).toBe(4)
  })
})

describe('clear', () => {
  it('empties the cart', () => {
    cart().add(mascara)
    cart().add(palette)
    cart().clear()

    expect(cart().items).toEqual([])
  })
})

describe('derived values', () => {
  it('counts total units, not lines', () => {
    cart().add(mascara, 2)
    cart().add(palette, 3)

    expect(selectItemCount(cart())).toBe(5)
  })

  it('is zero for an empty cart', () => {
    expect(selectItemCount(cart())).toBe(0)
    expect(selectSubtotal(cart())).toBe(0)
  })

  it('sums price times quantity', () => {
    cart().add(mascara, 2) // 19.98
    cart().add(palette, 1) // 19.99

    expect(selectSubtotal(cart())).toBeCloseTo(39.97, 2)
  })

  it('tracks quantity changes', () => {
    cart().add(mascara, 1)
    cart().setQuantity(1, 3)

    expect(selectItemCount(cart())).toBe(3)
    expect(selectSubtotal(cart())).toBeCloseTo(29.97, 2)
  })
})
