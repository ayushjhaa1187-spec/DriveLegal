// Contextual follow-up prompt generator
// Produces smart question chips based on the detected violation and user context

import type { Violation, ViolationCategory } from "@/types/violation";

export type FollowUpCategory = "clarification" | "related" | "action" | "legal";

export interface FollowUpPrompt {
  id: string;
  text: string;
  category: FollowUpCategory;
  priority: number;           // lower = higher priority
  icon: string;
}

export interface UserContext {
  stateCode: string | null;
  stateName: string | null;
  vehicleType: string | null;
  isRepeatOffender: boolean;
  hasLicenceSuspension?: boolean;
}

// ============================================================
// Category-specific prompt generators
// ============================================================

function getSpeedPrompts(isRepeat: boolean): FollowUpPrompt[] {
  const prompts: FollowUpPrompt[] = [
    { id: "speed-limit-type", text: "What are highway vs city speed limits?", category: "related", priority: 2, icon: "🛣️" },
    { id: "speed-radar", text: "How do speed cameras work in India?", category: "legal", priority: 3, icon: "📷" },
  ];
  if (isRepeat) {
    prompts.push({ id: "speed-repeat-penalty", text: "What happens on 3rd speed violation?", category: "legal", priority: 1, icon: "⚠️" });
  }
  return prompts;
}

function getHelmetPrompts(vehicleType: string | null): FollowUpPrompt[] {
  return [
    { id: "helmet-standard", text: "Which helmets are ISI approved?", category: "related", priority: 2, icon: "⛑️" },
    { id: "helmet-pillion", text: "Do pillion riders also need helmets?", category: "related", priority: 2, icon: "👤" },
    { id: "helmet-cmvr", text: "What does CMVR Rule 125 say about helmets?", category: "legal", priority: 3, icon: "📋" },
  ];
}

function getSeatbeltPrompts(): FollowUpPrompt[] {
  return [
    { id: "seatbelt-rear", text: "Are rear passengers required to wear seatbelts?", category: "related", priority: 2, icon: "💺" },
    { id: "seatbelt-child", text: "What are child seat rules in India?", category: "related", priority: 3, icon: "👶" },
  ];
}

function getIntoxicationPrompts(): FollowUpPrompt[] {
  return [
    { id: "bac-limit", text: "What is the legal BAC limit in India?", category: "related", priority: 1, icon: "🍺" },
    { id: "bns-drunk", text: "Does drunk driving attract BNS charges too?", category: "legal", priority: 2, icon: "⚖️" },
    { id: "dui-defences", text: "What are valid defences against DUI charges?", category: "legal", priority: 3, icon: "🛡️" },
    { id: "dui-licence", text: "Can I get my licence back after DUI suspension?", category: "action", priority: 3, icon: "🪪" },
  ];
}

function getLicencePrompts(isRepeat: boolean): FollowUpPrompt[] {
  return [
    { id: "licence-renewal", text: "How to renew an expired driving licence?", category: "action", priority: 2, icon: "🔄" },
    { id: "dl-forms", text: "Which form do I need for DL renewal?", category: "action", priority: 3, icon: "📄" },
    ...(isRepeat ? [{ id: "licence-suspension-appeal", text: "How to appeal a licence suspension?", category: "action" as FollowUpCategory, priority: 1, icon: "⚠️" }] : []),
  ];
}

function getInsurancePrompts(): FollowUpPrompt[] {
  return [
    { id: "tp-vs-comprehensive", text: "What is third-party vs comprehensive insurance?", category: "related", priority: 2, icon: "🛡️" },
    { id: "insurance-lapse", text: "What happens if I drive with lapsed insurance?", category: "legal", priority: 2, icon: "❌" },
    { id: "accident-uninsured", text: "What if I have an accident without insurance?", category: "legal", priority: 3, icon: "💥" },
  ];
}

function getRegistrationPrompts(): FollowUpPrompt[] {
  return [
    { id: "rc-renewal", text: "How to renew RC after 15 years?", category: "action", priority: 2, icon: "📋" },
    { id: "transfer-rc", text: "How to transfer vehicle registration on sale?", category: "action", priority: 3, icon: "🔄" },
  ];
}

function getDangerousDrivingPrompts(): FollowUpPrompt[] {
  return [
    { id: "bns-dangerous", text: "Which BNS sections apply to dangerous driving?", category: "legal", priority: 1, icon: "⚖️" },
    { id: "road-rage", text: "Is road rage a criminal offence?", category: "legal", priority: 2, icon: "😡" },
    { id: "hit-run", text: "What happens in a hit-and-run case?", category: "legal", priority: 3, icon: "🚗" },
  ];
}

