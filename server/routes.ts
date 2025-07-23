import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupAdminRoutes } from "./adminAuth";
import { seedDatabase } from "./seed-data";
import { 
  insertChapterSchema,
  insertUserQuizAttemptSchema,
  insertUserChapterProgressSchema,
} from "@shared/schema";
import { createInsertSchema } from "drizzle-zod";
import { glossaryTerms, chapters, quizzes, quizQuestions } from "@shared/schema";

const insertGlossaryTermSchema = createInsertSchema(glossaryTerms);
const updateChapterSchema = createInsertSchema(chapters).partial();
const insertQuizSchema = createInsertSchema(quizzes);
const insertQuizQuestionSchema = createInsertSchema(quizQuestions);

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Admin routes
  await setupAdminRoutes(app);
  
  // Seed database in development
  if (process.env.NODE_ENV === 'development') {
    await seedDatabase();
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      if (!user) {
        // Create user if doesn't exist
        user = await storage.upsertUser({
          id: userId,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: req.user.claims.profile_image_url,
        });
      }
      
      // Update streak on login
      user = await storage.updateUserStreak(userId);
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Chapter routes
  app.get('/api/chapters', isAuthenticated, async (req: any, res) => {
    try {
      const chapters = await storage.getChapters();
      res.json(chapters);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      res.status(500).json({ message: "Failed to fetch chapters" });
    }
  });

  app.get('/api/chapters/:id', isAuthenticated, async (req: any, res) => {
    try {
      const chapterId = parseInt(req.params.id);
      const chapter = await storage.getChapter(chapterId);
      
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      
      res.json(chapter);
    } catch (error) {
      console.error("Error fetching chapter:", error);
      res.status(500).json({ message: "Failed to fetch chapter" });
    }
  });

  // User progress routes
  app.get('/api/user/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserChapterProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.post('/api/chapters/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chapterId = parseInt(req.params.id);
      const progressData = insertUserChapterProgressSchema.parse(req.body);
      
      const progress = await storage.updateChapterProgress(userId, chapterId, progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error updating chapter progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Quiz routes
  app.get('/api/chapters/:id/quizzes', isAuthenticated, async (req: any, res) => {
    try {
      const chapterId = parseInt(req.params.id);
      const quizzes = await storage.getChapterQuizzes(chapterId);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.get('/api/quizzes/:id/questions', isAuthenticated, async (req: any, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const questions = await storage.getQuizQuestions(quizId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
  });

  app.post('/api/quizzes/:id/attempt', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const quizId = parseInt(req.params.id);
      const attemptData = insertUserQuizAttemptSchema.parse({
        ...req.body,
        userId,
        quizId
      });
      
      const attempt = await storage.createQuizAttempt(attemptData);
      
      // Award XP for quiz completion
      if (attemptData.xpEarned && attemptData.xpEarned > 0) {
        await storage.updateUserXp(userId, attemptData.xpEarned);
      }
      
      res.json(attempt);
    } catch (error) {
      console.error("Error creating quiz attempt:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  // Badge routes
  app.get('/api/user/badges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const badges = await storage.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // Challenge routes
  app.get('/api/challenges/daily', isAuthenticated, async (req: any, res) => {
    try {
      const challenge = await storage.getTodaysDailyChallenge();
      res.json(challenge);
    } catch (error) {
      console.error("Error fetching daily challenge:", error);
      res.status(500).json({ message: "Failed to fetch daily challenge" });
    }
  });

  app.get('/api/challenges/weekly', isAuthenticated, async (req: any, res) => {
    try {
      const challenge = await storage.getCurrentWeeklyChallenge();
      res.json(challenge);
    } catch (error) {
      console.error("Error fetching weekly challenge:", error);
      res.status(500).json({ message: "Failed to fetch weekly challenge" });
    }
  });

  app.get('/api/user/challenges/daily/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const challengeId = parseInt(req.params.id);
      const progress = await storage.getUserDailyChallengeProgress(userId, challengeId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching daily challenge progress:", error);
      res.status(500).json({ message: "Failed to fetch challenge progress" });
    }
  });

  app.post('/api/challenges/daily/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const challengeId = parseInt(req.params.id);
      const { progress } = req.body;
      
      const updatedProgress = await storage.updateDailyChallengeProgress(userId, challengeId, progress);
      res.json(updatedProgress);
    } catch (error) {
      console.error("Error updating daily challenge progress:", error);
      res.status(500).json({ message: "Failed to update challenge progress" });
    }
  });

  // Social routes
  app.get('/api/user/friends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friends = await storage.getUserFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.get('/api/leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get('/api/leaderboard/friends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await storage.getFriendsLeaderboard(userId, limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching friends leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch friends leaderboard" });
    }
  });

  // Glossary routes
  app.get('/api/glossary', async (req, res) => {
    try {
      const category = req.query.category as string;
      const terms = await storage.getGlossaryTerms(category);
      res.json(terms);
    } catch (error) {
      console.error("Error fetching glossary terms:", error);
      res.status(500).json({ message: "Failed to fetch glossary terms" });
    }
  });

  app.get('/api/glossary/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const term = await storage.getGlossaryTerm(id);
      if (!term) {
        return res.status(404).json({ message: "Term not found" });
      }
      res.json(term);
    } catch (error) {
      console.error("Error fetching glossary term:", error);
      res.status(500).json({ message: "Failed to fetch glossary term" });
    }
  });

  // Admin routes
  app.get('/api/admin/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const isAdmin = await storage.isUserAdmin(userId);
      res.json(isAdmin);
    } catch (error) {
      console.error("Error checking admin status:", error);
      res.status(500).json({ message: "Failed to check admin status" });
    }
  });

  // Admin middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const adminStatus = await storage.isUserAdmin(userId);
      if (!adminStatus) {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Error verifying admin status" });
    }
  };

  // Admin glossary routes
  app.post('/api/admin/glossary', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const termData = insertGlossaryTermSchema.parse(req.body);
      const term = await storage.createGlossaryTerm(termData);
      res.json(term);
    } catch (error) {
      console.error("Error creating glossary term:", error);
      res.status(500).json({ message: "Failed to create glossary term" });
    }
  });

  app.patch('/api/admin/glossary/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const termData = insertGlossaryTermSchema.partial().parse(req.body);
      const term = await storage.updateGlossaryTerm(id, termData);
      res.json(term);
    } catch (error) {
      console.error("Error updating glossary term:", error);
      res.status(500).json({ message: "Failed to update glossary term" });
    }
  });

  app.delete('/api/admin/glossary/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGlossaryTerm(id);
      res.json({ message: "Term deleted successfully" });
    } catch (error) {
      console.error("Error deleting glossary term:", error);
      res.status(500).json({ message: "Failed to delete glossary term" });
    }
  });

  // Admin chapter routes
  app.post('/api/admin/chapters', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const chapterData = insertChapterSchema.parse(req.body);
      const chapter = await storage.createChapter(chapterData);
      res.json(chapter);
    } catch (error) {
      console.error("Error creating chapter:", error);
      res.status(500).json({ message: "Failed to create chapter" });
    }
  });

  app.patch('/api/admin/chapters/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const chapterData = updateChapterSchema.parse(req.body);
      const chapter = await storage.updateChapter(id, chapterData);
      res.json(chapter);
    } catch (error) {
      console.error("Error updating chapter:", error);
      res.status(500).json({ message: "Failed to update chapter" });
    }
  });

  app.delete('/api/admin/chapters/:id', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteChapter(id);
      res.json({ message: "Chapter deleted successfully" });
    } catch (error) {
      console.error("Error deleting chapter:", error);
      res.status(500).json({ message: "Failed to delete chapter" });
    }
  });

  // Admin quiz routes (basic implementation)
  app.get('/api/admin/quizzes', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // For now, return empty array - could be expanded later
      res.json([]);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
