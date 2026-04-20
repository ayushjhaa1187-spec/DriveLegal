export interface ParsedIntent {
  violations: string[];
  state: string | null;
  vehicleType: string | null;
  isRepeatOffender: boolean;
  rawQuery: string;
  confidence: number;
}

export interface LLMResponse {
  content: string;
  provider: string;
  tokensUsed: number;
  cached: boolean;
  parsedIntent?: ParsedIntent;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  citations?: Citation[];
  provider?: string;
}

export interface Citation {
  section: string;
  title: string;
  sourceUrl: string;
  sourceDocument: string;
}
