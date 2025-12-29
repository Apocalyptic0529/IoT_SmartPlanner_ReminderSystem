import { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string;
  taskScoreImpact: number;
  currentDueDate: Date;
  onReschedule: (newDateTime: Date) => void;
}

export function RescheduleDialog({
  open,
  onOpenChange,
  taskTitle,
  taskScoreImpact,
  currentDueDate,
  onReschedule,
}: RescheduleDialogProps) {
  const [newDate, setNewDate] = useState(format(currentDueDate, "yyyy-MM-dd"));
  const [newTime, setNewTime] = useState(format(currentDueDate, "HH:mm"));

  const handleReschedule = () => {
    const [year, month, day] = newDate.split("-");
    const [hours, minutes] = newTime.split(":");
    const newDateTime = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );
    onReschedule(newDateTime);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-hidden flex flex-col dark:bg-gray-900 dark:border-gray-800">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl dark:text-white">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Reschedule Missed Task
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">Task: {taskTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto pr-4 flex-1">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4">
            <p className="text-sm font-semibold text-red-900 dark:text-red-400">
              Score Impact: {taskScoreImpact > 0 ? "-" : ""}{taskScoreImpact} points
            </p>
            <p className="text-xs text-red-800 dark:text-red-300 mt-1">
              This points deduction has been applied to your score.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-date" className="dark:text-gray-200">New Date</Label>
              <Input
                id="new-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-time" className="dark:text-gray-200">New Time</Label>
              <Input
                id="new-time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
              <p className="text-xs text-blue-900 dark:text-blue-400">
                <span className="font-semibold">New deadline:</span> {newDate} at {newTime}
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                Complete this task on time to earn points back!
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="dark:border-gray-700 dark:text-gray-300">
            Cancel
          </Button>
          <Button onClick={handleReschedule} className="flex-1 dark:bg-primary dark:text-white">
            Reschedule Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
