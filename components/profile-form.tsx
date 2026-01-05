"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface ProfileFormProps {
  initial?: {
    full_name?: string
    email?: string
    phone?: string
    address?: string
  }
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const supabase = createClient()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState(initial?.full_name || "")
  const [email, setEmail] = useState(initial?.email || "")
  const [phone, setPhone] = useState(initial?.phone || "")
  const [address, setAddress] = useState(initial?.address || "")

  useEffect(() => {
    if (!initial) {
      ;(async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          setEmail(user.email || "")
          const { data: customer } = await supabase.from("customers").select("*").eq("id", user.id).single()
          if (customer) {
            setFullName(customer.full_name || user.user_metadata?.full_name || "")
            setPhone(customer.phone || "")
            setAddress(customer.address || "")
          }
        }
      })()
    }
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please login first",
        })
        return
      }

      if (email && email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email })
        if (emailError) throw emailError
      }

      const { data: exists } = await supabase.from("customers").select("id").eq("id", user.id).single()
      if (!exists) {
        const { error } = await supabase.from("customers").insert({
          id: user.id,
          full_name: fullName || user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer",
          phone,
          address,
        })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("customers")
          .update({
            full_name: fullName || user.user_metadata?.full_name || user.email?.split("@")[0] || "Customer",
            phone,
            address,
          })
          .eq("id", user.id)
        if (error) throw error
      }

      toast({
        title: "Profile updated",
        description: "Your information has been saved",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={4} />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  )
}
