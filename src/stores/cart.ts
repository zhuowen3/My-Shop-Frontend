import { defineStore } from 'pinia'

export interface CartItem {
  id: number
  name: string
  price: number
  image_url: string
  quantity: number
}
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),
  actions: {
    addToCart(product: CartItem) {
      const existing = this.items.find(item => item.id === product.id)
      if (existing) {
        existing.quantity += 1
      } else {
        this.items.push({ ...product, quantity: 1 })
      }
    },
    removeFromCart(id: number) {
      this.items = this.items.filter(item => item.id !== id)
    },
    clearCart() {
      this.items = []
    },
  },
  getters: {
    totalPrice: state =>
      state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    totalCount: state =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),
  },
})
