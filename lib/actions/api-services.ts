'use server'

import { addApiService, getApiServices, deleteApiService, deleteApiKey as deleteKey } from "@/lib/db/queries"
import { revalidatePath } from "next/cache"
import { ApiService } from "@/lib/db/schema"

export async function addService({ 
  name, 
  wordLimit 
}: { 
  name: string
  wordLimit: number 
}) {
  try {
    await addApiService({ name, wordLimit })
    revalidatePath('/dashboard/api-integrations')
  } catch (error) {
    throw new Error('Failed to add service')
  }
}

export async function getServices(): Promise<ApiService[]> {
  try {
    return await getApiServices()
  } catch (error) {
    throw new Error('Failed to fetch services')
  }
} 

export async function deleteService(serviceId: string) {
  try {
    await deleteApiService(serviceId)
  } catch (error) {
    throw new Error('Failed to delete service')
  }
}
export async function deleteApiKey({ keyId }: { keyId: string}) {
  try {
    await deleteKey({ keyId })
  } catch (error) {
    throw new Error('Failed to delete API key')
  }
}
