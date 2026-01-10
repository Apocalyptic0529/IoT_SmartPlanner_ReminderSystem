import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, Trash2 } from "lucide-react";

export default function DeletedTasks() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    select: (data) => data.filter((t) => t.status === "deleted"),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold dark:text-white">Deleted Tasks</h1>
        <p className="text-muted-foreground mt-2 dark:text-gray-400">
          History of tasks moved to trash. Permanent cleanup available in Settings.
        </p>
      </div>

      <div className="grid gap-4">
        {tasks?.length === 0 ? (
          <Card className="p-12 text-center dark:bg-gray-800/50">
            <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground dark:text-gray-400">No deleted tasks found.</p>
          </Card>
        ) : (
          tasks?.map((task) => (
            <Card key={task.id} className="p-4 dark:bg-gray-800/50">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-semibold dark:text-white">{task.title}</h3>
                  <div className="flex gap-2 text-xs">
                    <span className="px-2 py-0.5 bg-secondary rounded text-secondary-foreground">
                      {task.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs space-y-1">
                  <p className="text-muted-foreground dark:text-gray-400">
                    Deleted on: {task.deletedAt ? format(new Date(task.deletedAt), "MMM d, yyyy HH:mm") : "N/A"}
                  </p>
                  <p className="font-medium text-amber-600 dark:text-amber-400 capitalize">
                    {task.deletionReason}
                  </p>
                  {task.scoreImpact && task.scoreImpact !== 0 && (
                    <p className="text-red-500 font-bold">
                      Score Impact: -{task.scoreImpact}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
