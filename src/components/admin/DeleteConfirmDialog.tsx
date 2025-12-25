import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete Project",
  description = "Are you sure you want to delete this project? This action cannot be undone.",
  isLoading = false,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <AlertDialogHeader className="px-4 sm:px-6 py-3 sm:py-4 shrink-0">
          <AlertDialogTitle className="font-serif text-lg sm:text-xl">{title}</AlertDialogTitle>
        </AlertDialogHeader>
        <ScrollArea className="flex-1 min-h-0 px-4 sm:px-6">
          <AlertDialogDescription className="text-sm sm:text-base pb-4">{description}</AlertDialogDescription>
        </ScrollArea>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-3 sm:gap-2 px-4 sm:px-6 py-4 border-t border-border shrink-0">
          <AlertDialogCancel disabled={isLoading} className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}