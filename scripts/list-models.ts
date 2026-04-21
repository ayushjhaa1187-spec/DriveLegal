import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { GoogleGenerativeAI } from "@google/generative-ai";

async function listModels() {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    return;
  }

  // The SDK doesn't have a direct listModels, we usually use the REST API for that
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("Available Models:", JSON.stringify(data, null, 2));
}

listModels().catch(console.error);
