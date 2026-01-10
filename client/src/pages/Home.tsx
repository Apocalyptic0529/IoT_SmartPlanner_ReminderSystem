import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTasks, useUpdateTask, useDeleteTask, useRescheduleTask } from "@/hooks/use-tasks";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { TaskCard } from "@/components/TaskCard";
import { StatsOverview } from "@/components/StatsOverview";
import { TaskForm } from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Search, 
  LayoutGrid, 
  List, 
  Filter,
} from "lucide-react";
import { Task, UpdateTaskRequest } from "@shared/schema";
import Confetti from "react-confetti";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient } from "@/lib/queryClient";

export default function Home() {
  const { user } = useAuth();
  const [filter, setFilter] = useState({ category: "all", priority: "all", search: "" });
  const { data: tasks, isLoading } = useTasks(filter);
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: rescheduleTask } = useRescheduleTask();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [taskToUncheck, setTaskToUncheck] = useState<Task | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (tasks) {
      (window as any).currentTasks = tasks;
      if (typeof (window as any).startTaskNotifications === 'function') {
        (window as any).startTaskNotifications(queryClient);
      }
    }
  }, [tasks]);

  useEffect(() => {
    if (tasks) {
      const missedCount = tasks.filter(t => t.status === 'missed').length;
      if (missedCount > 0) {
        toast({
          title: "Missed Tasks Alert",
          description: `You have ${missedCount} missed tasks. Time to catch up!`,
          variant: "destructive",
        });
      }
    }
  }, [tasks, toast]);

  const handleToggleStatus = (task: Task) => {
    if (task.status === "missed") return;
    
    if (task.status === "completed") {
      setTaskToUncheck(task);
      return;
    }

    const newStatus = "completed";
    updateTask({ id: task.id, status: newStatus });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const confirmUncheck = () => {
    if (taskToUncheck) {
      updateTask({ id: taskToUncheck.id, status: "pending" });
      setTaskToUncheck(null);
    }
  };

  const categories = ["all", "Academic", "Personal", "Work", "Urgent", "Health", "Finance"];

  const filteredTasks = tasks?.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(filter.search.toLowerCase()) || 
      t.description?.toLowerCase().includes(filter.search.toLowerCase());
    
    if (!matchesSearch) return false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = new Date(t.dueDateTime);

    if (activeTab === "all") {
      if (t.status !== "pending") return false;
      // Client-side safety check for missed tasks
      if (dueDate < now) return false;
    } else if (activeTab === "recurring") {
      if (!t.isRecurring) return false;
      if (t.status === "deleted") return false;
    } else if (activeTab === "upcoming") {
      if (!(t.status === "pending" && dueDate >= today && dueDate < tomorrow)) return false;
    } else if (activeTab === "missed") {
      if (t.status !== "missed") return false;
    } else if (activeTab === "completed") {
      if (t.status !== "completed") return false;
    }

    // Apply the dropdown filters (only if they are NOT "all")
    if (filter.category !== "all" && t.category !== filter.category) return false;
    if (filter.priority !== "all" && t.priority !== filter.priority) return false;
    
    return true;
  });

  return (
    <div className="space-y-6 md:space-y-8 px-1">
      <div className="md:hidden pt-4 pb-2">
        <h1 className="text-3xl font-display font-bold text-foreground dark:text-white">MaalaalaMoKaya</h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1">
          Welcome back, <span className="text-primary font-medium">{user?.username}</span>
        </p>
      </div>

      {showConfetti && (
        <Confetti 
          recycle={false} 
          numberOfPieces={1500} 
          gravity={0.1}
          initialVelocityY={30}
          width={window.innerWidth}
          height={document.documentElement.scrollHeight || window.innerHeight}
        />
      )}
      

      {/* Tabs */}
      <div className="flex gap-2 border-b dark:border-gray-800 pb-0 overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "My Tasks" },
          { id: "recurring", label: "Recurring Tasks" },
          { id: "upcoming", label: "Upcoming Today" },
          { id: "missed", label: "Missed" },
          { id: "completed", label: "Completed" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Uncheck Confirmation Dialog */}
      <Dialog open={!!taskToUncheck} onOpenChange={(open) => !open && setTaskToUncheck(null)}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Move back to pending?</DialogTitle>
            <DialogDescription className="dark:text-gray-400">
              This task will be removed from the Completed tab and moved back to your pending tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setTaskToUncheck(null)} className="dark:border-gray-700 dark:text-gray-300">
              Cancel
            </Button>
            <Button onClick={confirmUncheck} className="dark:bg-primary dark:text-white">
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-9 bg-card dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:placeholder:text-gray-500" 
            value={filter.search}
            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
            data-testid="input-search-tasks"
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <Select 
            value={filter.category} 
            onValueChange={(val) => setFilter(prev => ({ ...prev, category: val }))}
          >
            <SelectTrigger className="w-[140px] bg-card dark:bg-gray-900 dark:text-white dark:border-gray-700" data-testid="select-category-filter">
              <LayoutGrid className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-popover dark:bg-gray-900 dark:border-gray-700">
              <SelectItem value="all" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">All Categories</SelectItem>
              <SelectItem value="Personal" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Personal</SelectItem>
              <SelectItem value="Work" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Work</SelectItem>
              <SelectItem value="Academic" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Academic</SelectItem>
              <SelectItem value="Health" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Health</SelectItem>
              <SelectItem value="Finance" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Finance</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filter.priority} 
            onValueChange={(val) => setFilter(prev => ({ ...prev, priority: val }))}
          >
            <SelectTrigger className="w-[140px] bg-card dark:bg-gray-900 dark:text-white dark:border-gray-700" data-testid="select-priority-filter">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-popover dark:bg-gray-900 dark:border-gray-700">
              <SelectItem value="all" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">All Priorities</SelectItem>
              <SelectItem value="high" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">High</SelectItem>
              <SelectItem value="medium" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Medium</SelectItem>
              <SelectItem value="low" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <CreateTaskDialog />
        </div>
      </div>

      {/* Task Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold dark:text-white">My Tasks</h2>
          <span className="text-sm text-muted-foreground dark:text-gray-400">
            {filteredTasks?.length || 0} tasks found
          </span>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : filteredTasks?.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
            <div className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50">
              <List className="h-full w-full" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No tasks found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or create a new task.</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20 md:pb-0">
            <AnimatePresence>
              {filteredTasks?.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onEdit={setEditingTask}
                  onDelete={deleteTask}
                  onReschedule={(id, newDateTime) => rescheduleTask({ id, newDateTime })}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Floating Action Button (Mobile Only) */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <CreateTaskDialog isFloating />
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-[550px] dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl dark:text-white">Edit Task</DialogTitle>
            <DialogDescription className="dark:text-gray-400">Update your task details.</DialogDescription>
          </DialogHeader>
          {editingTask && (
            <TaskForm 
              defaultValues={editingTask}
              onSubmit={async (data) => {
                await updateTask({ id: editingTask.id, ...data });
                setEditingTask(null);
              }}
              isSubmitting={isUpdating}
              onCancel={() => setEditingTask(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
