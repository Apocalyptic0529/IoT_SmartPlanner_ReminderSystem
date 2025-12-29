import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, type InsertTask, type Task } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Link as LinkIcon, Image as ImageIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Extend schema for client-side date handling
const formSchema = insertTaskSchema.extend({
  dueDateTime: z.coerce.date(),
  scoreImpact: z.coerce.number().optional(),
});

interface TaskFormProps {
  defaultValues?: Partial<Task>;
  onSubmit: (data: InsertTask) => Promise<unknown>;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function TaskForm({ defaultValues, onSubmit, isSubmitting, onCancel }: TaskFormProps) {
  const [date, setDate] = useState<Date | undefined>(
    defaultValues?.dueDateTime ? new Date(defaultValues.dueDateTime) : undefined
  );
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentType, setAttachmentType] = useState<"link" | "image">("link");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      category: defaultValues?.category || "Personal",
      priority: defaultValues?.priority || "medium",
      dueDateTime: defaultValues?.dueDateTime ? new Date(defaultValues.dueDateTime) : undefined,
      status: defaultValues?.status || "pending",
      attachments: defaultValues?.attachments || [],
      isRecurring: defaultValues?.isRecurring || false,
      recurrenceType: defaultValues?.recurrenceType || "daily",
      autoReschedule: defaultValues?.autoReschedule || false,
      rescheduleInterval: defaultValues?.rescheduleInterval || "1day",
    },
  });

  const isRecurring = form.watch("isRecurring");
  const attachments = form.watch("attachments") || [];

  const addAttachment = () => {
    if (!attachmentUrl) return;
    const newAttachments = [...attachments, { url: attachmentUrl, name: attachmentUrl.split('/').pop() || "Attachment", type: attachmentType }];
    form.setValue("attachments", newAttachments);
    setAttachmentUrl("");
  };

  const removeAttachment = (index: number) => {
    const newAttachments = (attachments as any[]).filter((_, i) => i !== index);
    form.setValue("attachments", newAttachments);
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (!data.dueDateTime && date) {
      data.dueDateTime = date;
    }
    
    // Set score impact based on priority
    if (data.priority === "high") data.scoreImpact = 10;
    else if (data.priority === "medium") data.scoreImpact = 5;
    else data.scoreImpact = 2;

    return onSubmit(data as InsertTask);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="max-h-[60vh] overflow-y-auto px-1 space-y-6 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-white">Task Title</FormLabel>
                <FormControl>
                  <Input placeholder="Finish quarterly report..." className="text-lg font-medium dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:placeholder:text-gray-500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-white">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="dark:bg-gray-900 dark:text-white dark:border-gray-700">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover dark:bg-gray-900 dark:border-gray-700">
                      <SelectItem value="Personal" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Personal</SelectItem>
                      <SelectItem value="Work" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Work</SelectItem>
                      <SelectItem value="Academic" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Academic</SelectItem>
                      <SelectItem value="Health" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Health</SelectItem>
                      <SelectItem value="Finance" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-white">Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="dark:bg-gray-900 dark:text-white dark:border-gray-700">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover dark:bg-gray-900 dark:border-gray-700">
                      <SelectItem value="high" className="text-red-500 font-medium dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">High Priority</SelectItem>
                      <SelectItem value="medium" className="text-amber-500 font-medium dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Medium Priority</SelectItem>
                      <SelectItem value="low" className="text-emerald-500 font-medium dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="dueDateTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="dark:text-white">Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal dark:bg-gray-900 dark:text-white dark:border-gray-700",
                            !field.value && "text-muted-foreground dark:text-gray-500"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 dark:bg-gray-900 dark:border-gray-700" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (!date) return;
                          const current = field.value || new Date();
                          date.setHours(current.getHours());
                          date.setMinutes(current.getMinutes());
                          field.onChange(date);
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem className="flex flex-col">
              <FormLabel className="dark:text-white">Due Time</FormLabel>
              <FormControl>
                <Input
                  type="time"
                  className="w-full dark:bg-gray-900 dark:text-white dark:border-gray-700"
                  value={form.watch("dueDateTime") ? format(form.watch("dueDateTime"), "HH:mm") : ""}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(":").map(Number);
                    const current = form.getValues("dueDateTime") || new Date();
                    const updated = new Date(current);
                    updated.setHours(hours);
                    updated.setMinutes(minutes);
                    form.setValue("dueDateTime", updated);
                  }}
                />
              </FormControl>
            </FormItem>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="dark:text-white">Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add details, subtasks, or links..." 
                    className="resize-none min-h-[100px] dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:placeholder:text-gray-500" 
                    {...field} 
                    value={field.value || ""} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormLabel className="dark:text-white">Attachments (URL or Image URL)</FormLabel>
            <div className="flex gap-2">
              <Select value={attachmentType} onValueChange={(val: any) => setAttachmentType(val)}>
                <SelectTrigger className="w-[120px] dark:bg-gray-900 dark:text-white dark:border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                  <SelectItem value="link" className="dark:text-white">Link</SelectItem>
                  <SelectItem value="image" className="dark:text-white">Image</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                placeholder="https://..." 
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                className="dark:bg-gray-900 dark:text-white dark:border-gray-700 dark:placeholder:text-gray-500"
              />
              <Button type="button" onClick={addAttachment} className="dark:bg-primary dark:text-white">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(attachments as any[]).map((att: any, i: number) => (
                <div key={i} className="flex items-center gap-2 bg-muted dark:bg-gray-800 px-3 py-1 rounded-full text-xs">
                  {att.type === 'link' ? <LinkIcon className="h-3 w-3 dark:text-primary" /> : <ImageIcon className="h-3 w-3 dark:text-primary" />}
                  <span className="max-w-[150px] truncate dark:text-gray-100">{att.url}</span>
                  <button type="button" onClick={() => removeAttachment(i)} className="text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t dark:border-gray-800 pt-4">
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormLabel className="dark:text-white">Recurring Task</FormLabel>
                  <FormControl>
                    <Switch checked={field.value ?? false} onCheckedChange={(val) => {
                      field.onChange(val);
                      if (val) form.setValue("autoReschedule", false);
                    }} />
                  </FormControl>
                </FormItem>
              )}
            />

            {isRecurring && (
              <FormField
                control={form.control}
                name="recurrenceType"
                render={({ field }) => (
                  <FormItem className="w-32">
                    <Select onValueChange={field.onChange} defaultValue={field.value || "daily"}>
                      <FormControl>
                        <SelectTrigger className="dark:bg-gray-900 dark:text-white dark:border-gray-700">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-popover dark:bg-gray-900 dark:border-gray-700">
                        <SelectItem value="daily" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Daily</SelectItem>
                        <SelectItem value="weekly" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Weekly</SelectItem>
                        <SelectItem value="monthly" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}
          </div>

          {!isRecurring && (
            <div className="flex flex-col gap-4 border-t dark:border-gray-800 pt-4">
              <FormField
                control={form.control}
                name="autoReschedule"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormLabel className="dark:text-white">Auto-reschedule when missed</FormLabel>
                    <FormControl>
                      <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("autoReschedule") && (
                <FormField
                  control={form.control}
                  name="rescheduleInterval"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="dark:text-white">Reschedule Interval</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "1day"}>
                        <FormControl>
                          <SelectTrigger className="dark:bg-gray-900 dark:text-white dark:border-gray-700">
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover dark:bg-gray-900 dark:border-gray-700">
                          <SelectItem value="1day" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Same time next day</SelectItem>
                          <SelectItem value="2days" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Same time in 2 days</SelectItem>
                          <SelectItem value="3days" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Same time in 3 days</SelectItem>
                          <SelectItem value="1week" className="dark:text-white dark:focus:bg-gray-800 focus:bg-accent cursor-pointer">Same time in 1 week</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="dark:border-gray-700 dark:text-gray-300 dark:hover:text-white">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[100px] dark:bg-primary dark:text-white">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : defaultValues?.id ? (
              "Update Task"
            ) : (
              "Create Task"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
