import { User, InsertUser, Task, InsertTask, UpdateTaskRequest, StatsResponse } from "@shared/schema";
import { FirebaseStorage } from "./firebase-storage";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getTasks(userId: number, filters?: { 
    status?: string, 
    category?: string, 
    from?: Date, 
    to?: Date 
  }): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask & { userId: number }): Promise<Task>;
  updateTask(id: number, task: UpdateTaskRequest): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  getStats(userId: number): Promise<StatsResponse>;
  resetScoreHistory(userId: number): Promise<void>;
  resetAnalyticsHistory(userId: number): Promise<void>;
  updateUsername(userId: number, newUsername: string): Promise<void>;
  updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean>;
  cleanupDeletedTasks(userId: number): Promise<void>;
  generatePairingCode(userId: number): Promise<string>;
  pairHardware(userId: number, pairingCode: string, hardwareId: string): Promise<boolean>;
  getHardwareTasks(userId: number): Promise<any[]>;
}

export const storage = new FirebaseStorage();
