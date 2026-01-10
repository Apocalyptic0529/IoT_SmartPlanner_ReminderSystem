import { Task } from "@shared/schema";
import { format } from "date-fns";
import { 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Calendar, 
  Trash2, 
  Edit,
  Clock,
  Repeat,
  ExternalLink,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RescheduleDialog } from "./RescheduleDialog";

interface TaskCardProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onReschedule?: (taskId: number, newDateTime: Date) => void;
}

export function TaskCard({ task, onToggleStatus, onEdit, onDelete, onReschedule }: TaskCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUncompleteConfirm, setShowUncompleteConfirm] = useState(false);
  const isCompleted = task.status === "completed";
  const isMissed = task.status === "missed";

  const handleMissedClick = () => {
    if (isMissed) {
      setShowReschedule(true);
    }
  };
  
  const priorityColors = {
    high: "text-red-500 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900",
    medium: "text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900",
    low: "text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900",
  };

  const statusIcon = isCompleted ? (
    <CheckCircle2 className="h-6 w-6 text-primary" />
  ) : isMissed ? (
    <AlertCircle className="h-6 w-6 text-destructive" />
  ) : (
    <Circle className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" />
  );

  return (
    <>
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      onClick={() => setShowDetails(true)}
      className={cn(
        "group relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:shadow-lg hover:border-primary/20 bg-card dark:bg-gray-800/50 dark:border-gray-700 cursor-pointer",
        isCompleted && "opacity-75 bg-muted/30 dark:bg-gray-900/30"
      )}
    >
      <div className="absolute top-3 right-3 flex gap-1 z-30">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 sm:h-12 sm:w-12 hover:bg-primary/10 hover:text-primary transition-colors bg-card/80 backdrop-blur-sm shadow-sm opacity-100 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:text-white"
          onClick={(e) => { e.stopPropagation(); onEdit(task); }}
        >
          <Edit className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 sm:h-12 sm:w-12 hover:bg-destructive/10 hover:text-destructive transition-colors bg-card/80 backdrop-blur-sm shadow-sm opacity-100 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
        >
          <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>

      <div className="flex items-start gap-4">
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            if (isMissed) {
              handleMissedClick();
            } else if (isCompleted) {
              setShowUncompleteConfirm(true);
            } else {
              onToggleStatus(task);
            }
          }}
          className={cn(
            "mt-1 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center",
            isMissed && "cursor-pointer hover:opacity-80"
          )}
          title={isMissed ? "Click to reschedule" : isCompleted ? "Click to remove from completed" : "Click to mark complete"}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          ) : isMissed ? (
            <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-destructive" />
          ) : (
            <Circle className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2 pr-20">
            <Badge 
              variant="outline" 
              className={cn("uppercase text-[10px] tracking-wider font-bold", priorityColors[task.priority as keyof typeof priorityColors])}
            >
              {task.priority}
            </Badge>
            <Badge variant="secondary" className="text-[10px] text-muted-foreground dark:bg-gray-700 dark:text-gray-300">
              {task.category}
            </Badge>
            {task.isRecurring && (
              <Badge variant="outline" className="text-[10px] flex gap-1 items-center dark:border-gray-700 dark:text-gray-300">
                <Repeat className="h-3 w-3" /> {task.recurrenceType}
              </Badge>
            )}
            {isMissed && (
              <Badge variant="destructive" className="text-[10px]">Missed</Badge>
            )}
            {task.rescheduleCount && task.rescheduleCount > 0 && (
              <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-600 dark:border-blue-900 dark:text-blue-400">
                Rescheduled {task.rescheduleCount}x
              </Badge>
            )}
          </div>

          <h3 className={cn(
            "text-lg font-display font-semibold text-foreground dark:text-white mb-1 leading-tight",
            isCompleted && "line-through text-muted-foreground dark:text-gray-500"
          )}>
            {task.title}
          </h3>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground dark:text-gray-400 mt-2">
            <div className="flex items-center gap-2 sm:text-sm">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{format(new Date(task.dueDateTime), "MMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 sm:text-sm">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{format(new Date(task.dueDateTime), "h:mm a")}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

    <RescheduleDialog
      open={showReschedule}
      onOpenChange={setShowReschedule}
      taskTitle={task.title}
      taskScoreImpact={task.scoreImpact || 0}
      currentDueDate={new Date(task.dueDateTime)}
      onReschedule={(newDateTime) => {
        onReschedule?.(task.id, newDateTime);
        setShowReschedule(false);
      }}
    />

    <Dialog open={showDetails} onOpenChange={setShowDetails}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col dark:bg-gray-900 dark:border-gray-800">
        <DialogHeader className="flex-shrink-0">
          <div className="flex justify-between items-start pr-8">
            <DialogTitle className="text-2xl font-display font-bold dark:text-white">{task.title}</DialogTitle>
            <Badge variant="outline" className={cn("uppercase", priorityColors[task.priority as keyof typeof priorityColors])}>
              {task.priority === 'high' ? 'HIGH' : task.priority}
            </Badge>
          </div>
          <DialogDescription className="flex flex-col gap-2 text-xs mt-1 dark:text-gray-400">
            <div className="flex gap-2">
              <span>{task.category}</span>
              <span>•</span>
              <span>{format(new Date(task.dueDateTime), "PPP p")}</span>
            </div>
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {task.attachments.map((att, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] flex gap-1 items-center px-2 py-0.5 dark:bg-gray-800 dark:text-gray-300">
                    <ExternalLink className="h-3 w-3" /> {att.name}
                  </Badge>
                ))}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4 overflow-y-auto pr-4 flex-1">
          {task.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 dark:text-white">
                <Info className="h-4 w-4" /> Description
              </h4>
              <p className="text-sm text-muted-foreground bg-muted/30 dark:bg-gray-800/50 p-4 rounded-lg leading-relaxed whitespace-pre-wrap dark:text-gray-300">
                {task.description}
              </p>
            </div>
          )}

          {task.attachments && task.attachments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold dark:text-white">Attachments</h4>
              <div className="grid gap-3">
                {task.attachments.map((att, i) => (
                  <div key={i} className="rounded-lg border dark:border-gray-800 overflow-hidden">
                    {att.type === 'image' ? (
                      <div className="space-y-2">
                        <img src={att.url} alt={att.name} className="w-full h-auto max-h-[300px] object-contain bg-black/5 dark:bg-white/5" />
                        <div className="p-2 flex justify-between items-center text-xs">
                          <span className="truncate max-w-[200px] dark:text-gray-300">{att.name}</span>
                          <Button variant="ghost" size="sm" asChild className="dark:text-primary dark:hover:text-primary/80">
                            <a href={att.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" /> View Full
                            </a>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 flex justify-between items-center bg-muted/10 dark:bg-gray-800/30">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-primary/10 rounded-md">
                            <ExternalLink className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate dark:text-gray-200">{att.name}</p>
                            <p className="text-xs text-muted-foreground truncate dark:text-gray-400">{att.url}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="dark:border-gray-700 dark:text-gray-300">
                          <a href={att.url} target="_blank" rel="noopener noreferrer">Open</a>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {/* Delete Confirmation Dialog */}
    <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Task?</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{task.title}"? This action cannot be undone. However, your analytics and score history will remain intact.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => { 
            onDelete(task.id);
            setShowDeleteConfirm(false);
          }}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    {/* Uncomplete Confirmation Dialog */}
    <Dialog open={showUncompleteConfirm} onOpenChange={setShowUncompleteConfirm}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Remove from Completed?</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove "{task.title}" from completed? This will reverse the score you earned for completing this task.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setShowUncompleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={() => { 
            onToggleStatus(task);
            setShowUncompleteConfirm(false);
          }}>
            Remove from Completed
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
