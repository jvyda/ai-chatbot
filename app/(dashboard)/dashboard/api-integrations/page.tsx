import { Separator } from "@/components/ui/separator"
import ApiIntegrationsClient from "./client"

export const metadata = {
  title: 'API Integrations',
  description: 'Manage your API services and keys',
}

export default async function ApiIntegrationsPage() {
  return (
    <div className="space-y-6 p-6 pb-16">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">API Integrations</h2>
        <p className="text-muted-foreground">
          Manage your API services and associated keys
        </p>
      </div>
      <Separator />
      <ApiIntegrationsClient />
    </div>
  )
}
