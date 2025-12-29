import { notFound, redirect } from "next/navigation";
import { QuestionPageClient } from "./client";
import { getQuestionById } from "~/server/actions/question";
import { getAnswersByQuestionId } from "~/server/actions/answer";
import { getPlayerById, getPlayersByGameId } from "~/server/actions/player";
import { isQuestionAnsweredInGame } from "~/server/actions/game";
import { getHintsByQuestionId, getRevealedHints } from "~/server/actions/hint";

interface QuestionPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gameId?: string; playerId?: string }>;
}

export default async function QuestionPage({
  params,
  searchParams,
}: QuestionPageProps) {
  const { id } = await params;
  const { gameId, playerId } = await searchParams;

  const questionId = parseInt(id, 10);
  const gameIdNum = gameId ? parseInt(gameId, 10) : null;
  const playerIdNum = playerId ? parseInt(playerId, 10) : null;

  if (isNaN(questionId)) {
    notFound();
  }

  // Require gameId and playerId
  if (!gameIdNum || !playerIdNum) {
    redirect("/");
  }

  // Fetch question data and all players for the game
  const [
    questionResult,
    answersResult,
    playerResult,
    allPlayersResult,
    answeredResult,
    hintsResult,
    revealedHintsResult,
  ] = await Promise.all([
    getQuestionById(questionId),
    getAnswersByQuestionId(questionId),
    getPlayerById(playerIdNum),
    getPlayersByGameId(gameIdNum),
    isQuestionAnsweredInGame(gameIdNum, questionId), // Check per-game answered status
    getHintsByQuestionId(questionId),
    getRevealedHints(gameIdNum, questionId),
  ]);

  if (!questionResult.success) {
    notFound();
  }

  if (!answersResult.success) {
    throw new Error("Failed to load answers");
  }

  if (!playerResult.success) {
    redirect(`/game/${gameIdNum}`);
  }

  if (!allPlayersResult.success) {
    throw new Error("Failed to load players");
  }

  const question = questionResult.data;
  const answers = answersResult.data;
  const player = playerResult.data;
  const allPlayers = allPlayersResult.data;
  const hints = hintsResult.success ? hintsResult.data : [];
  const revealedHintIds = revealedHintsResult.success
    ? revealedHintsResult.data
    : [];

  // If question is already answered in this game, redirect back to game
  if (answeredResult.success && answeredResult.data) {
    redirect(`/game/${gameIdNum}`);
  }

  return (
    <QuestionPageClient
      question={question}
      answers={answers}
      player={player}
      allPlayers={allPlayers}
      gameId={gameIdNum}
      hints={hints}
      revealedHintIds={revealedHintIds}
    />
  );
}

