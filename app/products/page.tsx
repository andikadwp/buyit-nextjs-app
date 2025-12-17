import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { Skeleton } from "@/components/ui/skeleton"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string; min?: string; max?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase.from("products").select("*")

  // Apply filters
  if (params.category) {
    query = query.eq("category", params.category)
  }

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  if (params.min) {
    query = query.gte("price", Number.parseFloat(params.min))
  }

  if (params.max) {
    query = query.lte("price", Number.parseFloat(params.max))
  }

  // Apply sorting
  switch (params.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "name-asc":
      query = query.order("name", { ascending: true })
      break
    case "name-desc":
      query = query.order("name", { ascending: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data: products, count } = await query

  // Get all categories for filter
  const { data: categories } = await supabase.from("products").select("category").order("category")

  const uniqueCategories = Array.from(new Set(categories?.map((c) => c.category) || []))

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="border-b bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-balance text-4xl font-bold">Shop All Products</h1>
            <p className="mt-2 text-pretty text-muted-foreground">
              {count ? `${count} products found` : "Browse our collection"}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-6">
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <ProductFilters categories={uniqueCategories} currentParams={params} />
              </Suspense>
            </aside>

            <div>
              <Suspense
                fallback={
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                      <Skeleton key={i} className="h-[400px]" />
                    ))}
                  </div>
                }
              >
                <ProductGrid products={products || []} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
