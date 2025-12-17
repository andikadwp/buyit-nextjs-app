import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export default async function AdminSetupPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/admin/setup")
  }

  // Check if user is already admin
  const { data: adminCheck } = await supabase.from("admins").select("*").eq("id", user.id).single()

  if (adminCheck) {
    redirect("/admin")
  }

  // Check if admins table exists
  const { data: adminsTable, error: tableError } = await supabase.from("admins").select("count").limit(1)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Admin Panel Setup</CardTitle>
          <CardDescription>Follow these steps to gain access to the admin panel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Your Account Information</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-1">
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>User ID:</strong> {user.id}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {tableError ? (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Step 1: Create Admin Table</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>The admins table does not exist yet. Run the setup script first:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Go to your Supabase project dashboard</li>
                  <li>Navigate to SQL Editor</li>
                  <li>Run the script from: scripts/006_easy_admin_setup.sql</li>
                </ol>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle>Step 1: Admin Table Ready</AlertTitle>
              <AlertDescription>The admins table exists and is ready to use.</AlertDescription>
            </Alert>
          )}

          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Step 2: Make Yourself Admin</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <p>Run this SQL command in Supabase SQL Editor to grant yourself admin access:</p>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto mt-2">
                {`INSERT INTO admins (id, email, role)
VALUES ('${user.id}', '${user.email}', 'admin')
ON CONFLICT (id) DO NOTHING;`}
              </pre>
              <p className="mt-2 text-sm">
                After running this command, refresh this page and you'll be redirected to the admin dashboard.
              </p>
            </AlertDescription>
          </Alert>

          <Alert>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
            <AlertTitle>Alternative: Use Supabase Dashboard</AlertTitle>
            <AlertDescription className="mt-2">
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Open Supabase Dashboard</li>
                <li>Go to Table Editor → admins table</li>
                <li>Click "Insert row"</li>
                <li>
                  Fill in: id = <code className="bg-muted px-1 py-0.5 rounded">{user.id}</code>
                </li>
                <li>
                  Fill in: email = <code className="bg-muted px-1 py-0.5 rounded">{user.email}</code>
                </li>
                <li>Fill in: role = admin</li>
                <li>Click "Save"</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
