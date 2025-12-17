"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface OrderStatusSelectProps {
  orderId: string
  currentStatus: string
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

export function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()
  const router = useRouter()

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

      if (error) throw error

      setStatus(newStatus)
      toast({
        title: "Status updated",
        description: `Order status changed to ${newStatus}`,
      })
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Error updating order status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
