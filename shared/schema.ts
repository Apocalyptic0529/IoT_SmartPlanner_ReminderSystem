import { z } from "zod";

// === TABLE DEFINITIONS ===
// Note: These definitions are now used for type generation only, 
// as the application uses Firebase Realtime Database for storage.

export type User = {
  id: number;
  username: string;
  password: string;
  pairingCode?: string;
  hardwareId?: string;
};

export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type Task = {
  id: number;
  userId: number;
  title: string;
  description?: string;
  category: string;
  priority: string;
  dueDateTime: string;
  status: string;
  attachments?: { url: string; name: string; type: "link" | "image" }[];
  isRecurring?: boolean;
  recurrenceType?: string;
  autoReschedule?: boolean;
  rescheduleInterval?: string;
  scoreImpact?: number;
  createdAt: string;
  deletedAt?: string;
  deletionReason?: string;
  originalDueDateTime?: string;
  rescheduleCount?: number;
};

export const insertTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["high", "medium", "low"]),
  dueDateTime: z.string().or(z.date()),
  status: z.enum(["pending", "completed", "missed", "deleted", "rescheduled"]).default("pending"),
  attachments: z.array(z.object({
    url: z.string().url(),
    name: z.string(),
    type: z.enum(["link", "image"])
  })).optional(),
  isRecurring: z.boolean().optional(),
  recurrenceType: z.enum(["daily", "weekly", "monthly"]).optional(),
  autoReschedule: z.boolean().optional(),
  rescheduleInterval: z.string().optional(),
  deletedAt: z.string().optional(),
  deletionReason: z.string().optional(),
  originalDueDateTime: z.string().optional(),
  rescheduleCount: z.number().optional(),
});

// === EXPLICIT API CONTRACT TYPES ===
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Request types
export type CreateTaskRequest = InsertTask;
export type UpdateTaskRequest = Partial<InsertTask> & {
  status?: "pending" | "completed" | "missed" | "deleted" | "rescheduled";
  scoreImpact?: number;
  deletedAt?: string;
  deletionReason?: string;
  originalDueDateTime?: string;
  rescheduleCount?: number;
};

// Response types
export type TaskResponse = Task;
export type ScoredTask = {
  id: number;
  title: string;
  scoreImpact: number;
  status: string;
  createdAt: Date | null;
};
export type StatsResponse = {
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
  totalCompleted: number;
  totalMissed: number;
  totalCreated: number;
  scoreBasedCompletionRate: number;
  weeklyScore: number;
  monthlyScore: number;
  yearlyScore: number;
  weeklyScoredTasks: ScoredTask[];
  monthlyScoredTasks: ScoredTask[];
  yearlyScoredTasks: ScoredTask[];
  lastWeeklyReset: string;
  lastMonthlyReset: string;
  lastYearlyReset: string;
};
