import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ ERROR: GOOGLE_GEMINI_API_KEY no está configurado.");
  throw new Error("GOOGLE_GEMINI_API_KEY is missing in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      console.error("❌ ERROR: Pregunta vacía.");
      return NextResponse.json(
        { error: "Debes escribir una pregunta." },
        { status: 400 }
      );
    }

    console.log("📤 Enviando pregunta a Google Gemini:", question);

    const result = await model.generateContent(question);
    const textResponse = result.response?.text();

    console.log("✅ Respuesta de Google Gemini:", textResponse);

    return NextResponse.json({ response: textResponse || "No response" });
  } catch (error: any) {
    console.error("❌ ERROR en API:", error);
    return NextResponse.json(
      { error: "Error procesando la solicitud", details: error.message },
      { status: 500 }
    );
  }
}
