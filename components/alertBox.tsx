"use client"
import { AlertDialog, AlertDialogCancel,AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface AlertBoxProps {
    title: string
    description: string
    onConfirm: () => void
    onCancel: () => void
    open: boolean
    onOpenChange: (open: boolean) => void
}


export default function AlertBox({ title, description, onConfirm, onCancel, open, onOpenChange }: AlertBoxProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
}


