import { notFound, redirect } from "next/navigation";
import { QuestionPageClient } from "./client";
import { getQuestionById } from "~/server/actions/question";
import { getAnswersByQuestionId } from "~/server/actions/answer";
import { getPlayerById } from "~/server/actions/player";

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

  // Fetch question data
  const [questionResult, answersResult, playerResult] = await Promise.all([
    getQuestionById(questionId),
    getAnswersByQuestionId(questionId),
    getPlayerById(playerIdNum),
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

  const question = questionResult.data;
  const answers = answersResult.data;
  const player = playerResult.data;

  // If question is already answered, redirect back to game
  if (question.isAnswered) {
    redirect(`/game/${gameIdNum}`);
  }

  return (
    <QuestionPageClient
      question={question}
      answers={answers}
      player={player}
      gameId={gameIdNum}
    />
  );
}

