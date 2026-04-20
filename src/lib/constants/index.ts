import { INDIA_STATES as LAW_ENGINE_STATES } from "../law-engine/states";

export const INDIAN_STATES = LAW_ENGINE_STATES;

export const VIOLATION_CATEGORIES = [
  { code: "helmet", label: "Helmet", icon: "🪖" },
  { code: "seatbelt", label: "Seatbelt", icon: "💺" },
  { code: "speed", label: "Speeding", icon: "⚡" },
  { code: "signal_violation", label: "Signal", icon: "🚦" },
  { code: "drink_drive", label: "DUI", icon: "🍺" },
  { code: "mobile", label: "Mobile", icon: "📱" },
  { code: "wrong_side", label: "Wrong Side", icon: "↩️" },
  { code: "license", label: "DL/Paper", icon: "📄" },
] as const;

export const VEHICLE_TYPES = [
  { code: "2W", label: "Two-Wheeler (Bike/Scooter)" },
  { code: "3W", label: "Three-Wheeler (Auto)" },
  { code: "4W", label: "Four-Wheeler (Car/SUV)" },
  { code: "HMV", label: "Heavy Vehicle (Truck/Bus)" },
] as const;
