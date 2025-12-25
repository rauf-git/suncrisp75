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
      <AlertDialogContent className="max-w-[95vw] sm:max-w-md p-4 sm:p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-lg sm:text-xl">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm sm:text-base">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-3 sm:gap-2 mt-4">
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