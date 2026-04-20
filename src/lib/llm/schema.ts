// Phase 11.1 — strict Zod schemas for LLM intent output.
// TODO(phase-11): fill schemas; wire router to enforce them.
import { z } from 'zod';

export const IntentSchema = z.object({
  kind: z.enum(['lookup_fine', 'explain_section', 'rights_query', 'other']),
  slots: z.record(z.string(), z.unknown()).default({}),
});
export type Intent = z.infer<typeof IntentSchema>;
