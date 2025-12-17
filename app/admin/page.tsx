"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Package, ShoppingCart, AlertTriangle, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useEffect, useState } from "react"
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

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

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0
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
        const dayOrders = orders?.filter((order) => order.created_at.startsWith(date)) || []
        const revenue = dayOrders.reduce((sum, order) => sum + Number(order.total_amount), 0)
        return {
          date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
          revenue: Math.round(revenue),
          orders: dayOrders.length,
        }
      })

      setSalesData(salesByDay)

      // Generate category sales data
      const categories = [...new Set(products?.map((p) => p.category) || [])]
      const categoryStats = categories.map((category) => {
        const categoryProducts = products?.filter((p) => p.category === category) || []
        const totalSold = categoryProducts.reduce((sum, p) => sum + (100 - p.stock), 0) // Mock calculation
        return {
          category: category || "Other",
          sales: totalSold,
        }
      })

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
              <Package className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Admin Dashboard</span>
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
              <CardDescription>Revenue and orders for the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: {
                    label: "Revenue",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Product performance across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sales: {
                    label: "Sales",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="var(--color-sales)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
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
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">#{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{order.customers?.full_name || "Unknown"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${Number(order.total_amount).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                      </div>
                    </div>
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
