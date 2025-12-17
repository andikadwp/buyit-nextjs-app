"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCartStore } from "@/lib/store/cart-store"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { StripeCheckout } from "@/components/stripe-checkout"

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items)
  const total = useCartStore((state) => state.total)
  const clearCart = useCartStore((state) => state.clearCart)
  const [loading, setLoading] = useState(false)
  const [shippingAddress, setShippingAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [showPayment, setShowPayment] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please login to continue with checkout",
        })
        router.push("/auth/login")
      }
    })
  }, [])

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please login to continue",
        })
        router.push("/auth/login")
        return
      }

      // Create or update customer profile
      const { data: customerData } = await supabase.from("customers").select("*").eq("id", user.id).single()

      if (!customerData) {
        await supabase.from("customers").insert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer",
          phone: phone,
          address: shippingAddress,
        })
      } else {
        await supabase
          .from("customers")
          .update({
            phone: phone,
            address: shippingAddress,
          })
          .eq("id", user.id)
      }

      // Create order with pending status
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: user.id,
          total_amount: total,
          status: "pending",
          shipping_address: shippingAddress,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }))

      await supabase.from("order_items").insert(orderItems)

      setOrderId(orderData.id)
      setShowPayment(true)
    } catch (error: any) {
      console.error("[v0] Checkout error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process checkout",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = async () => {
    if (!orderId) return

    try {
      // Update order status to paid
      await supabase.from("orders").update({ status: "paid" }).eq("id", orderId)

      // Update product stock
      for (const item of items) {
        const { data: productData } = await supabase.from("products").select("stock").eq("id", item.id).single()

        if (productData) {
          await supabase
            .from("products")
            .update({ stock: productData.stock - item.quantity })
            .eq("id", item.id)
        }
      }

      clearCart()
      toast({
        title: "Payment successful!",
        description: "Your order has been confirmed",
      })
      router.push(`/orders/${orderId}`)
    } catch (error: any) {
      console.error("[v0] Payment success handler error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to confirm order",
      })
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {!showPayment ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProceedToPayment} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Shipping Address</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your complete shipping address"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        required
                        rows={4}
                      />
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Proceed to Payment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={
                              item.image || `/placeholder.svg?height=64&width=64&query=${encodeURIComponent(item.name)}`
                            }
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="text-sm font-semibold text-primary">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <StripeCheckout items={items} onSuccess={handlePaymentSuccess} />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
