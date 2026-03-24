import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

const supportedLanguages = new Set(["russian", "ukrainian", "greek", "spanish"]);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = body?.text as string | undefined;
    const targetLanguageRaw = body?.targetLanguage as string | undefined;
    const targetLanguage = targetLanguageRaw?.toLowerCase().trim();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Both text and targetLanguage are required" },
        { status: 400 }
      );
    }

    if (!supportedLanguages.has(targetLanguage)) {
      return NextResponse.json(
        { error: "Unsupported language requested" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a precise translator. Translate the user's text naturally and fluently into the target language. Keep meaning, tone, and emotional style. Return only translated text with no extra commentary.",
        },
        {
          role: "user",
          content: `Target language: ${targetLanguage}\n\nText to translate:\n${text}`,
        },
      ],
    });

    const translatedText = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!translatedText) {
      return NextResponse.json(
        { error: "Translation service returned empty result" },
        { status: 502 }
      );
    }

    return NextResponse.json({ translatedText });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown translation error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
