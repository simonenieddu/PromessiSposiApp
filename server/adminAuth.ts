import bcrypt from "bcryptjs";
import { adminUsers, chapters, quizzes, dailyChallenges, weeklyChallenges } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import type { Express, RequestHandler } from "express";
import session from "express-session";

export interface AdminSession {
  adminId: number;
  username: string;
  isAdmin: boolean;
}

declare module "express-session" {
  interface SessionData {
    admin?: AdminSession;
  }
}

export const isAdminAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session.admin?.isAdmin) {
    return res.status(401).json({ message: "Admin authentication required" });
  }
  next();
};

export async function createAdminUser(username: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const [admin] = await db
    .insert(adminUsers)
    .values({
      username,
      password: hashedPassword,
    })
    .returning();
    
  return admin;
}

export async function verifyAdminCredentials(username: string, password: string) {
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username));
    
  if (!admin) {
    return null;
  }
  
  const isValidPassword = await bcrypt.compare(password, admin.password);
  if (!isValidPassword) {
    return null;
  }
  
  return {
    id: admin.id,
    username: admin.username,
  };
}

export async function setupAdminRoutes(app: Express) {
  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      const admin = await verifyAdminCredentials(username, password);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.session.admin = {
        adminId: admin.id,
        username: admin.username,
        isAdmin: true,
      };
      
      res.json({ message: "Login successful", admin: { username: admin.username } });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Admin logout
  app.post("/api/admin/logout", (req, res) => {
    req.session.admin = undefined;
    res.json({ message: "Logout successful" });
  });
  
  // Check admin authentication
  app.get("/api/admin/auth", (req, res) => {
    res.json({ isAuthenticated: !!req.session.admin?.isAdmin });
  });
  
  // Create admin chapters
  app.post("/api/admin/chapters", isAdminAuthenticated, async (req, res) => {
    try {
      const { number, title, content, summary, readingTime, imageUrl, isLocked } = req.body;
      
      const [chapter] = await db
        .insert(chapters)
        .values({
          number,
          title,
          content,
          summary,
          readingTime,
          imageUrl,
          isLocked,
        })
        .returning();
        
      res.json(chapter);
    } catch (error) {
      console.error("Error creating chapter:", error);
      res.status(500).json({ message: "Failed to create chapter" });
    }
  });
  
  // Update admin chapters
  app.patch("/api/admin/chapters/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { number, title, content, summary, readingTime, imageUrl, isLocked } = req.body;
      
      const [chapter] = await db
        .update(chapters)
        .set({
          number,
          title,
          content,
          summary,
          readingTime,
          imageUrl,
          isLocked,
        })
        .where(eq(chapters.id, parseInt(id)))
        .returning();
        
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      
      res.json(chapter);
    } catch (error) {
      console.error("Error updating chapter:", error);
      res.status(500).json({ message: "Failed to update chapter" });
    }
  });
  
  // Delete admin chapters
  app.delete("/api/admin/chapters/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      await db
        .delete(chapters)
        .where(eq(chapters.id, parseInt(id)));
        
      res.json({ message: "Chapter deleted successfully" });
    } catch (error) {
      console.error("Error deleting chapter:", error);
      res.status(500).json({ message: "Failed to delete chapter" });
    }
  });
  
  // Get admin quizzes
  app.get("/api/admin/quizzes", isAdminAuthenticated, async (req, res) => {
    try {
      const quizzes = await db.select().from(quizzes);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });
  
  // Get admin challenges
  app.get("/api/admin/challenges", isAdminAuthenticated, async (req, res) => {
    try {
      const daily = await db.select().from(dailyChallenges);
      const weekly = await db.select().from(weeklyChallenges);
      res.json({ daily, weekly });
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });
}