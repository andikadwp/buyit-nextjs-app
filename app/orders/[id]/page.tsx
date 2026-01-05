import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { Package, MapPin, CreditCard, CheckCircle2, Circle, XCircle } from "lucide-react"

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (*)
      ),
      customers (*)
    `)
    .eq("id", id)
    .eq("customer_id", user.id)
    .single()

  if (!order) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "processing":
        return "default"
      case "shipped":
        return "default"
      case "delivered":
        return "default"
      default:
        return "secondary"
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button asChild variant="ghost">
            <Link href="/orders">← Back to Orders</Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="relative h-20 w-20 rounded-md overflow-hidden bg-muted shrink-0">
                        <Image
                          src={item.products?.image_url || "/placeholder.svg"}
                          alt={item.products?.name || "Product"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium line-clamp-1">{item.products?.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.products?.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                          <span className="font-semibold">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">{order.shipping_address}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${Number(order.total_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">${Number(order.total_amount).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Timeline status={order.status} createdAt={order.created_at} updatedAt={order.updated_at} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

const orderedStatuses = ["pending", "paid", "processing", "shipped", "delivered"] as const
type OrderStatus = (typeof orderedStatuses)[number] | "cancelled"

function Timeline({ status, createdAt, updatedAt }: { status: OrderStatus; createdAt: string; updatedAt: string }) {
  const completed = (step: OrderStatus) => {
    if (status === "cancelled") return false
    const currentIndex = orderedStatuses.indexOf(status as any)
    const stepIndex = orderedStatuses.indexOf(step as any)
    return stepIndex !== -1 && currentIndex >= stepIndex
  }

  const items = [
    { key: "pending", label: "Order Placed", time: createdAt },
    { key: "paid", label: "Order Confirmed", time: status !== "pending" ? updatedAt : null },
    { key: "processing", label: "Packaging", time: ["processing", "shipped", "delivered"].includes(status) ? updatedAt : null },
    { key: "shipped", label: "Out for Delivery", time: ["shipped", "delivered"].includes(status) ? updatedAt : null },
    { key: "delivered", label: "Delivered", time: status === "delivered" ? updatedAt : null },
  ] as const

  return (
    <div className="relative">
      {/* garis di tengah kolom icon (w-6 => center) */}
      <div className="absolute left-3 top-2 bottom-2 w-px bg-muted-foreground/30 z-0" />

      <div className="space-y-5">
        {items.map((it) => {
          const isActive = completed(it.key as OrderStatus)

          return (
            <div key={it.key} className="relative flex gap-3">
              {/* kolom icon fixed */}
              <div className="relative w-6 flex-none">
                <span className="absolute left-1/2 top-0.5 -translate-x-1/2 z-10 inline-flex rounded-full bg-background p-0.5">
                  <StepIcon active={isActive} />
                </span>
              </div>

              <div className="flex-1">
                <p className={`text-sm ${isActive ? "font-medium" : "text-muted-foreground"}`}>{it.label}</p>
                {it.time && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(it.time), "EEE, dd MMM yyyy HH:mm")}
                  </p>
                )}
              </div>
            </div>
          )
        })}

        {status === "cancelled" && (
          <div className="relative flex gap-3">
            <div className="relative w-6 flex-none">
              <span className="absolute left-1/2 top-0.5 -translate-x-1/2 z-10 inline-flex rounded-full bg-background p-0.5">
                <XCircle className="h-4 w-4 text-destructive" />
              </span>
            </div>
            <p className="text-sm text-destructive font-medium">Cancelled</p>
          </div>
        )}
      </div>
    </div>
  )
}


function StepIcon({ active }: { active?: boolean }) {
  return active ? (
    <CheckCircle2 className="h-4 w-4 text-primary" />
  ) : (
    <Circle className="h-4 w-4 text-muted-foreground" />
  )
}

