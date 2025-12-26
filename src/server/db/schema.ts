import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * Multi-project schema support: prefix all tables with `jeopardy-app_`
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `jeopardy-app_${name}`);

// ============================================================================
// Games Table
// ============================================================================
export const games = createTable(
  "game",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }),
    status: d.varchar({ length: 50 }).default("active").notNull(), // active, completed
    createdAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .notNull(),
    completedAt: d.timestamp({ withTimezone: true }),
  }),
  (t) => [index("game_status_idx").on(t.status)],
);

// ============================================================================
// Categories Table
// ============================================================================
export const categories = createTable(
  "category",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }).notNull(),
    description: d.text(),
    color: d.varchar({ length: 7 }), // Hex color code (e.g., #FF5733)
    createdAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("category_name_idx").on(t.name)],
);

// ============================================================================
// Questions Table
// ============================================================================
export const questions = createTable(
  "question",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    categoryId: d
      .integer()
      .references(() => categories.id, { onDelete: "cascade" })
      .notNull(),
    text: d.text().notNull(),
    points: d.integer().notNull(), // 100, 200, 300, 400, 500
    type: d.varchar({ length: 50 }).notNull().default("text"), // text, multiple_choice, audio, video, image
    mediaUrl: d.text(), // URL to audio/video/image
    isAnswered: d.boolean().default(false).notNull(),
    createdAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("question_category_idx").on(t.categoryId),
    index("question_points_idx").on(t.points),
  ],
);

// ============================================================================
// Answers Table
// ============================================================================
export const answers = createTable(
  "answer",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    questionId: d
      .integer()
      .references(() => questions.id, { onDelete: "cascade" })
      .notNull(),
    text: d.text().notNull(),
    isCorrect: d.boolean().notNull().default(false),
    order: d.integer(), // For ordering multiple choice options
  }),
  (t) => [index("answer_question_idx").on(t.questionId)],
);

// ============================================================================
// Players Table
// ============================================================================
export const players = createTable(
  "player",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    name: d.varchar({ length: 256 }).notNull(),
    score: d.integer().default(0).notNull(),
    gameId: d
      .integer()
      .references(() => games.id, { onDelete: "cascade" }),
    createdAt: d
      .timestamp({ withTimezone: true })
      .defaultNow()
      .notNull(),
  }),
  (t) => [
    index("player_game_idx").on(t.gameId),
    index("player_score_idx").on(t.score),
  ],
);

// ============================================================================
// Type Exports (for use throughout the application)
// ============================================================================
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export type Answer = typeof answers.$inferSelect;
export type NewAnswer = typeof answers.$inferInsert;

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;
