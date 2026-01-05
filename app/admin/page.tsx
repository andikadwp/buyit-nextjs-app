"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, ShoppingCart, AlertTriangle, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEffect, useState } from "react"
import { Area, AreaChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SalesByCategoryRadial } from "@/components/charts/sales-by-category-radial"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    revenueGrowth: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [salesData, setSalesData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const supabase = createClient()

  const categoryMap = Object.fromEntries(
    categoryData.map((c) => [c.category, Number(c.sales) || 0]),
  )

  const palette = [
    "text-primary",
    "text-sky-500",
    "text-emerald-500",
    "text-amber-500",
    "text-fuchsia-500",
    "text-rose-500",
  ] as const

  // dummy data sementara
  const gaugeCategoryData = [
    { label: "Electronics", value: 3, colorClass: palette[0] },
    { label: "Gaming", value: 12, colorClass: palette[1] },
    { label: "Wearables", value: 7, colorClass: palette[2] },
    { label: "Accessories", value: 5, colorClass: palette[3] },
    { label: "Audio", value: 2, colorClass: palette[4] },
  ].sort((a, b) => b.value - a.value)
  
  // const gaugeCategoryData = categoryData.map((it, idx) => ({
  //   label: it.category,
  //   value: Number(it.sales) || 0,
  //   colorClass: palette[idx % palette.length],
  // }))

  const hasSales = gaugeCategoryData.some((d) => d.value > 0)

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)

      // Get dashboard statistics
      const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false })
      const { data: products } = await supabase.from("products").select("*")
      const { data: customers } = await supabase.from("customers").select("*")

      const totalRevenue =
        orders?.filter((order) => order.status === "delivered").reduce((sum, order) => sum + Number(order.total_amount), 0) ||
        0
      const totalOrders = orders?.length || 0
      const totalProducts = products?.length || 0
      const totalCustomers = customers?.length || 0
      const pendingOrders = orders?.filter((order) => order.status === "pending").length || 0
      const lowStockProducts = products?.filter((product) => product.stock < 10).length || 0

      setStats({
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        pendingOrders,
        lowStockProducts,
        revenueGrowth: 12.5, // Mock data
      })

      // Get recent orders
      const { data: recentOrdersData } = await supabase
        .from("orders")
        .select(
          `
          *,
          customers (full_name)
        `,
        )
        .order("created_at", { ascending: false })
        .limit(5)

      setRecentOrders(recentOrdersData || [])

      // Generate sales data for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return date.toISOString().split("T")[0]
      })

      const salesByDay = last7Days.map((date) => {
        const dayOrders = orders?.filter(
          (order) => order.created_at.startsWith(date) && order.status === "delivered",
        ) || []
        const revenue = dayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0)
        return {
          date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
          revenue: Math.round(revenue),
          orders: dayOrders.length,
        }
      })

      setSalesData(salesByDay)

      // Generate category sales data
      const { data: items } = await supabase
        .from("order_items")
        .select(
          `
          quantity,
          orders (status),
          products (category)
        `,
        )
        .eq("orders.status", "delivered")

      const categoryMap: Record<string, number> = {}
      items?.forEach((it: any) => {
        const cat = it.products?.category || "Other"
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(it.quantity)
      })
      const categoryStats = Object.entries(categoryMap).map(([category, sales]) => ({ category, sales }))

      setCategoryData(categoryStats)
    }

    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
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
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link href="/">View Store</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/profile">Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600">+{stats.revenueGrowth}%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.pendingOrders} pending orders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.lowStockProducts > 0 && (
                  <span className="text-orange-600">{stats.lowStockProducts} low stock</span>
                )}
                {stats.lowStockProducts === 0 && "All products in stock"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">Total registered users</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Revenue for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px]">
              {salesData.length > 0 ? (
                <ChartContainer
                  config={{
                    revenue: { label: "Revenue", color: "var(--chart-2)" },
                  }}
                  className=""
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--color-revenue)"
                        fill="url(#fillRevenue)"
                        strokeWidth={0.25}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Product performance across categories</CardDescription>
            </CardHeader>

            <CardContent className="py-3">
  {hasSales ? (
    <SalesByCategoryRadial
      subtitle="Sales"
      data={[
        { label: "Electronics", value: 3, chartToken: 1 },
        { label: "Gaming", value: 12, chartToken: 2 },
        { label: "Wearables", value: 7, chartToken: 3 },
        { label: "Accessories", value: 5, chartToken: 4 },
        { label: "Audio", value: 2, chartToken: 5 },
      ]}
    />
  ) : (
    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
      No sales yet
    </div>
  )}
</CardContent>
          </Card>

        </div>

        {/* Quick Actions & Alerts */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button asChild className="justify-start bg-transparent" variant="outline">
                <Link href="/admin/products/new">
                  <Package className="mr-2 h-4 w-4" />
                  Add New Product
                </Link>
              </Button>
              <Button asChild className="justify-start bg-transparent" variant="outline">
                <Link href="/admin/orders">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  View All Orders
                </Link>
              </Button>
              <Button asChild className="justify-start bg-transparent" variant="outline">
                <Link href="/admin/customers">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Customers
                </Link>
              </Button>
            </CardContent>
          </Card>

          {stats.lowStockProducts > 0 && (
            <Card className="border-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Low Stock Alert
                </CardTitle>
                <CardDescription>{stats.lowStockProducts} products need restocking</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/admin/products?filter=low-stock">View Low Stock Items</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest 5 orders from customers</CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders && recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between hover:bg-muted/50 rounded-md p-2">
                      <div>
                        <p className="text-sm font-medium">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{order.customers?.full_name || "Unknown"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${Number(order.total_amount).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No orders yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
