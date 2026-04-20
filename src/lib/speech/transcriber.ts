// Speech-to-text transcriber with real-time results and language detection
// Uses the Web Speech API (webkitSpeechRecognition / SpeechRecognition)

// Augment Window type for Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
  type SpeechRecognition = any;
  type SpeechRecognitionEvent = any;
  type SpeechRecognitionErrorEvent = any;
}

export interface TranscriptionResult {
  text: string;
  language: string;       // detected language code (e.g. "en", "hi", "ta")
  confidence: number;     // 0-1
  isFinal: boolean;
}

export type SpeechError =
  | "not-supported"
  | "not-allowed"
  | "no-speech"
  | "network"
  | "aborted"
  | "unknown";

type OnResultCallback = (result: TranscriptionResult) => void;
type OnErrorCallback = (error: SpeechError, message: string) => void;
type OnStateChangeCallback = (state: "idle" | "listening" | "processing") => void;

// Hindi Unicode range: \u0900-\u097F
// Tamil Unicode range: \u0B80-\u0BFF
// Telugu Unicode range: \u0C00-\u0C7F
// Kannada Unicode range: \u0C80-\u0CFF
// Bengali Unicode range: \u0980-\u09FF
// Gujarati Unicode range: \u0A80-\u0AFF
const SCRIPT_DETECTORS: { lang: string; pattern: RegExp }[] = [
  { lang: "hi", pattern: /[\u0900-\u097F]/ },
  { lang: "ta", pattern: /[\u0B80-\u0BFF]/ },
  { lang: "te", pattern: /[\u0C00-\u0C7F]/ },
  { lang: "kn", pattern: /[\u0C80-\u0CFF]/ },
  { lang: "bn", pattern: /[\u0980-\u09FF]/ },
  { lang: "gu", pattern: /[\u0A80-\u0AFF]/ },
  { lang: "ml", pattern: /[\u0D00-\u0D7F]/ },
  { lang: "pa", pattern: /[\u0A00-\u0A7F]/ },
  { lang: "mr", pattern: /[\u0900-\u097F]/ }, // Marathi uses Devanagari like Hindi
];

function detectScriptLanguage(text: string): string {
  for (const { lang, pattern } of SCRIPT_DETECTORS) {
    if (pattern.test(text)) return lang;
  }
  return "en";
}

export class SpeechTranscriber {
  private recognition: SpeechRecognition | null = null;
  private currentLang: string = "en-IN";
  private isListening: boolean = false;

  constructor(
    private readonly onResult: OnResultCallback,
    private readonly onError: OnErrorCallback,
    private readonly onStateChange?: OnStateChangeCallback
  ) {
    this.init();
  }

  private init(): void {
    if (typeof window === "undefined") return;

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      this.onError("not-supported", "Web Speech API is not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = this.currentLang;
    this.recognition.maxAlternatives = 3;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.onStateChange?.("listening");
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence ?? 0.8; // fallback for browsers that omit confidence
      const isFinal = result.isFinal;

      if (isFinal) this.onStateChange?.("processing");

      const detectedLang = detectScriptLanguage(transcript);

      this.onResult({
        text: transcript,
        language: detectedLang,
        confidence,
        isFinal,
      });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      this.onStateChange?.("idle");
      let error: SpeechError = "unknown";
      let message = event.error;
      switch (event.error) {
        case "not-allowed":
          error = "not-allowed";
          message = "Microphone access denied. Please allow microphone access in browser settings.";
          break;
        case "no-speech":
          error = "no-speech";
          message = "No speech detected. Please try again.";
          break;
        case "network":
          error = "network";
          message = "Network error during speech recognition.";
          break;
        case "aborted":
          error = "aborted";
          message = "Speech recognition was aborted.";
          break;
      }
      this.onError(error, message);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.onStateChange?.("idle");
    };
  }

  /** Start listening */
  start(): void {
    if (!this.recognition) {
      this.onError("not-supported", "Speech recognition is not available.");
      return;
    }
    if (this.isListening) return;
    try {
      this.recognition.lang = this.currentLang;
      this.recognition.start();
    } catch (e) {
      this.onError("unknown", `Failed to start: ${String(e)}`);
    }
  }

  /** Stop listening */
  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  /** Abort immediately without processing pending results */
  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
    }
  }

  /** Set recognition language (BCP 47 tag, e.g. "hi-IN", "ta-IN") */
  setLanguage(lang: string): void {
    this.currentLang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  /** Check if currently listening */
  get listening(): boolean {
    return this.isListening;
  }

  /** Check browser support without instantiating */
  static isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /** Destroy and clean up */
  destroy(): void {
    this.abort();
    this.recognition = null;
  }
}

/** Convenience hook-friendly factory */
export function createTranscriber(
  onResult: OnResultCallback,
  onError: OnErrorCallback,
  onStateChange?: OnStateChangeCallback
): SpeechTranscriber {
  return new SpeechTranscriber(onResult, onError, onStateChange);
}

/** Map common language codes to BCP 47 locales for Indian languages */
export const LANGUAGE_TO_BCP47: Record<string, string> = {
  en: "en-IN",
  hi: "hi-IN",
  ta: "ta-IN",
  te: "te-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  bn: "bn-IN",
  gu: "gu-IN",
  mr: "mr-IN",
  pa: "pa-IN",
  ur: "ur-PK",
};
