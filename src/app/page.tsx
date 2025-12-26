import Link from "next/link";
import { HomePageClient } from "./home-client";
import { getActiveGames } from "~/server/actions/game";

export default async function HomePage() {
  const gamesResult = await getActiveGames();
  const activeGames = gamesResult.success ? gamesResult.data : [];

  return <HomePageClient activeGames={activeGames} />;
}
