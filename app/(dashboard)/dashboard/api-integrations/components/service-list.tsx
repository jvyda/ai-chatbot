"use client"

import { useEffect, useState } from "react"
import { ApiService } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Trash2 } from "lucide-react"

interface ServiceListProps {
  selectedService: ApiService | null
  onServiceSelect: (service: ApiService) => void
  onDeleteService: (serviceId: string) => Promise<void>
  services: ApiService[],
  isServiceListLoading: boolean
}

export function ServiceList({
  selectedService,
  onServiceSelect,
  onDeleteService,
  services,
  isServiceListLoading }: ServiceListProps) {
    const handleDelete = async (e: React.MouseEvent, serviceId: string) => {
      e.stopPropagation() // Prevent triggering the parent button click
      await onDeleteService(serviceId)
    }

  if (isServiceListLoading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="p-2">
      {services.map((service: ApiService) => (
        <div 
        key={service.id}
        className={cn(
          "flex items-center w-full p-2 rounded-md mb-1 hover:bg-accent cursor-pointer",
          selectedService?.id === service.id && "bg-muted"
        )}
        onClick={() => onServiceSelect(service)}
      >
        <div className="flex flex-col items-start flex-1">
          <span className="font-medium">{service.name}</span>
          <span className="text-xs text-muted-foreground">
            Limit: {service.wordLimit} words
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
          onClick={(e) => handleDelete(e, service.id)}
        >
          <Trash2 size={16} />
          <span className="sr-only">Delete {service.name}</span>
        </Button>
      </div>
      ))}
    </div>
  )
} 