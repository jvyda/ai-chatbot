"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ServiceList } from "./components/service-list"
import { KeyList } from "./components/key-list"
import { AddServiceDialog } from "./components/add-service-dialog"
import { AddKeyDialog } from "./components/add-key-dialog"
import { ApiService, ApiKey } from "@/lib/db/schema"
import { getServices, deleteService, deleteApiKey } from "@/lib/actions/api-services"
import { getKeys, toggleApiKeyStatus } from "@/lib/actions/api-keys"
import { toast } from "sonner"

import AlertBox from "@/components/alertBox"

export default function ApiIntegrationsClient() {
  const [selectedService, setSelectedService] = useState<ApiService | null>(null)
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false)
  const [services, setServices] = useState<ApiService[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isKeysLoading, setIsKeysLoading] = useState(false)
  const [isServiceListLoading, setIsServiceListLoading] = useState(false)
  const [isDeleteServiveDialogOpen, setIsDeleteServiceDialogOpen] = useState(false)
  const [isDeleteApiDialogOpen, setIsDeleteApiDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null)
  const [apiKeyToDelete, setApiKeyToDelete] = useState<string | null>(null)

  const loadServices = async () => {
    const fetchedServices = await getServices()
    setServices(fetchedServices)
  }
  useEffect(() => {
    async function fetchServices() {
      setIsServiceListLoading(true)
      try {
        await loadServices()
      } catch (error) {
        toast.error("Failed to fetch services")
      } finally {
        setIsServiceListLoading(false)
      }
    }

    fetchServices()
  }, [])
  const handleAddService = () => {
    setIsAddServiceOpen(false)
    loadServices()
  }
  const handleDeleteService = async (serviceId: string) => {
    setServiceToDelete(serviceId)
    setIsDeleteServiceDialogOpen(true)
  }

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return

    try {
      await deleteService(serviceToDelete)
      toast.success("Service deleted successfully")
      loadServices()
    } catch (error) {
      toast.error("Failed to delete service")
    } finally {
      setIsDeleteServiceDialogOpen(false)
      setServiceToDelete(null)
    }
  }

  const confirmDeleteApi = async () => {
    if (!apiKeyToDelete) return
    console.log(apiKeyToDelete)
    try {
      await deleteApiKey({ keyId: apiKeyToDelete   })
      toast.success("Service deleted successfully")
      if (!selectedService?.id) return
      fetchKeys(selectedService?.id)
    } catch (error) {
      toast.error("Failed to delete service")
    } finally {
      setIsDeleteApiDialogOpen(false)
      setApiKeyToDelete(null)
    }
  }

  const fetchKeys = async (serviceId: string) => {
    if (!serviceId) return
    setIsKeysLoading(true)
    try {
      const fetchedKeys = await getKeys(serviceId)
      setApiKeys(fetchedKeys)
    } catch (error) { 
      toast.error("Failed to fetch API keys") 
    } finally {
      setIsKeysLoading(false)
    }
  }
  useEffect(() => {
    async function loadKeys() {
      if (!selectedService?.id) return
      
      await fetchKeys(selectedService?.id)
    }

    loadKeys()
  }, [selectedService])
  const handleAddKey = () => {
    setIsAddKeyOpen(false)
    if (!selectedService?.id) return
    fetchKeys(selectedService?.id)
    
  }
  const handleDeleteApiKey = async (keyId: string) => {
    setApiKeyToDelete(keyId)
    setIsDeleteApiDialogOpen(true)
  }
  return (
    <div className="flex h-[calc(100vh-12rem)] gap-8">
      <div className="w-1/3 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Services</h3>
          <Button onClick={() => setIsAddServiceOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>
        <ScrollArea className="flex-1 border rounded-lg">
          <ServiceList
            selectedService={selectedService}
            onServiceSelect={setSelectedService}
            services={services}
            isServiceListLoading={isServiceListLoading}
            onDeleteService={handleDeleteService}
          />
        </ScrollArea>
      </div>

      <div className="w-2/3 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">API Keys</h3>
          <Button
            onClick={() => setIsAddKeyOpen(true)}
            size="sm"
            disabled={!selectedService}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Key
          </Button>
        </div>
        <ScrollArea className="flex-1 border rounded-lg">
          <KeyList 
          serviceId={selectedService?.id} keys={apiKeys} 
          isLoading={isKeysLoading} setKeys={setApiKeys} 
          onDeleteKey={handleDeleteApiKey}/>
        </ScrollArea>
      </div>

      <AddServiceDialog
        open={isAddServiceOpen}
        onOpenChange={handleAddService}
      />

      <AddKeyDialog
        open={isAddKeyOpen}
        onOpenChange={handleAddKey}
        serviceId={selectedService?.id}
      />
      <AlertBox title="Are you sure?"
        description="This will permanently delete the service and all associated API keys."
        onConfirm={confirmDeleteService}
        onCancel={() => setIsDeleteServiceDialogOpen(false)}
        open={isDeleteServiveDialogOpen}
        onOpenChange={setIsDeleteServiceDialogOpen

        } />

<AlertBox title="Are you sure?"
        description="This will permanently delete the API key."
        onConfirm={confirmDeleteApi}
        onCancel={() => setIsDeleteApiDialogOpen(false)}
        open={isDeleteApiDialogOpen}
        onOpenChange={setIsDeleteApiDialogOpen

        } />
        
    </div>
  )
} 