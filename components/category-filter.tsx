"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

const categories = [
  { name: "All", value: "" },
  { name: "Electronics", value: "Electronics" },
  { name: "Accessories", value: "Accessories" },
]

export function CategoryFilter({ currentCategory }: { currentCategory?: string }) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {categories.map((category) => (
        <Button
          key={category.value}
          variant={currentCategory === category.value || (!currentCategory && !category.value) ? "default" : "outline"}
          asChild
        >
          <Link href={category.value ? `/?category=${category.value}` : "/"}>{category.name}</Link>
        </Button>
      ))}
    </div>
  )
}
