'use server'

import { getSystemPrompts as getSystemPromptsQuery, deleteSystemPromptById as deleteSystemPromptQuery } from '@/lib/db/queries'

export async function getSystemPrompts(userId: string) {
  return getSystemPromptsQuery({ userId })
} 
export async function deleteSystemPrompt(id: string, userId: string) {
  return deleteSystemPromptQuery({ id, userId })
} 
