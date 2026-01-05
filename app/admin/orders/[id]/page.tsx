import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, User, MapPin, Phone, CheckCircle2, Circle, XCircle } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
// import { OrderStatusSelect } from "@/components/admin/order-status-select"
const orderedStatuses = ["pending", "paid", "processing", "shipped", "delivered"] as const
type OrderStatus = (typeof orderedStatuses)[number] | "cancelled"

function AdminTimeline({
  status,
  createdAt,
  updatedAt,
}: {
  status: OrderStatus
  createdAt: string
  updatedAt: string
}) {
  const completed = (step: OrderStatus) => {
    if (status === "cancelled") return false
    const currentIndex = orderedStatuses.indexOf(status as any)
    const stepIndex = orderedStatuses.indexOf(step as any)
    return stepIndex !== -1 && currentIndex >= stepIndex
  }

  const items = [
    { key: "pending", label: "Order Placed", time: createdAt },
    { key: "paid", label: "Order Confirmed", time: status !== "pending" ? updatedAt : null },
    {
      key: "processing",
      label: "Packaging",
      time: ["processing", "shipped", "delivered"].includes(status) ? updatedAt : null,
    },
    {
      key: "shipped",
      label: "Out for Delivery",
      time: ["shipped", "delivered"].includes(status) ? updatedAt : null,
    },
    { key: "delivered", label: "Delivered", time: status === "delivered" ? updatedAt : null },
  ] as const

  return (
    <div className="relative">
      {/* garis vertikal di tengah kolom icon */}
      <div className="absolute left-3 top-2 bottom-2 w-px bg-muted-foreground/30 z-0" />

      <div className="space-y-5">
        {items.map((it) => {
          const isActive = completed(it.key as OrderStatus)

          return (
            <div key={it.key} className="relative flex gap-3">
              {/* kolom icon fixed */}
              <div className="relative w-6 flex-none">
                <span className="absolute left-1/2 top-0.5 -translate-x-1/2 z-10 inline-flex rounded-full bg-background p-0.5">
                  {isActive ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                </span>
              </div>

              {/* konten */}
              <div className="flex-1">
                <p className={`text-sm ${isActive ? "font-medium" : "text-muted-foreground"}`}>
                  {it.label}
                </p>

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
            <div>
              <p className="text-sm text-destructive font-medium">Cancelled</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: adminCheck } = await supabase.from("admins").select("*").eq("id", user.id).single()

  if (!adminCheck) {
    redirect("/")
  }

  // Get order details
  const { data: order } = await supabase
    .from("orders")
    .select(
      `
      *,
      customers (
        full_name,
        phone,
        address
      ),
      order_items (
        *,
        products (
          name,
          image_url
        )
      )
    `,
    )
    .eq("id", id)
    .single()

  if (!order) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/admin">Admin</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/admin/orders">Orders</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Detail</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-muted-foreground">
              Placed {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="capitalize" variant="secondary">
              {order.status}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="h-20 w-20 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img
                          src={
                            item.products?.image_url ||
                            `/placeholder.svg?height=80&width=80&query=${encodeURIComponent(item.products?.name) || "/placeholder.svg"}`
                          }
                          alt={item.products?.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.products?.name}</h3>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        <p className="text-sm font-medium mt-1">${Number(item.price).toFixed(2)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(Number(item.price) * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${Number(order.total_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${Number(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminTimeline status={order.status} createdAt={order.created_at} updatedAt={order.updated_at} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{order.customers?.full_name || "Unknown"}</p>
                  </div>
                </div>
                {order.customers?.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">{order.customers.phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{order.shipping_address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
