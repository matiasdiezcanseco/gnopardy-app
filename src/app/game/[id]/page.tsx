import { notFound } from "next/navigation";
import { GamePageClient } from "./client";
import { getGameById, getGameQuestions } from "~/server/actions/game";
import { getCategories } from "~/server/actions/category";

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params;
  const gameId = parseInt(id, 10);

  if (isNaN(gameId)) {
    notFound();
  }

  // Fetch game data
  const [gameResult, categoriesResult, questionsResult] = await Promise.all([
    getGameById(gameId),
    getCategories(),
    getGameQuestions(gameId), // Use game-specific questions with per-game answered status
  ]);

  if (!gameResult.success) {
    notFound();
  }

  if (!categoriesResult.success || !questionsResult.success) {
    throw new Error("Failed to load game data");
  }

  const game = gameResult.data;
  const categories = categoriesResult.data;
  const questions = questionsResult.data;

  return (
    <GamePageClient
      game={game}
      categories={categories}
      questions={questions}
    />
  );
}