function getMobileUsePrompts(): FollowUpPrompt[] {
  return [
    { id: "handsfree", text: "Is hands-free calling allowed while driving?", category: "related", priority: 2, icon: "🎧" },
    { id: "gps-allowed", text: "Can I use GPS navigation on my phone?", category: "related", priority: 3, icon: "🗺️" },
  ];
}

function getPollutionPrompts(): FollowUpPrompt[] {
  return [
    { id: "pucc-renew", text: "How and where to get PUCC renewed?", category: "action", priority: 2, icon: "🌿" },
    { id: "bs6-rules", text: "What are BS-VI emission norms?", category: "related", priority: 3, icon: "🌍" },
  ];
}

function getOverloadingPrompts(): FollowUpPrompt[] {
  return [
    { id: "passenger-limit", text: "What is the max passenger limit for my vehicle?", category: "clarification", priority: 1, icon: "👥" },
    { id: "goods-overload", text: "What are goods overloading fines?", category: "related", priority: 2, icon: "🚛" },
  ];
}

function getJurisdictionPrompts(stateCode: string | null, stateName: string | null): FollowUpPrompt[] {
  if (!stateCode || stateCode === "IN") return [];
  return [
    {
      id: "show-rto-contact",
      text: `Show RTO contact info for ${stateName ?? stateCode}`,
      category: "action",
      priority: 4,
      icon: "📍",
    },
    {
      id: "state-specific-laws",
      text: `Are there ${stateName ?? stateCode}-specific traffic laws?`,
      category: "legal",
      priority: 4,
      icon: "🗺️",
    },
  ];
}

// ============================================================
// Main generator
// ============================================================

export function generateFollowUpPrompts(
  violation: Pick<Violation, "category" | "penalty" | "bnsSection" | "cmvrRules">,
  userContext: UserContext,
  maxPrompts = 4
): FollowUpPrompt[] {
  const prompts: FollowUpPrompt[] = [];

  // Vehicle type clarification if missing
  if (!userContext.vehicleType) {
    prompts.push({
      id: "clarify-vehicle",
      text: "What type of vehicle? (2W / 4W / HMV)",
      category: "clarification",
      priority: 0,
      icon: "🚗",
    });
  }

  // Category-specific prompts
  switch (violation.category as ViolationCategory) {
    case "speed":
      prompts.push(...getSpeedPrompts(userContext.isRepeatOffender));
      break;
    case "helmet":
      prompts.push(...getHelmetPrompts(userContext.vehicleType));
      break;
    case "seatbelt":
      prompts.push(...getSeatbeltPrompts());
      break;
    case "intoxication":
      prompts.push(...getIntoxicationPrompts());
      break;
    case "licence":
      prompts.push(...getLicencePrompts(userContext.isRepeatOffender));
      break;
    case "insurance":
      prompts.push(...getInsurancePrompts());
      break;
    case "registration":
      prompts.push(...getRegistrationPrompts());
      break;
    case "dangerous_driving":
      prompts.push(...getDangerousDrivingPrompts());
      break;
    case "mobile_use":
      prompts.push(...getMobileUsePrompts());
      break;
    case "pollution":
      prompts.push(...getPollutionPrompts());
      break;
    case "overloading":
      prompts.push(...getOverloadingPrompts());
      break;
    default:
      break;
  }

  // Penalty-specific prompts
  if (violation.penalty?.licence_suspension) {
    prompts.push({
      id: "recover-licence",
      text: "How do I recover a suspended licence?",
      category: "action",
      priority: 1,
      icon: "🪪",
    });
  }

  if (violation.penalty?.imprisonment_first_offence?.value) {
    prompts.push({
      id: "bailable-offence",
      text: "Is this offence bailable?",
      category: "legal",
      priority: 1,
      icon: "⚖️",
    });
  }

  // BNS cross-reference prompt
  if (violation.bnsSection) {
    prompts.push({
      id: "bns-detail",
      text: `What is ${violation.bnsSection} under BNS 2023?`,
      category: "legal",
      priority: 3,
      icon: "📜",
    });
  }

  // Jurisdiction prompts
  prompts.push(...getJurisdictionPrompts(userContext.stateCode, userContext.stateName));

  // Deduplicate by id, sort by priority, take top N
  const seen = new Set<string>();
  const unique = prompts.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  return unique.sort((a, b) => a.priority - b.priority).slice(0, maxPrompts);
}
