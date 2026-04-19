/**
 * Static map of all Indian States and UTs.
 * hasOverride = true means a /data/laws/in/{code}.json exists.
 */
import type { StateInfo } from "./types";

export const INDIA_STATES: StateInfo[] = [
  { code: "AN", name: "Andaman & Nicobar Islands", hasOverride: false },
  { code: "AP", name: "Andhra Pradesh", hasOverride: false },
  { code: "AR", name: "Arunachal Pradesh", hasOverride: false },
  { code: "AS", name: "Assam", hasOverride: false },
  { code: "BR", name: "Bihar", hasOverride: false },
  { code: "CH", name: "Chandigarh", hasOverride: false },
  { code: "CT", name: "Chhattisgarh", hasOverride: false },
  { code: "DN", name: "Dadra & Nagar Haveli and Daman & Diu", hasOverride: false },
  { code: "DL", name: "Delhi", hasOverride: true },
  { code: "GA", name: "Goa", hasOverride: false },
  { code: "GJ", name: "Gujarat", hasOverride: false },
  { code: "HR", name: "Haryana", hasOverride: false },
  { code: "HP", name: "Himachal Pradesh", hasOverride: false },
  { code: "JK", name: "Jammu & Kashmir", hasOverride: false },
  { code: "JH", name: "Jharkhand", hasOverride: false },
  { code: "KA", name: "Karnataka", hasOverride: true },
  { code: "KL", name: "Kerala", hasOverride: false },
  { code: "LA", name: "Ladakh", hasOverride: false },
  { code: "LD", name: "Lakshadweep", hasOverride: false },
  { code: "MP", name: "Madhya Pradesh", hasOverride: false },
  { code: "MH", name: "Maharashtra", hasOverride: true },
  { code: "MN", name: "Manipur", hasOverride: false },
  { code: "ML", name: "Meghalaya", hasOverride: false },
  { code: "MZ", name: "Mizoram", hasOverride: false },
  { code: "NL", name: "Nagaland", hasOverride: false },
  { code: "OR", name: "Odisha", hasOverride: false },
  { code: "PY", name: "Puducherry", hasOverride: false },
  { code: "PB", name: "Punjab", hasOverride: false },
  { code: "RJ", name: "Rajasthan", hasOverride: false },
  { code: "SK", name: "Sikkim", hasOverride: false },
  { code: "TN", name: "Tamil Nadu", hasOverride: false },
  { code: "TS", name: "Telangana", hasOverride: false },
  { code: "TR", name: "Tripura", hasOverride: false },
  { code: "UP", name: "Uttar Pradesh", hasOverride: false },
  { code: "UT", name: "Uttarakhand", hasOverride: false },
  { code: "WB", name: "West Bengal", hasOverride: false },
];

export function getStateByCode(code: string): StateInfo | undefined {
  return INDIA_STATES.find((s) => s.code === code);
}
