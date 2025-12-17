"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  stock: number
  image_url: string | null
  category: string | null
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        {product.stock < 10 && product.stock > 0 && (
          <Badge className="absolute top-2 right-2" variant="secondary">
            Only {product.stock} left
          </Badge>
        )}
        {product.stock === 0 && (
          <Badge className="absolute top-2 right-2" variant="destructive">
            Out of Stock
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        {product.category && (
          <Badge variant="outline" className="mb-2">
            {product.category}
          </Badge>
        )}
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
        <p className="text-2xl font-bold text-primary">${Number(product.price).toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={() => addItem(product)} disabled={product.stock === 0}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
