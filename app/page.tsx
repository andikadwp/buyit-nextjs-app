import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, Shield, Truck, CreditCard, Star } from "lucide-react"
import Link from "next/link"

export default async function Home() {
  const supabase = await createClient()

  // Get featured products
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*")
    .limit(6)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="container mx-auto px-4 py-24 md:py-32 lg:py-40">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-6 text-sm" variant="secondary">
                Free Shipping on Orders Over $50
              </Badge>
              <h1 className="mb-6 text-balance text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                Premium Tech
                <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Redefined
                </span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
                Discover cutting-edge electronics and accessories designed to elevate your everyday. Quality, style, and
                innovation in every product.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="min-w-[180px]">
                  <Link href="/products">
                    Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="min-w-[180px] bg-transparent">
                  <Link href="/products">Browse Collection</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="border-y bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Free Shipping</h3>
                  <p className="text-sm text-muted-foreground">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure Payment</h3>
                  <p className="text-sm text-muted-foreground">SSL encrypted</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Easy Returns</h3>
                  <p className="text-sm text-muted-foreground">30-day guarantee</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Top Quality</h3>
                  <p className="text-sm text-muted-foreground">Premium products</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Featured Products</h2>
            <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
              Handpicked selection of our most popular items
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts?.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={
                      product.image || `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(product.name)}`
                    }
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-balance text-lg font-semibold">{product.name}</h3>
                  <p className="mb-4 line-clamp-2 text-pretty text-sm text-muted-foreground">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">${product.price}</span>
                    {product.stock > 0 ? (
                      <Badge variant="secondary">In Stock</Badge>
                    ) : (
                      <Badge variant="destructive">Out of Stock</Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button asChild size="lg" variant="outline">
              <Link href="/products">
                View All Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Brand Story */}
        <section className="bg-muted/30">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="mb-6 text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
                  Innovation Meets Design
                </h2>
                <p className="mb-6 text-pretty text-lg text-muted-foreground">
                  We believe technology should be beautiful, functional, and accessible to everyone. That's why we
                  curate only the finest electronics and accessories that blend cutting-edge innovation with timeless
                  design.
                </p>
                <ul className="mb-8 space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                    <span>Carefully selected products from trusted brands</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                    <span>Rigorous quality control on every item</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                    <span>Dedicated customer support team</span>
                  </li>
                </ul>
                <Button asChild size="lg">
                  <Link href="/about">Learn More About Us</Link>
                </Button>
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <img src="/modern-tech-workspace-with-premium-electronics.jpg" alt="Our Story" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-8 text-center text-primary-foreground md:p-16">
            <h2 className="mb-4 text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Ready to Upgrade?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg opacity-90">
              Join thousands of satisfied customers who trust us for their tech needs
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="min-w-[180px]">
                <Link href="/products">Start Shopping</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-w-[180px] border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/auth/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
