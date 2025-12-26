"use client";

import { useTheme } from "~/lib/theme-context";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light", label: "☀️ Light", emoji: "☀️" },
    { value: "dark", label: "🌙 Dark", emoji: "🌙" },
    { value: "classic-jeopardy", label: "🎮 Classic Jeopardy", emoji: "🎮" },
    { value: "ocean", label: "🌊 Ocean", emoji: "🌊" },
    { value: "sunset", label: "🌅 Sunset", emoji: "🌅" },
  ] as const;

  const currentTheme = themes.find((t) => t.value === theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {currentTheme?.emoji} Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={theme === t.value ? "bg-accent" : ""}
          >
            {t.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

