import { notFound, redirect } from "next/navigation";
import { FinalJeopardyClient } from "./client";
import { getGameById } from "~/server/actions/game";
import {
  getFinalJeopardyQuestion,
  getFinalJeopardyWagers,
} from "~/server/actions/finalJeopardy";

interface FinalJeopardyPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gameId?: string }>;
}

export default async function FinalJeopardyPage({
  params,
  searchParams,
}: FinalJeopardyPageProps) {
  const { id } = await params;
  const { gameId } = await searchParams;
  const questionId = parseInt(id, 10);

  if (isNaN(questionId)) {
    notFound();
  }

  if (!gameId) {
    redirect("/");
  }

  const gameIdNum = parseInt(gameId, 10);

  if (isNaN(gameIdNum)) {
    redirect("/");
  }

  // Fetch game data
  const [gameResult, questionResult] = await Promise.all([
    getGameById(gameIdNum),
    getFinalJeopardyQuestion(),
  ]);

  if (!gameResult.success) {
    notFound();
  }

  if (!questionResult.success) {
    throw new Error("Failed to load Final Jeopardy question");
  }

  const game = gameResult.data;
  const finalQuestion = questionResult.data.question;

  if (!finalQuestion) {
    throw new Error("No Final Jeopardy question found");
  }

  // Fetch existing wagers
  const wagersResult = await getFinalJeopardyWagers(gameIdNum, questionId);
  const existingWagers = wagersResult.success ? wagersResult.data : [];

  return (
    <FinalJeopardyClient
      game={game}
      question={finalQuestion}
      existingWagers={existingWagers}
    />
  );
}
