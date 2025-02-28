import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

import { auth } from '@/app/(auth)/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getSystemPrompts, deleteSystemPromptById, updateSystemPromptById } from '@/lib/db/queries';
import SystemPromptDialog from './system-prompt-dialog';
import SystemPromptCard from './system-prompt-card';
export default async function SystemPrompts() {
  const session = await auth();
  if (!session?.user?.id) return notFound();

  const systemPrompts = await getSystemPrompts({ userId: session.user.id });


  return (
    <>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">System Prompts</h1>
            <p className="text-muted-foreground">
              Manage your AI system prompts
            </p>
          </div>
          <SystemPromptDialog mode="create" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {systemPrompts.map((prompt) => (
            <SystemPromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      </div>
    </>
  );
}