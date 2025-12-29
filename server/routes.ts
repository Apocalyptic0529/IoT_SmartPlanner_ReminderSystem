import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // Middleware to ensure authentication for task routes
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // === TASKS ===
  app.get(api.tasks.list.path, requireAuth, async (req, res) => {
    const filters = {
      status: req.query.status as string,
      category: req.query.category as string,
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined,
    };
    const tasks = await storage.getTasks((req.user as any).id, filters);
    res.json(tasks);
  });

  app.post(api.tasks.create.path, requireAuth, async (req, res) => {
    try {
      const body = {
        ...req.body,
        dueDateTime: req.body.dueDateTime ? new Date(req.body.dueDateTime) : undefined,
        createdAt: req.body.createdAt ? new Date(req.body.createdAt) : undefined
      };
      const input = api.tasks.create.input.parse(body);
      // Add userId from session
      const task = await storage.createTask({
        ...input,
        userId: (req.user as any).id
      });
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.tasks.get.path, requireAuth, async (req, res) => {
    const task = await storage.getTask(Number(req.params.id));
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.userId !== (req.user as any).id) return res.status(401).json({ message: "Unauthorized" });
    res.json(task);
  });

  app.patch(api.tasks.update.path, requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getTask(id);
    if (!existing) return res.status(404).json({ message: "Task not found" });
    if (existing.userId !== (req.user as any).id) return res.status(401).json({ message: "Unauthorized" });

    try {
      const body = {
        ...req.body,
        dueDateTime: req.body.dueDateTime ? new Date(req.body.dueDateTime) : undefined,
        createdAt: req.body.createdAt ? new Date(req.body.createdAt) : undefined
      };
      const input = api.tasks.update.input.parse(body) as any;
      const updated = await storage.updateTask(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.tasks.delete.path, requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getTask(id);
    if (!existing) return res.status(404).json({ message: "Task not found" });
    if (existing.userId !== (req.user as any).id) return res.status(401).json({ message: "Unauthorized" });

    await storage.deleteTask(id);
    res.sendStatus(204);
  });

  // === STATS ===
  app.get(api.stats.get.path, requireAuth, async (req, res) => {
    const stats = await storage.getStats((req.user as any).id);
    res.json(stats);
  });

  // === ACCOUNT MANAGEMENT ===
  app.post("/api/update-username", requireAuth, async (req, res) => {
    try {
      const { username } = req.body;
      if (!username || !username.trim()) {
        return res.status(400).json({ message: "Username cannot be empty" });
      }
      await storage.updateUsername((req.user as any).id, username);
      res.json({ message: "Username updated successfully" });
    } catch (err: any) {
      if (err.message.includes("unique")) {
        return res.status(400).json({ message: "Username already exists" });
      }
      res.status(500).json({ message: "Failed to update username" });
    }
  });

  app.post("/api/update-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new passwords are required" });
      }
      
      const updated = await storage.updatePassword((req.user as any).id, currentPassword, newPassword);
      if (!updated) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      res.json({ message: "Password updated successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  app.post("/api/reset-scores", requireAuth, async (req, res) => {
    try {
      await storage.resetScoreHistory((req.user as any).id);
      res.json({ message: "Score history reset successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to reset score history" });
    }
  });

  app.post("/api/reset-analytics", requireAuth, async (req, res) => {
    try {
      await storage.resetAnalyticsHistory((req.user as any).id);
      res.json({ message: "Analytics history reset successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to reset analytics history" });
    }
  });

  app.post("/api/cleanup-deleted", requireAuth, async (req, res) => {
    try {
      await storage.cleanupDeletedTasks((req.user as any).id);
      res.json({ message: "Deleted tasks cleaned up successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to cleanup deleted tasks" });
    }
  });

  // === SEED DATA ===
  if (process.env.NODE_ENV !== 'production') {
    const demoUser = await storage.getUserByUsername('Demo123');
    if (!demoUser) {
      console.log('Seeding Demo123 user...');
      const hashedPassword = await hashPassword('123456789');
      const user = await storage.createUser({
        username: 'Demo123',
        password: hashedPassword
      });
      
      // Create some tasks
      const now = new Date();
      await storage.createTask({
        userId: (user as any).id,
        title: 'Project Presentation',
        description: 'Prepare slides for the IoT Smart Planner project',
        category: 'Academic',
        priority: 'high',
        dueDateTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
        status: 'completed',
        attachments: []
      });
      
      await storage.createTask({
        userId: (user as any).id,
        title: 'Buy Groceries',
        description: 'Milk, Eggs, Bread',
        category: 'Personal',
        priority: 'medium',
        dueDateTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
        status: 'completed',
        attachments: []
      });

      await storage.createTask({
        userId: (user as any).id,
        title: 'Morning Jog',
        description: '5km run',
        category: 'Personal',
        priority: 'low',
        dueDateTime: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Yesterday
        status: 'missed',
        attachments: []
      });
      console.log('Seeding complete.');
    }
  }

  return httpServer;
}
