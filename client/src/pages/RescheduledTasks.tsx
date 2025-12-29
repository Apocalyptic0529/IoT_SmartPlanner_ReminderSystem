import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2, RotateCcw } from "lucide-react";

export default function RescheduledTasks() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    select: (data) => data.filter((t) => t.status === "rescheduled" || (typeof t.rescheduleCount === 'number' && t.rescheduleCount > 0) || (t.status === "pending" && typeof t.rescheduleCount === 'number' && t.rescheduleCount > 0)),
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
        <h1 className="text-3xl font-display font-bold dark:text-white">Rescheduled Tasks</h1>
        <p className="text-muted-foreground mt-2 dark:text-gray-400">
          History of tasks that were missed and rescheduled.
        </p>
      </div>

      <div className="grid gap-4">
        {tasks?.length === 0 ? (
          <Card className="p-12 text-center dark:bg-gray-800/50">
            <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground dark:text-gray-400">No rescheduled tasks found.</p>
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
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                      Rescheduled {task.rescheduleCount || 1}x
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs space-y-1">
                  <p className="text-muted-foreground dark:text-gray-400 line-through">
                    Original Due: {task.originalDueDateTime ? format(new Date(task.originalDueDateTime), "MMM d, HH:mm") : "N/A"}
                  </p>
                  <p className="font-medium text-primary dark:text-primary-foreground">
                    New Due: {format(new Date(task.dueDateTime), "MMM d, HH:mm")}
                  </p>
                  {task.scoreImpact && task.scoreImpact !== 0 && (
                    <p className="text-red-500 font-bold">
                      Missed Score: -{task.scoreImpact}
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
