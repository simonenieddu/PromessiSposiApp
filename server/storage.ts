import {
  users,
  chapters,
  quizzes,
  quizQuestions,
  userChapterProgress,
  userQuizAttempts,
  badges,
  userBadges,
  dailyChallenges,
  userDailyChallenges,
  weeklyChallenges,
  userWeeklyChallenges,
  friendships,
  glossaryTerms,
  adminUsers,
  type User,
  type UpsertUser,
  type Chapter,
  type InsertChapter,
  type Quiz,
  type InsertQuiz,
  type QuizQuestion,
  type InsertQuizQuestion,
  type UserChapterProgress,
  type InsertUserChapterProgress,
  type UserQuizAttempt,
  type InsertUserQuizAttempt,
  type Badge,
  type InsertBadge,
  type UserBadge,
  type InsertUserBadge,
  type DailyChallenge,
  type InsertDailyChallenge,
  type UserDailyChallenge,
  type InsertUserDailyChallenge,
  type WeeklyChallenge,
  type InsertWeeklyChallenge,
  type UserWeeklyChallenge,
  type InsertUserWeeklyChallenge,
  type Friendship,
  type InsertFriendship,
  type GlossaryTerm,
  type InsertGlossaryTerm,
  type AdminUser,
  type InsertAdminUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Chapter operations
  getChapters(): Promise<Chapter[]>;
  getChapter(id: number): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  
  // User progress operations
  getUserChapterProgress(userId: string): Promise<UserChapterProgress[]>;
  getUserChapterProgressByChapter(userId: string, chapterId: number): Promise<UserChapterProgress | undefined>;
  updateChapterProgress(userId: string, chapterId: number, progress: Partial<InsertUserChapterProgress>): Promise<UserChapterProgress>;
  
  // Quiz operations
  getChapterQuizzes(chapterId: number): Promise<Quiz[]>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  getQuizQuestions(quizId: number): Promise<QuizQuestion[]>;
  createQuizAttempt(attempt: InsertUserQuizAttempt): Promise<UserQuizAttempt>;
  getUserQuizAttempts(userId: string): Promise<UserQuizAttempt[]>;
  
  // Badge operations
  getBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<UserBadge[]>;
  awardBadge(userId: string, badgeId: number): Promise<UserBadge>;
  
  // Challenge operations
  getTodaysDailyChallenge(): Promise<DailyChallenge | undefined>;
  getUserDailyChallengeProgress(userId: string, challengeId: number): Promise<UserDailyChallenge | undefined>;
  updateDailyChallengeProgress(userId: string, challengeId: number, progress: number): Promise<UserDailyChallenge>;
  getCurrentWeeklyChallenge(): Promise<WeeklyChallenge | undefined>;
  getUserWeeklyChallengeProgress(userId: string, challengeId: number): Promise<UserWeeklyChallenge | undefined>;
  updateWeeklyChallengeProgress(userId: string, challengeId: number, progress: number): Promise<UserWeeklyChallenge>;
  
  // Social operations
  getUserFriends(userId: string): Promise<User[]>;
  getLeaderboard(limit?: number): Promise<User[]>;
  getFriendsLeaderboard(userId: string, limit?: number): Promise<User[]>;
  addFriend(userId: string, friendId: string): Promise<Friendship>;
  
  // Statistics
  updateUserXp(userId: string, xpToAdd: number): Promise<User>;
  updateUserStreak(userId: string): Promise<User>;
  
  // Glossary operations
  getGlossaryTerms(category?: string): Promise<GlossaryTerm[]>;
  getGlossaryTerm(id: number): Promise<GlossaryTerm | undefined>;
  createGlossaryTerm(term: InsertGlossaryTerm): Promise<GlossaryTerm>;
  updateGlossaryTerm(id: number, term: Partial<InsertGlossaryTerm>): Promise<GlossaryTerm>;
  deleteGlossaryTerm(id: number): Promise<void>;
  
  // Admin operations
  isUserAdmin(userId: string): Promise<boolean>;
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  getAdminUsers(): Promise<AdminUser[]>;
  
  // Admin chapter operations
  updateChapter(id: number, chapter: Partial<InsertChapter>): Promise<Chapter>;
  deleteChapter(id: number): Promise<void>;
  
  // Admin quiz operations
  updateQuiz(id: number, quiz: Partial<InsertQuiz>): Promise<Quiz>;
  deleteQuiz(id: number): Promise<void>;
  updateQuizQuestion(id: number, question: Partial<InsertQuizQuestion>): Promise<QuizQuestion>;
  deleteQuizQuestion(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Chapter operations
  async getChapters(): Promise<Chapter[]> {
    return await db.select().from(chapters).orderBy(chapters.number);
  }

  async getChapter(id: number): Promise<Chapter | undefined> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
    return chapter;
  }

  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    const [newChapter] = await db.insert(chapters).values(chapter).returning();
    return newChapter;
  }

  // User progress operations
  async getUserChapterProgress(userId: string): Promise<UserChapterProgress[]> {
    return await db
      .select()
      .from(userChapterProgress)
      .where(eq(userChapterProgress.userId, userId))
      .orderBy(userChapterProgress.chapterId);
  }

  async getUserChapterProgressByChapter(userId: string, chapterId: number): Promise<UserChapterProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userChapterProgress)
      .where(and(
        eq(userChapterProgress.userId, userId),
        eq(userChapterProgress.chapterId, chapterId)
      ));
    return progress;
  }

  async updateChapterProgress(userId: string, chapterId: number, progress: Partial<InsertUserChapterProgress>): Promise<UserChapterProgress> {
    const existing = await this.getUserChapterProgressByChapter(userId, chapterId);
    
    if (existing) {
      const [updated] = await db
        .update(userChapterProgress)
        .set(progress)
        .where(and(
          eq(userChapterProgress.userId, userId),
          eq(userChapterProgress.chapterId, chapterId)
        ))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userChapterProgress)
        .values({
          userId,
          chapterId,
          ...progress,
        })
        .returning();
      return created;
    }
  }

  // Quiz operations
  async getChapterQuizzes(chapterId: number): Promise<Quiz[]> {
    return await db.select().from(quizzes).where(eq(quizzes.chapterId, chapterId));
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    return await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(quizQuestions.order);
  }

  async createQuizAttempt(attempt: InsertUserQuizAttempt): Promise<UserQuizAttempt> {
    const [newAttempt] = await db.insert(userQuizAttempts).values(attempt).returning();
    return newAttempt;
  }

  async getUserQuizAttempts(userId: string): Promise<UserQuizAttempt[]> {
    return await db
      .select()
      .from(userQuizAttempts)
      .where(eq(userQuizAttempts.userId, userId))
      .orderBy(desc(userQuizAttempts.completedAt));
  }

  // Badge operations
  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges);
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
  }

  async awardBadge(userId: string, badgeId: number): Promise<UserBadge> {
    const [badge] = await db
      .insert(userBadges)
      .values({ userId, badgeId })
      .onConflictDoNothing()
      .returning();
    return badge;
  }

  // Challenge operations
  async getTodaysDailyChallenge(): Promise<DailyChallenge | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [challenge] = await db
      .select()
      .from(dailyChallenges)
      .where(and(
        gte(dailyChallenges.date, today),
        lte(dailyChallenges.date, tomorrow),
        eq(dailyChallenges.isActive, true)
      ));
    return challenge;
  }

  async getUserDailyChallengeProgress(userId: string, challengeId: number): Promise<UserDailyChallenge | undefined> {
    const [progress] = await db
      .select()
      .from(userDailyChallenges)
      .where(and(
        eq(userDailyChallenges.userId, userId),
        eq(userDailyChallenges.challengeId, challengeId)
      ));
    return progress;
  }

  async updateDailyChallengeProgress(userId: string, challengeId: number, progress: number): Promise<UserDailyChallenge> {
    const existing = await this.getUserDailyChallengeProgress(userId, challengeId);
    
    if (existing) {
      const [updated] = await db
        .update(userDailyChallenges)
        .set({ 
          progress,
          isCompleted: progress >= 100,
          completedAt: progress >= 100 ? new Date() : null
        })
        .where(and(
          eq(userDailyChallenges.userId, userId),
          eq(userDailyChallenges.challengeId, challengeId)
        ))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userDailyChallenges)
        .values({
          userId,
          challengeId,
          progress,
          isCompleted: progress >= 100,
          completedAt: progress >= 100 ? new Date() : null
        })
        .returning();
      return created;
    }
  }

  async getCurrentWeeklyChallenge(): Promise<WeeklyChallenge | undefined> {
    const now = new Date();
    const [challenge] = await db
      .select()
      .from(weeklyChallenges)
      .where(and(
        lte(weeklyChallenges.startDate, now),
        gte(weeklyChallenges.endDate, now),
        eq(weeklyChallenges.isActive, true)
      ));
    return challenge;
  }

  async getUserWeeklyChallengeProgress(userId: string, challengeId: number): Promise<UserWeeklyChallenge | undefined> {
    const [progress] = await db
      .select()
      .from(userWeeklyChallenges)
      .where(and(
        eq(userWeeklyChallenges.userId, userId),
        eq(userWeeklyChallenges.challengeId, challengeId)
      ));
    return progress;
  }

  async updateWeeklyChallengeProgress(userId: string, challengeId: number, progress: number): Promise<UserWeeklyChallenge> {
    const existing = await this.getUserWeeklyChallengeProgress(userId, challengeId);
    
    if (existing) {
      const [updated] = await db
        .update(userWeeklyChallenges)
        .set({ 
          progress,
          isCompleted: progress >= 100,
          completedAt: progress >= 100 ? new Date() : null
        })
        .where(and(
          eq(userWeeklyChallenges.userId, userId),
          eq(userWeeklyChallenges.challengeId, challengeId)
        ))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userWeeklyChallenges)
        .values({
          userId,
          challengeId,
          progress,
          isCompleted: progress >= 100,
          completedAt: progress >= 100 ? new Date() : null
        })
        .returning();
      return created;
    }
  }

  // Social operations
  async getUserFriends(userId: string): Promise<User[]> {
    const friendsData = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        level: users.level,
        xp: users.xp,
        coins: users.coins,
        streak: users.streak,
        lastLoginDate: users.lastLoginDate,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.friendId, users.id))
      .where(and(
        eq(friendships.userId, userId),
        eq(friendships.status, "accepted")
      ));
    
    return friendsData;
  }

  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.xp))
      .limit(limit);
  }

  async getFriendsLeaderboard(userId: string, limit: number = 10): Promise<User[]> {
    const friendsData = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        level: users.level,
        xp: users.xp,
        streak: users.streak,
        coins: users.coins,
        lastLoginDate: users.lastLoginDate,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.friendId, users.id))
      .where(and(
        eq(friendships.userId, userId),
        eq(friendships.status, "accepted")
      ))
      .orderBy(desc(users.xp))
      .limit(limit);
    
    // Include the current user in the leaderboard
    const currentUser = await this.getUser(userId);
    if (currentUser) {
      friendsData.push(currentUser);
      friendsData.sort((a, b) => b.xp - a.xp);
      return friendsData.slice(0, limit);
    }
    
    return friendsData;
  }

  async addFriend(userId: string, friendId: string): Promise<Friendship> {
    const [friendship] = await db
      .insert(friendships)
      .values({ 
        userId, 
        friendId, 
        status: "accepted" // For simplicity, auto-accept friend requests
      })
      .returning();
    return friendship;
  }

  // Statistics
  async updateUserXp(userId: string, xpToAdd: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const newXp = user.xp + xpToAdd;
    const newLevel = Math.floor(newXp / 1000) + 1; // Level up every 1000 XP

    const [updatedUser] = await db
      .update(users)
      .set({ 
        xp: newXp, 
        level: newLevel,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async updateUserStreak(userId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const today = new Date();
    const lastLogin = user.lastLoginDate;
    let newStreak = user.streak;

    if (lastLogin) {
      const daysSinceLastLogin = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastLogin === 1) {
        // Consecutive day, increment streak
        newStreak += 1;
      } else if (daysSinceLastLogin > 1) {
        // Streak broken, reset to 1
        newStreak = 1;
      }
      // If daysSinceLastLogin === 0, it's the same day, don't change streak
    } else {
      // First login
      newStreak = 1;
    }

    const [updatedUser] = await db
      .update(users)
      .set({ 
        streak: newStreak,
        lastLoginDate: today,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  // Glossary operations
  async getGlossaryTerms(category?: string): Promise<GlossaryTerm[]> {
    const query = db.select().from(glossaryTerms);
    
    if (category) {
      return await query.where(eq(glossaryTerms.category, category)).orderBy(glossaryTerms.term);
    }
    
    return await query.orderBy(glossaryTerms.term);
  }

  async getGlossaryTerm(id: number): Promise<GlossaryTerm | undefined> {
    const [term] = await db.select().from(glossaryTerms).where(eq(glossaryTerms.id, id));
    return term;
  }

  async createGlossaryTerm(term: InsertGlossaryTerm): Promise<GlossaryTerm> {
    const [newTerm] = await db.insert(glossaryTerms).values(term).returning();
    return newTerm;
  }

  async updateGlossaryTerm(id: number, term: Partial<InsertGlossaryTerm>): Promise<GlossaryTerm> {
    const [updatedTerm] = await db
      .update(glossaryTerms)
      .set({ ...term, updatedAt: new Date() })
      .where(eq(glossaryTerms.id, id))
      .returning();
    return updatedTerm;
  }

  async deleteGlossaryTerm(id: number): Promise<void> {
    await db.delete(glossaryTerms).where(eq(glossaryTerms.id, id));
  }

  // Admin operations
  async isUserAdmin(userId: string): Promise<boolean> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.userId, userId));
    return !!admin;
  }

  async createAdminUser(admin: InsertAdminUser): Promise<AdminUser> {
    const [newAdmin] = await db.insert(adminUsers).values(admin).returning();
    return newAdmin;
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    return await db.select().from(adminUsers);
  }

  // Admin chapter operations
  async updateChapter(id: number, chapter: Partial<InsertChapter>): Promise<Chapter> {
    const [updatedChapter] = await db
      .update(chapters)
      .set(chapter)
      .where(eq(chapters.id, id))
      .returning();
    return updatedChapter;
  }

  async deleteChapter(id: number): Promise<void> {
    await db.delete(chapters).where(eq(chapters.id, id));
  }

  // Admin quiz operations
  async updateQuiz(id: number, quiz: Partial<InsertQuiz>): Promise<Quiz> {
    const [updatedQuiz] = await db
      .update(quizzes)
      .set(quiz)
      .where(eq(quizzes.id, id))
      .returning();
    return updatedQuiz;
  }

  async deleteQuiz(id: number): Promise<void> {
    await db.delete(quizzes).where(eq(quizzes.id, id));
  }

  async updateQuizQuestion(id: number, question: Partial<InsertQuizQuestion>): Promise<QuizQuestion> {
    const [updatedQuestion] = await db
      .update(quizQuestions)
      .set(question)
      .where(eq(quizQuestions.id, id))
      .returning();
    return updatedQuestion;
  }

  async deleteQuizQuestion(id: number): Promise<void> {
    await db.delete(quizQuestions).where(eq(quizQuestions.id, id));
  }
}

export const storage = new DatabaseStorage();
