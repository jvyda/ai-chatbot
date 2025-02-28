"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AddServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddServiceDialog({ open, onOpenChange }: AddServiceDialogProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [wordLimit, setWordLimit] = useState("10000")
  const [isPending, setIsPending] = useState(false)

  const handleAddService = async () => {
    if (!name) return
    
    setIsPending(true)
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          wordLimit: parseInt(wordLimit) 
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`)
      }
      
      // Reset form
      setName("")
      setWordLimit("10000")
      
      // Close dialog
      onOpenChange(false)
      
      // Force update UI
      router.refresh()
      
      // Show success message
      toast.success("Service added successfully")
    } catch (error) {
      console.error("Failed to add service:", error)
      toast.error("Failed to add service")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Service</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter service name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wordLimit">Word Limit</Label>
            <Input
              id="wordLimit"
              type="number"
              value={wordLimit}
              onChange={(e) => setWordLimit(e.target.value)}
            />
          </div>
          <Button
            onClick={handleAddService}
            disabled={!name || isPending}
          >
            Add Service
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 