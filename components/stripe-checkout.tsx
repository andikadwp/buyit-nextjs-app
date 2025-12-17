"use client"

import { useCallback } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { createCheckoutSession } from "@/app/actions/stripe"
import { Button } from "@/components/ui/button"

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null
const mockMode = process.env.NEXT_PUBLIC_MOCK_STRIPE === "true"

interface StripeCheckoutProps {
  items: Array<{
    id: string
    quantity: number
  }>
  onSuccess?: () => void
}

export function StripeCheckout({ items, onSuccess }: StripeCheckoutProps) {
  const fetchClientSecret = useCallback(async () => {
    const checkoutItems = items.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }))

    const clientSecret = await createCheckoutSession(checkoutItems)
    return clientSecret
  }, [items])

  if (mockMode) {
    return (
      <div id="checkout" className="grid gap-3">
        <p className="text-sm text-muted-foreground">
          Mock payment aktif. Tidak ada transaksi nyata yang diproses.
        </p>
        <Button
          onClick={() => {
            if (onSuccess) onSuccess()
          }}
        >
          Simulasikan Pembayaran Berhasil
        </Button>
      </div>
    )
  }

  if (!publishableKey) {
    return (
      <div id="checkout" className="text-sm text-destructive">
        Stripe belum dikonfigurasi. Isi `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` di `.env.local`.
      </div>
    )
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{
          fetchClientSecret,
          onComplete: () => {
            if (onSuccess) {
              onSuccess()
            }
          },
        }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
