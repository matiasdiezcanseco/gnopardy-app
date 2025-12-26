import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist, Figtree } from "next/font/google";
import { cn } from "~/lib/utils";
import { ThemeProvider } from "~/lib/theme-context";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Jeopardy - Interactive Game",
  description: "Play Jeopardy with friends and family",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn(geist.variable, figtree.variable)} suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
