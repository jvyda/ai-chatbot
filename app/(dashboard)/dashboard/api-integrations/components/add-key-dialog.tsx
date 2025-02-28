"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { addApiKey } from "@/lib/actions/api-keys"
import { useRouter } from "next/navigation"

interface AddKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceId?: string
}

export function AddKeyDialog({ open, onOpenChange, serviceId }: AddKeyDialogProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [key, setKey] = useState("")
  const [isPending, setIsPending] = useState(false)

  const handleAddKey = async () => {
    if (!name || !key || !serviceId) return
    
    setIsPending(true)
    try {
      const result = await addApiKey({ name, key, serviceId })
      
      // Reset form
      setName("")
      setKey("")
      
      // Close dialog
      onOpenChange(false)
      
      // Force update UI in two ways
      router.refresh()
      
      // Show success message
      toast.success("API key added successfully")
    } catch (error) {
      console.error("Failed to add API key:", error)
      toast.error("Failed to add API key")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New API Key</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Key Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter key name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="key">API Key</Label>
            <Input
              id="key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter API key"
              type="password"
            />
          </div>
          <Button
            onClick={handleAddKey}
            disabled={!name || !key || !serviceId || isPending}
          >
            Add Key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 