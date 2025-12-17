"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success("Logged out successfully")
    router.push("/")
    router.refresh()
  }

  return (
    <Button onClick={handleLogout} variant="outline" className="w-full justify-start bg-transparent">
      <LogOut className="mr-2 h-4 w-4" />
      Sign Out
    </Button>
  )
}
