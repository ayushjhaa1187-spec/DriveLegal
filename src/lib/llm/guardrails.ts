/**
 * Hallucination Safeguards for DriveLegal AI.
 * Ensures the AI never attempts to "invent" fine amounts.
 */

import { IntentSchema, type StructuredIntent } from "./schema";

/**
 * Checks if a string contains any currency symbols or numeric amounts.
 * Used to detect if the LLM is trying to output a fine instead of just intent.
 */
export function assertNoFineOutput(raw: string): void {
  const currencyPattern = /[₹$]|(?:INR|rs|rupee|amount|fine|cost)\b/i;
  const moneyPattern = /\d+,\d+|\d+\.\d+|\b\d{3,}\b/; // Matches 3+ digit numbers or formatted numbers
  
  if (currencyPattern.test(raw) || moneyPattern.test(raw)) {
    console.warn("GUARDRAIL: Forbidden content detected in LLM output (possible fine/amount).");
    throw new Error("PROMPT_INJECTION_OR_HALLUCINATION: AI attempted to output a fine amount.");
  }
}

/**
 * Validates and sanitizes the structured intent.
 */
export function sanitizeIntent(raw: any): StructuredIntent | null {
  try {
    const result = IntentSchema.safeParse(raw);
    if (!result.success) {
      console.error("GUARDRAIL: Intent validation failed.", result.error);
      return null;
    }
    return result.data;
  } catch (err) {
    console.error("GUARDRAIL: Sanitization error.", err);
    return null;
  }
}
