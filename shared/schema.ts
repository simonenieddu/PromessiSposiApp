import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  unique
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  coins: integer("coins").default(0),
  streak: integer("streak").default(0),
  lastLoginDate: timestamp("last_login_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admin users table
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // bcrypt hashed
  createdAt: timestamp("created_at").defaultNow(),
});

// Chapters table
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  readingTime: integer("reading_time").default(10), // in minutes
  imageUrl: varchar("image_url"),
  isLocked: boolean("is_locked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User chapter progress
export const userChapterProgress = pgTable("user_chapter_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  chapterId: integer("chapter_id").notNull().references(() => chapters.id),
  isCompleted: boolean("is_completed").default(false),
  progressPercentage: integer("progress_percentage").default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quizzes table
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").notNull().references(() => chapters.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  xpReward: integer("xp_reward").default(50),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz questions
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id),
  question: text("question").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'multiple_choice', 'true_false', 'drag_drop'
  options: jsonb("options"), // array of options for multiple choice
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  points: integer("points").default(10),
  order: integer("order").notNull(),
});

// User quiz attempts
export const userQuizAttempts = pgTable("user_quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  quizId: integer("quiz_id").notNull().references(() => quizzes.id),
  score: integer("score").default(0),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").default(0),
  xpEarned: integer("xp_earned").default(0),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Badges
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'achievement', 'streak', 'chapter', 'quiz'
  requirement: jsonb("requirement"), // conditions to earn badge
  xpReward: integer("xp_reward").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User badges
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.badgeId)
]);

// Daily challenges
export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'quiz', 'reading', 'streak'
  requirement: jsonb("requirement"), // what needs to be done
  xpReward: integer("xp_reward").default(100),
  coinReward: integer("coin_reward").default(0),
  date: timestamp("date").notNull(),
  isActive: boolean("is_active").default(true),
});

// User daily challenge progress
export const userDailyChallenges = pgTable("user_daily_challenges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeId: integer("challenge_id").notNull().references(() => dailyChallenges.id),
  progress: integer("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Weekly challenges
export const weeklyChallenges = pgTable("weekly_challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  requirement: jsonb("requirement"),
  xpReward: integer("xp_reward").default(500),
  coinReward: integer("coin_reward").default(100),
  badgeReward: integer("badge_reward"), // badge_id if applicable
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
});

// User weekly challenge progress
export const userWeeklyChallenges = pgTable("user_weekly_challenges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeId: integer("challenge_id").notNull().references(() => weeklyChallenges.id),
  progress: integer("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Friends
export const friendships = pgTable("friendships", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  friendId: varchar("friend_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'accepted', 'blocked'
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.friendId)
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  chapterProgress: many(userChapterProgress),
  quizAttempts: many(userQuizAttempts),
  badges: many(userBadges),
  dailyChallenges: many(userDailyChallenges),
  weeklyChallenges: many(userWeeklyChallenges),
  friendships: many(friendships, { relationName: "user" }),
  friends: many(friendships, { relationName: "friend" }),
}));

export const chaptersRelations = relations(chapters, ({ many }) => ({
  progress: many(userChapterProgress),
  quizzes: many(quizzes),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  chapter: one(chapters, {
    fields: [quizzes.chapterId],
    references: [chapters.id],
  }),
  questions: many(quizQuestions),
  attempts: many(userQuizAttempts),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user: one(users, {
    fields: [friendships.userId],
    references: [users.id],
    relationName: "user",
  }),
  friend: one(users, {
    fields: [friendships.friendId],
    references: [users.id],
    relationName: "friend",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
});

export const insertUserChapterProgressSchema = createInsertSchema(userChapterProgress).omit({
  id: true,
  createdAt: true,
});

export const insertUserQuizAttemptSchema = createInsertSchema(userQuizAttempts).omit({
  id: true,
  completedAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({
  id: true,
});

export const insertUserDailyChallengeSchema = createInsertSchema(userDailyChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertWeeklyChallengeSchema = createInsertSchema(weeklyChallenges).omit({
  id: true,
});

export const insertUserWeeklyChallengeSchema = createInsertSchema(userWeeklyChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Glossary table for difficult words and their definitions
export const glossaryTerms = pgTable("glossary_terms", {
  id: serial("id").primaryKey(),
  term: varchar("term", { length: 255 }).notNull(),
  definition: text("definition").notNull(),
  category: varchar("category", { length: 100 }), // e.g., "personaggi", "luoghi", "oggetti"
  example: text("example"), // Example usage from the text
  chapterRef: integer("chapter_ref"), // Which chapter it appears in
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type GlossaryTerm = typeof glossaryTerms.$inferSelect;
export type InsertGlossaryTerm = typeof glossaryTerms.$inferInsert;


export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type UserChapterProgress = typeof userChapterProgress.$inferSelect;
export type InsertUserChapterProgress = z.infer<typeof insertUserChapterProgressSchema>;
export type UserQuizAttempt = typeof userQuizAttempts.$inferSelect;
export type InsertUserQuizAttempt = z.infer<typeof insertUserQuizAttemptSchema>;
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type UserDailyChallenge = typeof userDailyChallenges.$inferSelect;
export type InsertUserDailyChallenge = z.infer<typeof insertUserDailyChallengeSchema>;
export type WeeklyChallenge = typeof weeklyChallenges.$inferSelect;
export type InsertWeeklyChallenge = z.infer<typeof insertWeeklyChallengeSchema>;
export type UserWeeklyChallenge = typeof userWeeklyChallenges.$inferSelect;
export type InsertUserWeeklyChallenge = z.infer<typeof insertUserWeeklyChallengeSchema>;
export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
