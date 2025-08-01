import { defineStore } from 'pinia'

export interface CartItem {
  id: number
  name: string
  price: number
  image_url: string
  quantity: number
  stock?: number
  size?: string
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('cart_items') || '[]') as CartItem[],
  }),
  actions: {
    addToCart(product: CartItem) {
  const existing = this.items.find(
    item => item.id === product.id && item.size === product.size
  )

  const totalRequested = (existing?.quantity || 0) + product.quantity
  const availableStock = product.stock ?? 99

  if (totalRequested > availableStock) {
    alert(`Cannot add more than ${availableStock} item(s) in stock.`)
    return
  }

  if (existing) {
    existing.quantity += product.quantity
  } else {
    this.items.push({ ...product, stock: availableStock })
  }

  this.saveCart()
},
    removeFromCart(id: number) {
      this.items = this.items.filter(item => item.id !== id)
      this.saveCart()
    },
    clear() {
      this.items = []
      this.saveCart()
    },
    saveCart() {
      localStorage.setItem('cart_items', JSON.stringify(this.items))
    },
    loadCart() {
      this.items = JSON.parse(localStorage.getItem('cart_items') || '[]')
    }
  },
  getters: {
    totalPrice: state =>
      state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    totalCount: state =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),
  }
})
