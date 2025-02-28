'use client';

import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteSystemPrompt } from "@/app/actions/system-prompts"
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import SystemPromptDialog from './system-prompt-dialog';
interface SystemPrompt {
    id: string
    name: string
    prompt: string
    userId: string
    createdAt: Date
    updatedAt: Date
  }
interface SystemPromptCardProps {
  prompt: SystemPrompt;
}

export default function SystemPromptCard({ prompt }: SystemPromptCardProps) {
  const router = useRouter();
  const handleDelete = async (id: string, userId: string) => {
    console.log(id, userId)
    try {
        const response = await deleteSystemPrompt(id, userId)

   

      toast.success('System prompt deleted');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete system prompt');
    }
  };

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>{prompt.name}</CardTitle>
        <CardContent className='h-20 overflow-hidden p-0'>
          <p className="text-sm text-muted-foreground">{prompt.prompt}</p>
        </CardContent>
        <div className="absolute top-4 right-4 flex gap-2">
          <SystemPromptDialog mode="edit" systemPrompt={prompt} />
          <Button variant="ghost" size="icon" onClick={() => handleDelete(prompt.id, prompt.userId)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}