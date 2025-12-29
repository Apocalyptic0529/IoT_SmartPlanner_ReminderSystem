import { User, InsertUser, Task, InsertTask, UpdateTaskRequest, StatsResponse } from "@shared/schema";
import { IStorage } from "./storage";

export class FirebaseStorage implements IStorage {
  private dbUrl: string;
  private secret: string;

  constructor() {
    this.dbUrl = process.env.FIREBASE_DATABASE_URL!.replace(/\/$/, "");
    this.secret = process.env.FIREBASE_SECRET!;
  }

  private calculateNextRecurrenceDate(currentDate: Date, recurrenceType: string): Date {
    const next = new Date(currentDate);
    switch (recurrenceType) {
      case "daily":
        next.setDate(next.getDate() + 1);
        break;
      case "weekly":
        next.setDate(next.getDate() + 7);
        break;
      case "monthly":
        next.setMonth(next.getMonth() + 1);
        break;
    }
    return next;
  }

  private getLastSaturday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 6 ? 0 : -1);
    return new Date(d.setDate(diff));
  }

  private getLastSaturdayOfMonth(date: Date): Date {
    const d = new Date(date);
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return this.getLastSaturday(lastDay);
  }

  private async request(path: string, method: string = "GET", body?: any) {
    const url = `${this.dbUrl}/${path}.json?auth=${this.secret}`;
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firebase REST error: ${response.status} ${errorText}`);
    }
    return response.json();
  }

  private async recordScore(userId: number, taskId: number, taskTitle: string, scoreAmount: number, type: 'completed' | 'missed') {
    try {
      const scoreHistory = await this.request("scoreHistory").catch(() => ({}));
      const historyId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const entry = {
        userId,
        taskId,
        taskTitle,
        scoreAmount,
        type,
        recordedAt: new Date().toISOString()
      };
      await this.request(`scoreHistory/${historyId}`, "PUT", entry);
    } catch (e) {
      console.error("Error recording score:", e);
    }
  }

  private async recordAnalytics(userId: number, taskId: number, taskTitle: string, priority: string, eventType: 'created' | 'completed' | 'missed') {
    try {
      const analyticsHistory = await this.request("analyticsHistory").catch(() => ({}));
      const analyticsId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const entry = {
        userId,
        taskId,
        taskTitle,
        priority,
        eventType,
        recordedAt: new Date().toISOString()
      };
      await this.request(`analyticsHistory/${analyticsId}`, "PUT", entry);
    } catch (e) {
      console.error("Error recording analytics:", e);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.request(`users/${id}`);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await this.request("users");
    if (!users) return undefined;
    return Object.values(users).find((u: any) => u.username === username) as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = Date.now();
    const user = { ...insertUser, id };
    await this.request(`users/${id}`, "PUT", user);
    return user as User;
  }

  private calculateNextRescheduleDate(currentDate: Date, interval: string): Date {
    const next = new Date(currentDate);
    switch (interval) {
      case "1day":
        next.setDate(next.getDate() + 1);
        break;
      case "2days":
        next.setDate(next.getDate() + 2);
        break;
      case "3days":
        next.setDate(next.getDate() + 3);
        break;
      case "1week":
        next.setDate(next.getDate() + 7);
        break;
      default:
        next.setDate(next.getDate() + 1);
    }
    return next;
  }

  async getTasks(userId: number, filters?: { 
    status?: string, 
    category?: string, 
    from?: Date, 
    to?: Date 
  }): Promise<Task[]> {
    const tasksObj = await this.request("tasks");
    if (!tasksObj) return [];
    
    const now = new Date();
    let tasks = Object.values(tasksObj) as Task[];
    tasks = tasks.filter(t => t.userId === userId);

    // Get analytics history to check for existing missed events
    let analyticsHistory: any[] = [];
    try {
      const historyObj = await this.request("analyticsHistory");
      if (historyObj) {
        analyticsHistory = Object.values(historyObj).filter((entry: any) => entry.userId === userId) as any[];
      }
    } catch (e) {}
    
    for (const task of tasks) {
      if (task.status === "pending" && new Date(task.dueDateTime) < now) {
        // Check if already recorded as missed to prevent double counting
        const isAlreadyMissed = analyticsHistory.some(entry => 
          entry.taskId === task.id && entry.eventType === 'missed'
        );

        if (isAlreadyMissed) {
          // Just update local task object status to keep UI consistent
          task.status = "missed";
          continue;
        }

        const scoreAmount = task.priority === "high" ? 20 : task.priority === "medium" ? 10 : 4;
        task.status = "missed";
        task.scoreImpact = scoreAmount;
        
        // Record the missed score in history (only once per task)
        try {
          await this.recordScore(userId, task.id, task.title, scoreAmount, 'missed');
          await this.recordAnalytics(userId, task.id, task.title, task.priority, 'missed');
          // Update task status to "missed" and keep it that way
          await this.updateTask(task.id, { status: "missed", scoreImpact: scoreAmount });
        } catch (e) {
          // Task already recorded as missed
        }
      }
    }
    
    if (filters?.status && filters.status !== 'all') {
      tasks = tasks.filter(t => t.status === filters.status);
    }
    if (filters?.category && filters.category !== 'all') {
      tasks = tasks.filter(t => t.category === filters.category);
    }
    if (filters?.from) {
      tasks = tasks.filter(t => new Date(t.dueDateTime) >= filters.from!);
    }
    if (filters?.to) {
      tasks = tasks.filter(t => new Date(t.dueDateTime) <= filters.to!);
    }
    
    return tasks.sort((a, b) => new Date(b.dueDateTime).getTime() - new Date(a.dueDateTime).getTime());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.request(`tasks/${id}`);
  }

  async createTask(task: InsertTask & { userId: number }): Promise<Task> {
    const id = Date.now();
    const newTask = { ...task, id, createdAt: new Date().toISOString() };
    await this.request(`tasks/${id}`, "PUT", newTask);
    // Record analytics event
    await this.recordAnalytics(task.userId, id, newTask.title, newTask.priority, 'created');
    return newTask as unknown as Task;
  }

  async updateTask(id: number, update: UpdateTaskRequest): Promise<Task> {
    const existing = await this.getTask(id);
    if (!existing) throw new Error("Task not found");

    // NEVER record analytics when rescheduling a missed task - the missed event stays permanent
    if (existing.status === "missed" && (update.status === "pending" || update.status === "rescheduled")) {
      // Just update the task, don't record any analytics
      await this.request(`tasks/${id}`, "PATCH", update);
      return this.request(`tasks/${id}`);
    }

    // Record score when status changes to completed
    if (update.status === "completed" && existing.status !== "completed") {
      const scoreImpact = existing.scoreImpact || (
        existing.priority === "high" ? 10 : 
        existing.priority === "medium" ? 5 : 2
      );
      await this.recordScore(existing.userId, id, existing.title, scoreImpact, 'completed');
      // Record analytics event
      await this.recordAnalytics(existing.userId, id, existing.title, existing.priority, 'completed');
    }
    
    // Reverse score when task is removed from completed status
    if (existing.status === "completed" && update.status !== "completed" && update.status !== undefined) {
      const scoreToReverse = existing.scoreImpact || (
        existing.priority === "high" ? 10 : 
        existing.priority === "medium" ? 5 : 2
      );
      // Record positive score with 'missed' type which will be subtracted during calculation
      await this.recordScore(existing.userId, id, existing.title, scoreToReverse, 'missed');
    }

    await this.request(`tasks/${id}`, "PATCH", update);
    return this.request(`tasks/${id}`);
  }

  async deleteTask(id: number): Promise<void> {
    const existing = await this.getTask(id);
    if (!existing) return;
    
    const deletionReason = existing.status === "missed" ? "deleted while missed" : "deleted while pending";
    const update: UpdateTaskRequest = { 
      status: "deleted", 
      deletedAt: new Date().toISOString(),
      deletionReason
    };
    
    await this.updateTask(id, update);
  }

  async cleanupDeletedTasks(userId: number): Promise<void> {
    const tasksObj = await this.request("tasks");
    if (!tasksObj) return;
    
    const entries = Object.entries(tasksObj);
    for (const [key, task] of entries) {
      if ((task as any).userId === userId && (task as any).status === "deleted") {
        await this.request(`tasks/${key}`, "DELETE");
      }
    }
  }

  async updateUsername(userId: number, newUsername: string): Promise<void> {
    const users = await this.request("users");
    if (!users) return;
    
    const key = Object.keys(users).find(k => users[k].id === userId);
    if (key) {
      await this.request(`users/${key}`, "PATCH", { username: newUsername });
    }
  }

  async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    const { scrypt, randomBytes } = await import("crypto");
    const { promisify } = await import("util");
    const scryptAsync = promisify(scrypt);
    
    const users = await this.request("users");
    if (!users) return false;
    
    const key = Object.keys(users).find(k => users[k].id === userId);
    if (!key) return false;
    
    const user = users[key];
    
    // Verify current password
    const [hash, salt] = user.password.split(".");
    const buf = (await scryptAsync(currentPassword, salt, 64)) as Buffer;
    if (buf.toString("hex") !== hash) {
      return false;
    }
    
    // Hash new password
    const newSalt = randomBytes(16).toString("hex");
    const newBuf = (await scryptAsync(newPassword, newSalt, 64)) as Buffer;
    const newHashedPassword = `${newBuf.toString("hex")}.${newSalt}`;
    
    await this.request(`users/${key}`, "PATCH", { password: newHashedPassword });
    return true;
  }

  async resetScoreHistory(userId: number): Promise<void> {
    try {
      const scoreHistory = await this.request("scoreHistory").catch(() => ({}));
      if (!scoreHistory) return;
      
      const entries = Object.entries(scoreHistory);
      for (const [key, entry] of entries) {
        if ((entry as any).userId === userId) {
          await this.request(`scoreHistory/${key}`, "DELETE");
        }
      }
    } catch (e) {
      console.error("Error resetting score history:", e);
    }
  }

  async resetAnalyticsHistory(userId: number): Promise<void> {
    try {
      const analyticsHistory = await this.request("analyticsHistory").catch(() => ({}));
      if (!analyticsHistory) return;
      
      const entries = Object.entries(analyticsHistory);
      for (const [key, entry] of entries) {
        if ((entry as any).userId === userId) {
          await this.request(`analyticsHistory/${key}`, "DELETE");
        }
      }
    } catch (e) {
      console.error("Error resetting analytics history:", e);
    }
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private getEndOfWeek(date: Date): Date {
    const d = this.getStartOfWeek(date);
    d.setDate(d.getDate() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  async getStats(userId: number): Promise<StatsResponse> {
    const allTasks = await this.getTasks(userId);
    const now = new Date();
    const currentYear = now.getFullYear();

    // Get analytics history - source of truth for metrics
    let analyticsHistory: any[] = [];
    try {
      const historyObj = await this.request("analyticsHistory");
      if (historyObj) {
        analyticsHistory = Object.values(historyObj).filter((entry: any) => entry.userId === userId) as any[];
      }
    } catch (e) {
      // No analytics history yet
    }

    // Get score history
    let scoreHistory: any[] = [];
    try {
      const historyObj = await this.request("scoreHistory");
      if (historyObj) {
        scoreHistory = Object.values(historyObj).filter((entry: any) => entry.userId === userId) as any[];
      }
    } catch (e) {
      // No score history yet
    }

    // Weekly: Sunday to Saturday
    const weekStart = this.getStartOfWeek(now);
    const weekEnd = this.getEndOfWeek(now);

    // Monthly: Jan 1 to last day of month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Yearly: Jan 1 to Dec 31
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    // Filter score history by period
    const weeklyHistory = scoreHistory.filter(entry => {
      const date = new Date(entry.recordedAt);
      return date >= weekStart && date <= weekEnd;
    });
    const monthlyHistory = scoreHistory.filter(entry => {
      const date = new Date(entry.recordedAt);
      return date >= monthStart && date <= monthEnd;
    });
    const yearlyHistory = scoreHistory.filter(entry => {
      const date = new Date(entry.recordedAt);
      return date >= yearStart && date <= yearEnd;
    });

    const completed = allTasks.filter(t => t.status === "completed").length;
    const pending = allTasks.filter(t => t.status === "pending").length;

    // Count all tasks that were EVER marked as missed from analytics history (permanently recorded)
    const missedAnalytics = analyticsHistory.filter(entry => entry.eventType === 'missed');
    const totalMissedFromHistory = missedAnalytics.length;

    const scoredTotal = completed + totalMissedFromHistory;
    const completionRate = scoredTotal > 0 ? Math.min(100, Math.round((completed / scoredTotal) * 100)) : 0;
    const scoreBasedCompletionRate = completionRate;

    // Calculate all-time metrics
    const totalCompleted = analyticsHistory.filter(entry => entry.eventType === 'completed').length;
    const totalMissed = totalMissedFromHistory;
    const totalCreated = analyticsHistory.filter(entry => entry.eventType === 'created').length;

    // Calculate scores from history
    const calculateScore = (entries: any[]) => {
      return entries.reduce((sum, entry) => {
        if (entry.type === 'completed') return sum + entry.scoreAmount;
        if (entry.type === 'missed') return sum - entry.scoreAmount;
        return sum;
      }, 0);
    };

    const weeklyScore = calculateScore(weeklyHistory);
    const monthlyScore = calculateScore(monthlyHistory);
    const yearlyScore = calculateScore(yearlyHistory);

    // Aggregate tasks by ID to show net score impact
    const aggregateScoredTasks = (entries: any[]) => {
      const taskMap = new Map<number, any>();
      for (const entry of entries) {
        const taskId = entry.taskId;
        const existing = taskMap.get(taskId);
        if (existing) {
          if (entry.type === 'completed') {
            existing.scoreImpact += entry.scoreAmount;
          } else if (entry.type === 'missed') {
            existing.scoreImpact -= entry.scoreAmount;
          }
          if (new Date(entry.recordedAt) > new Date(existing.createdAt)) {
            existing.createdAt = new Date(entry.recordedAt);
          }
        } else {
          taskMap.set(taskId, {
            id: taskId,
            title: entry.taskTitle,
            scoreImpact: entry.type === 'completed' ? entry.scoreAmount : -entry.scoreAmount,
            status: entry.type,
            createdAt: new Date(entry.recordedAt),
          });
        }
      }
      return Array.from(taskMap.values());
    };

    return {
      completed,
      pending,
      overdue: totalMissedFromHistory,
      completionRate,
      totalCompleted,
      totalMissed,
      totalCreated,
      scoreBasedCompletionRate,
      weeklyScore,
      monthlyScore,
      yearlyScore,
      weeklyScoredTasks: aggregateScoredTasks(weeklyHistory),
      monthlyScoredTasks: aggregateScoredTasks(monthlyHistory),
      yearlyScoredTasks: aggregateScoredTasks(yearlyHistory),
      lastWeeklyReset: weekStart.toISOString(),
      lastMonthlyReset: monthStart.toISOString(),
      lastYearlyReset: yearStart.toISOString(),
    };
  }
}
