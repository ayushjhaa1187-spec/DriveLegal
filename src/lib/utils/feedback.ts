/**
 * DriveLegal — Sensory Feedback Utility
 * Handling Haptics and UI Sounds for Premium UX
 */

// Simple minimalist click sound (Base64)
const CLICK_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTdvT18AZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQAZABkAGQA";

export const playFeedback = (type: "click" | "success" | "error") => {
  if (typeof window === "undefined") return;

  // 1. Haptics (Vibration)
  if (navigator.vibrate) {
    if (type === "click") navigator.vibrate(10);
    else if (type === "success") navigator.vibrate([15, 30, 15]);
    else if (type === "error") navigator.vibrate([50, 50, 50]);
  }

  // 2. Audio (UI Sounds)
  try {
    const audio = new Audio(CLICK_SOUND);
    audio.volume = 0.1; // Subdued, premium feel
    audio.play().catch(() => {
      // Browsers often block auto-play until first interaction
      // We ignore these errors gracefully
    });
  } catch (err) {
    // Audio engine fail
  }
};
