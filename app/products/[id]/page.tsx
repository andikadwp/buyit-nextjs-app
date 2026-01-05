import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, Truck, Shield, ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { AddToCartButton } from "@/components/add-to-cart-button"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase.from("products").select("*").eq("id", id).single()

  if (!product) {
    notFound()
  }

  // Get related products from same category
  const { data: relatedProducts } = await supabase
    .from("products")
    .select("*")
    .eq("category", product.category)
    .neq("id", id)
    .limit(4)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Product Image */}
            <div className="aspect-square overflow-hidden rounded-xl border bg-muted">
              <img
                src={product.image_url || `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(product.name)}`}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-6">
              <div>
                <Badge variant="secondary" className="mb-3 capitalize">
                  {product.category}
                </Badge>
                <h1 className="mb-4 text-balance text-4xl font-bold">{product.name}</h1>
                <p className="text-3xl font-bold text-primary">${product.price}</p>
              </div>

              <Separator />

              <div>
                <h2 className="mb-2 text-lg font-semibold">Description</h2>
                <p className="text-pretty text-muted-foreground">{product.description}</p>
              </div>

              <Separator />

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-600">{product.stock} in stock</span>
                  </>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>

              {/* Add to Cart */}
              <AddToCartButton product={product} disabled={product.stock === 0} />

              {/* Features */}
              <Card>
                <CardContent className="grid gap-4 p-6">
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-semibold">Free Shipping</h3>
                      <p className="text-sm text-muted-foreground">On orders over $50</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-semibold">Secure Payment</h3>
                      <p className="text-sm text-muted-foreground">SSL encrypted checkout</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-semibold">30-Day Returns</h3>
                      <p className="text-sm text-muted-foreground">Money-back guarantee</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-8 text-balance text-3xl font-bold">Related Products</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.id}`}
                    className="group relative overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg"
                  >
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={
                          relatedProduct.image_url ||
                          `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(relatedProduct.name) || "/placeholder.svg"}`
                        }
                        alt={relatedProduct.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="mb-2 text-balance font-semibold">{relatedProduct.name}</h3>
                      <p className="text-lg font-bold">${relatedProduct.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
