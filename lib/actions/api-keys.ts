'use server'

import { revalidatePath } from 'next/cache'
import { addApiKey as createKey, updateApiKeyStatus } from '@/lib/db/queries' // Import the appropriate query function
import { getApiKeysByServiceId } from "@/lib/db/queries"
import { ApiKey } from "@/lib/db/schema"
import { auth } from "@/app/(auth)/auth"

interface AddApiKeyParams {
  name: string
  key: string
  serviceId: string
}

export async function addApiKey({ name, key, serviceId }: AddApiKeyParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }
    
    // Check if there's any active key for this service
    const existingKeys = await getApiKeysByServiceId({
      serviceId,
      userId: session.user.id
    })
    
    const hasActiveKey = existingKeys.some(k => k.status === "active")
    
    await createKey({ 
      name, 
      key, 
      serviceId,
      userId: session.user.id,
      status: hasActiveKey ? "inactive" : "active" 
    })
    
    revalidatePath('/dashboard/api-integrations')
    return { success: true }
  } catch (error) {
    console.error('Failed to add API key:', error)
    throw new Error('Failed to add API key')
  }
}

export async function toggleApiKeyStatus(keyId: string, serviceId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }
    
    // Get all keys for this service
    const serviceKeys = await getApiKeysByServiceId({
      serviceId,
      userId: session.user.id
    })
    
    // Get the key we want to toggle
    const keyToToggle = serviceKeys.find(k => k.id === keyId)
    if (!keyToToggle) {
      throw new Error("API key not found")
    }
    
    const newStatus = keyToToggle.status === "active" ? "inactive" : "active"
    
    // If we're activating this key, deactivate all others
    if (newStatus === "active") {
      // Deactivate all other keys for this service
      for (const key of serviceKeys) {
        if (key.id !== keyId && key.status === "active") {
          await updateApiKeyStatus({
            keyId: key.id,
            serviceId,
            status: "inactive",
            userId: session.user.id
          })
        }
      }
    }
    
    // Update the status of the target key
    await updateApiKeyStatus({
      keyId,
      serviceId,
      status: newStatus,
      userId: session.user.id
    })
    
    // Force a more aggressive revalidation
    revalidatePath('/dashboard/api-integrations', 'layout')
    
    // Return the updated keys so the client can update its state
    const updatedKeys = await getApiKeysByServiceId({
      serviceId,
      userId: session.user.id
    })
    
    return { success: true, data: updatedKeys }
  } catch (error) {
    console.error('Failed to toggle API key status:', error)
    throw new Error('Failed to toggle API key status')
  }
}

export async function getKeys(serviceId: string): Promise<ApiKey[]> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new Error("Unauthorized")
    }
    
    return await getApiKeysByServiceId({
      serviceId,
      userId: session.user.id
    })
  } catch (error) {
    throw new Error('Failed to fetch API keys')
  }
} 