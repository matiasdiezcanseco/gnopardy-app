"use server";

import { db } from "~/server/db";
import { games, questions, gameQuestions } from "~/server/db/schema";
import { eq } from "drizzle-orm";

/**
 * Migration script to populate game_questions table for existing games.
 * This should be run once after the schema update to ensure all existing games
 * have their questions properly initialized in the game_questions table.
 */
export async function migrateExistingGames() {
  try {
    console.log("Starting migration: populating game_questions table...");

    // Get all games
    const allGames = await db.select().from(games);
    console.log(`Found ${allGames.length} games`);

    if (allGames.length === 0) {
      console.log("No games to migrate");
      return { success: true, message: "No games to migrate" };
    }

    // Get all questions
    const allQuestions = await db.select({ id: questions.id }).from(questions);
    console.log(`Found ${allQuestions.length} questions`);

    if (allQuestions.length === 0) {
      console.log("No questions to migrate");
      return { success: true, message: "No questions to migrate" };
    }

    // For each game, insert all questions with isAnswered = false (default state)
    let totalInserted = 0;
    for (const game of allGames) {
      // Check if this game already has entries in game_questions
      const existingEntries = await db
        .select()
        .from(gameQuestions)
        .where(eq(gameQuestions.gameId, game.id));

      if (existingEntries.length > 0) {
        console.log(`Game ${game.id} already has ${existingEntries.length} entries, skipping...`);
        continue;
      }

      // Insert all questions for this game
      const entries = allQuestions.map((q) => ({
        gameId: game.id,
        questionId: q.id,
        isAnswered: false,
      }));

      await db.insert(gameQuestions).values(entries);
      totalInserted += entries.length;
      console.log(`Inserted ${entries.length} questions for game ${game.id}`);
    }

    console.log(`Migration complete: inserted ${totalInserted} game-question entries`);
    return {
      success: true,
      message: `Migration complete: inserted ${totalInserted} game-question entries for ${allGames.length} games`,
    };
  } catch (error) {
    console.error("Error during migration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during migration",
    };
  }
}

