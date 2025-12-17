import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)
          let newItems: CartItem[]

          if (existingItem) {
            newItems = state.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i))
          } else {
            newItems = [...state.items, item]
          }

          const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

          return { items: newItems, total }
        }),

      removeItem: (id) =>
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== id)
          const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
          return { items: newItems, total }
        }),

      updateQuantity: (id, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter((item) => item.id !== id)
            const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
            return { items: newItems, total }
          }

          const newItems = state.items.map((item) => (item.id === id ? { ...item, quantity } : item))
          const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
          return { items: newItems, total }
        }),

      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: "cart-storage",
    },
  ),
)
