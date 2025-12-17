"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { toast } from "sonner"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  stock: number
  image_url: string | null
}

interface CartStore {
  items: CartItem[]
  addItem: (product: any) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (product) => {
        const items = get().items
        const existingItem = items.find((item) => item.id === product.id)

        if (existingItem) {
          if (existingItem.quantity >= product.stock) {
            toast.error("Cannot add more items than available in stock")
            return
          }
          set({
            items: items.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
          })
        } else {
          set({
            items: [
              ...items,
              {
                id: product.id,
                name: product.name,
                price: Number(product.price),
                quantity: 1,
                stock: product.stock,
                image_url: product.image_url,
              },
            ],
          })
        }

        toast.success("Added to cart")

        // Update totals
        const newItems = get().items
        set({
          total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        })
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) })
        toast.success("Removed from cart")

        // Update totals
        const newItems = get().items
        set({
          total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        })
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id)
          return
        }

        const item = get().items.find((item) => item.id === id)
        if (item && quantity > item.stock) {
          toast.error("Cannot add more items than available in stock")
          return
        }

        set({
          items: get().items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        })

        // Update totals
        const newItems = get().items
        set({
          total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
        })
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 })
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)
