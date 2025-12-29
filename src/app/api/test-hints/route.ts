import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { questions, questionHints } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // Get first question
    const allQuestions = await db.select().from(questions).limit(5);

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: "No questions found. Please create a question first." },
        { status: 404 },
      );
    }

    const targetQuestion = allQuestions[0]!;

    // Check if hints already exist
    const existingHints = await db
      .select()
      .from(questionHints)
      .where(eq(questionHints.questionId, targetQuestion.id));

    if (existingHints.length > 0) {
      return NextResponse.json({
        message: `Question ${targetQuestion.id} already has ${existingHints.length} hints.`,
        questionId: targetQuestion.id,
        hints: existingHints,
      });
    }

    // Add test hints
    const hints = [
      {
        questionId: targetQuestion.id,
        type: "text" as const,
        textContent: "This is a helpful text hint that provides additional context.",
        order: 1,
        description: "First hint - text clue",
      },
      {
        questionId: targetQuestion.id,
        type: "text" as const,
        textContent: "This is the second hint with even more specific information.",
        order: 2,
        description: "Second hint - more specific",
      },
      {
        questionId: targetQuestion.id,
        type: "text" as const,
        textContent: "Final hint: This almost gives away the answer!",
        order: 3,
        description: "Third hint - very specific",
      },
    ];

    const createdHints = [];
    for (const hint of hints) {
      const [created] = await db.insert(questionHints).values(hint).returning();
      createdHints.push(created);
    }

    return NextResponse.json({
      message: "Test hints added successfully!",
      questionId: targetQuestion.id,
      questionText: targetQuestion.text,
      hints: createdHints,
      testUrl: `/question/${targetQuestion.id}?gameId=1&playerId=1`,
    });
  } catch (error) {
    console.error("Error adding test hints:", error);
    return NextResponse.json(
      { error: "Failed to add test hints" },
      { status: 500 },
    );
  }
}

