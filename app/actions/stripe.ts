"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

interface CheckoutItem {
  productId: string
  quantity: number
}

export async function createCheckoutSession(items: CheckoutItem[]) {
  if (process.env.MOCK_STRIPE === "true") {
    return "mock_client_secret_123"
  }

  const supabase = await createClient()

  // Get product details from database
  const productIds = items.map((item) => item.productId)
  const { data: products } = await supabase.from("products").select("*").in("id", productIds)

  if (!products || products.length === 0) {
    throw new Error("No valid products found")
  }

  // Create line items for Stripe
  const lineItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product) {
      throw new Error(`Product ${item.productId} not found`)
    }

    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          description: product.description,
        },
        unit_amount: Math.round(product.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }
  })

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: lineItems,
    mode: "payment",
  })

  return session.client_secret
}

export async function getSessionStatus(sessionId: string) {
  if (process.env.MOCK_STRIPE === "true") {
    return {
      status: "complete",
      customer_email: "test@example.com",
      payment_status: "paid",
    }
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return {
    status: session.status,
    customer_email: session.customer_details?.email,
    payment_status: session.payment_status,
  }
}
