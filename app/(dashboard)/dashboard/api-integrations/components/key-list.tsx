"use client"

import { useState } from "react"
import { ApiKey } from "@/lib/db/schema"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toggleApiKeyStatus } from "@/lib/actions/api-keys"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { TrashIcon } from "lucide-react"
interface KeyListProps {
  serviceId?: string
  keys: ApiKey[]
  setKeys: (keys: ApiKey[]) => void
  isLoading: boolean
  onDeleteKey: (keyId: string) => Promise<void>
}

export function KeyList({ serviceId, keys, setKeys, isLoading, onDeleteKey}: KeyListProps) {
 
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleToggleStatus = async (keyId: string) => {
    if (!serviceId) return
    
    try {
      const result = await toggleApiKeyStatus(keyId, serviceId)
      if (result.success) {
        // Update the local state with the new data
        setKeys(result.data);
      }
      toast.success("API key status updated")
    } catch (error) {
      toast.error("Failed to update API key status")
    } finally {
    }
  }

  if (!serviceId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Select a service to view its API keys
      </div>
    )
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  const handleDelete = async (keyId: string) => {
    setIsDeleting(keyId)
    onDeleteKey(keyId)
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Expires</TableHead>
          <TableHead className="text-right">Active</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((key: ApiKey) => (
          <TableRow key={key.id}>
            <TableCell>{key.name || 'Unnamed Key'}</TableCell>
            <TableCell>
              <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                {key.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(key.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {key.expiresAt 
                ? new Date(key.expiresAt).toLocaleDateString()
                : 'Never'}
            </TableCell>
            <TableCell className="text-right">
              <Switch
                checked={key.status === 'active'}
                onCheckedChange={() => handleToggleStatus(key.id)}
              />
            </TableCell>
            <TableCell className="text-right">
            <Button 
            onClick={() => handleDelete(key.id)}
                    variant="ghost" 
                    size="icon"
                    disabled={isDeleting === key.id}
                    className="h-8 w-8 text-destructive hover:text-destructive/90"
                  >
                    {isDeleting === key.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 