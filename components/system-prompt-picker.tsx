import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select'
  import { Sparkles } from 'lucide-react'
  
  interface SystemPrompt {
    id: string
    name: string
    prompt: string
    userId: string
    createdAt: Date
    updatedAt: Date
  }
  
  export function SystemPromptPicker({
    systemPrompts,
    selectedPrompt,
    onPromptChange,
  }: {
    systemPrompts: SystemPrompt[]
    selectedPrompt?: SystemPrompt
    onPromptChange: (prompt: SystemPrompt) => void
  }) {
    return (
      <Select
        value={selectedPrompt?.id}
        onValueChange={(value) => {
          const prompt = systemPrompts.find(p => p.id === value)
          if (prompt) {
            onPromptChange(prompt)
          }
        }}
      >
        <SelectTrigger className="whitespace-nowrap border-none shadow-none focus:ring-0 px-0 py-0 h-6 text-xs">
          <SelectValue 
            placeholder="Select a System Prompt" 
          >
            <div className="flex items-center space-x-2">
              {!selectedPrompt?.id ? (
                <>
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <span>Default</span>
                </>
              ) : (
                <span>{selectedPrompt?.name}</span>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>System Prompts</SelectLabel>
            <SelectItem value="default">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-muted-foreground" />
                <span>Default</span>
              </div>
            </SelectItem>
            {systemPrompts.map((prompt) => (
              <SelectItem key={prompt.id} value={prompt.id}>
                <div className="flex items-center space-x-2">
                  <span>{prompt.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }
  