"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Player, Category, Question } from "~/server/db/schema";

// ============================================================================
// Types
// ============================================================================
interface GameState {
  gameId: number | null;
  selectedPlayerId: number | null;
  players: Player[];
  categories: Category[];
  questions: Question[];
}

interface GameContextType extends GameState {
  setGameId: (id: number | null) => void;
  selectPlayer: (playerId: number | null) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  updatePlayerScore: (playerId: number, newScore: number) => void;
  setCategories: (categories: Category[]) => void;
  setQuestions: (questions: Question[]) => void;
  markQuestionAnswered: (questionId: number) => void;
  resetGame: () => void;
}

// ============================================================================
// Context
// ============================================================================
const GameContext = createContext<GameContextType | null>(null);

// ============================================================================
// Provider
// ============================================================================
interface GameProviderProps {
  children: ReactNode;
  initialGameId?: number;
  initialPlayers?: Player[];
  initialCategories?: Category[];
  initialQuestions?: Question[];
}

export function GameProvider({
  children,
  initialGameId,
  initialPlayers = [],
  initialCategories = [],
  initialQuestions = [],
}: GameProviderProps) {
  const [gameId, setGameId] = useState<number | null>(initialGameId ?? null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const selectPlayer = useCallback((playerId: number | null) => {
    setSelectedPlayerId(playerId);
  }, []);

  const addPlayer = useCallback((player: Player) => {
    setPlayers((prev) => [...prev, player]);
  }, []);

  const updatePlayerScore = useCallback(
    (playerId: number, newScore: number) => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, score: newScore } : p))
      );
    },
    []
  );

  const markQuestionAnswered = useCallback((questionId: number) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, isAnswered: true } : q
      )
    );
  }, []);

  const resetGame = useCallback(() => {
    setSelectedPlayerId(null);
    setPlayers((prev) => prev.map((p) => ({ ...p, score: 0 })));
    setQuestions((prev) => prev.map((q) => ({ ...q, isAnswered: false })));
  }, []);

  const value: GameContextType = {
    gameId,
    selectedPlayerId,
    players,
    categories,
    questions,
    setGameId,
    selectPlayer,
    setPlayers,
    addPlayer,
    updatePlayerScore,
    setCategories,
    setQuestions,
    markQuestionAnswered,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

// Optional hook that doesn't throw (for components outside provider)
export function useGameOptional() {
  return useContext(GameContext);
}

