import { useState } from "react";
import { useCreateTask } from "@/hooks/use-tasks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskForm } from "./TaskForm";

interface CreateTaskDialogProps {
  isFloating?: boolean;
}

export function CreateTaskDialog({ isFloating }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createTask, isPending } = useCreateTask();

  const handleSubmit = async (data: any) => {
    await createTask(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isFloating ? (
          <Button 
            className="rounded-full w-14 h-14 shadow-2xl shadow-primary/40 hover:shadow-primary/50 transition-all active:scale-95 flex items-center justify-center p-0"
            size="icon"
          >
            <Plus className="h-8 w-8" />
          </Button>
        ) : (
          <Button 
            className="rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95"
            size="lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] dark:bg-gray-900 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display dark:text-white">Create New Task</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Add details for your new task to keep track of your goals.
          </DialogDescription>
        </DialogHeader>
        <TaskForm 
          onSubmit={handleSubmit} 
          isSubmitting={isPending} 
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
