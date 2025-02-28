'use client';

import { useState } from 'react';
import { Plus,Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
interface SystemPrompt {
  id: string
  name: string
  prompt: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

interface SystemPromptDialogProps {
  mode: 'create' | 'edit';
  systemPrompt?: SystemPrompt;
  trigger?: React.ReactNode;
}
export default function SystemPromptDialog({ mode, systemPrompt, trigger }: SystemPromptDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (mode === 'create') {
      const response = await fetch('/api/systemprompts/create', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.get('name'),
          prompt: formData.get('content'),
        }),
      });
  
      setLoading(false);
  
      if (!response.ok) {
        return toast.error('Failed to create system prompt');
      }
  
      toast.success('System prompt created successfully');
      setOpen(false);
      router.refresh();
    } else if (mode === 'edit') {
      const response = await fetch('/api/systemprompts/update', {
        method: 'POST',
        body: JSON.stringify({
          id: systemPrompt?.id,
          name: formData.get('name'),
          prompt: formData.get('content'),  
        }),
      });

      setLoading(false);
      
      if (!response.ok) {
        return toast.error('Failed to update system prompt');
      }

      toast.success('System prompt updated successfully');
      setOpen(false);
      router.refresh();
    }
  }

  const defaultTrigger = mode === 'create' ? (
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      New System Prompt
    </Button>
  ) : (
    <Button variant="ghost" size="icon">
      <Pencil className="h-4 w-4" />
    </Button>
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
      {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
        <DialogTitle>{mode === 'create' ? 'Create' : 'Edit'} System Prompt</DialogTitle>
        <DialogDescription>
            {mode === 'create' ? 'Add a new' : 'Edit your'} system prompt for your AI conversations
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="name"
              name="name"
              placeholder="Name"
              required
              disabled={loading}
              defaultValue={systemPrompt?.name}
            />
          </div>
          <div className="space-y-2">
            <Textarea
              id="content"
              name="content"
              placeholder="System prompt content..."
              required
              disabled={loading}
              rows={5}
              defaultValue={systemPrompt?.prompt}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
            {loading ? `${mode === 'create' ? 'Creating' : 'Updating'}...` : mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 