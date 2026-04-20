/**
 * DriveLegal — Smart Search Algorithm
 * ═══════════════════════════════════════════════════
 * Based on PART 3.2 spec.
 */

import Fuse from "fuse.js";
import type { FuseResultMatch } from "fuse.js";
import type { Violation } from "../law-engine/schema";

interface SearchAlgorithm {
  /**
   * Multi-stage search algorithm:
   * 1. Exact section match (e.g., "Section 184")
   * 2. Category keyword match (e.g., "helmet")
   * 3. Fuzzy semantic match (e.g., "head protection")
   * 4. Synonym expansion (e.g., "biking without lid")
   */
  search(query: string, context: SearchContext): SearchResult[];
}

interface SearchContext {
  vehicleType?: string;
  stateCode?: string;
  language?: string;
  recentSearches?: string[];
}

interface SearchResult {
  violation: Violation;
  score: number;        // 0-1 confidence
  matchType: "exact" | "category" | "fuzzy" | "synonym";
  highlights: string[]; // Matched terms for UI highlighting
}

// Synonym dictionary for Indian context
const SYNONYM_MAP: Record<string, string[]> = {
  helmet: ["headgear", "lid", "topi", "हेलमेट", "ஹெல்மெட்"],
  seatbelt: ["seat belt", "safety belt", "belt", "सीट बेल्ट"],
  drunk: ["alcohol", "intoxicated", "DUI", "drink and drive", "नशे में", "liquor"],
  speed: ["speeding", "overspeed", "fast driving", "तेज़ गाड़ी"],
  signal: ["red light", "traffic light", "signal jump", "सिग्नल"],
  mobile: ["phone", "cell", "calling while driving", "मोबाइल"],
  parking: ["wrong parking", "no parking", "पार्किंग"],
  pollution: ["puc", "smoke", "emission", "प्रदूषण"],
  insurance: ["bima", "policy", "इंश्योरेंस"],
  licence: ["license", "DL", "driving license", "लाइसेंस"],
};

export class SmartSearch implements SearchAlgorithm {
  private fuse: Fuse<Violation>;
  private violations: Violation[];

  constructor(violations: Violation[]) {
    this.violations = violations;
    this.fuse = new Fuse(violations, {
      keys: [
        { name: "title.en", weight: 0.4 },
        { name: "plain_english_summary", weight: 0.3 },
        { name: "section", weight: 0.2 },
        { name: "category", weight: 0.1 },
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
    });
  }

  search(query: string, context: SearchContext = {}): SearchResult[] {
    if (!query.trim()) {
      return this.getRecommendations(context);
    }

    const normalized = query.toLowerCase().trim();
    const expandedQueries = this.expandSynonyms(normalized);
    
    // Stage 1: Exact section match
    const exactMatches = this.findExactSection(normalized);
    if (exactMatches.length > 0) {
      return this.applyContextFilter(
        exactMatches.map((v) => ({
          violation: v,
          score: 1.0,
          matchType: "exact" as const,
          highlights: [v.section ?? ""],
        })),
        context
      );
    }

    // Stage 2 & 3: Fuzzy + synonym
    const allResults = new Map<string, SearchResult>();

    for (const expandedQuery of expandedQueries) {
      const fuseResults = this.fuse.search(expandedQuery);
      
      for (const result of fuseResults) {
        const existing = allResults.get(result.item.id);
        const score = 1 - (result.score ?? 1);
        
        if (!existing || existing.score < score) {
          allResults.set(result.item.id, {
            violation: result.item,
            score,
            matchType: expandedQuery === normalized ? "fuzzy" : "synonym",
            highlights: this.extractHighlights(result.matches),
          });
        }
      }
    }

    return this.applyContextFilter(
      Array.from(allResults.values()).sort((a, b) => b.score - a.score).slice(0, 10),
      context
    );
  }

  private findExactSection(query: string): Violation[] {
    const sectionPattern = /section\s*(\d+[a-z]?)/i;
    const match = query.match(sectionPattern);
    if (!match) return [];
    
    const sectionNum = match[1].toLowerCase();
    return this.violations.filter(
      (v) => v.section?.toLowerCase().includes(`section ${sectionNum}`)
    );
  }

  private expandSynonyms(query: string): string[] {
    const expanded = new Set<string>([query]);
    
    for (const [canonical, synonyms] of Object.entries(SYNONYM_MAP)) {
      if (synonyms.some((s) => query.includes(s.toLowerCase())) || query.includes(canonical)) {
        expanded.add(canonical);
        synonyms.forEach((s) => expanded.add(s.toLowerCase()));
      }
    }
    
    return Array.from(expanded);
  }

  private applyContextFilter(
    results: SearchResult[],
    context: SearchContext
  ): SearchResult[] {
    if (!context.vehicleType || context.vehicleType === "all") return results;
    
    return results.filter(
      (r) =>
        r.violation.applies_to.includes("all") ||
        r.violation.applies_to.includes(context.vehicleType as any)
    );
  }

  private extractHighlights(matches?: readonly FuseResultMatch[]): string[] {
    if (!matches) return [];
    return matches.map((m) => m.value ?? "").filter(Boolean);
  }

  private getRecommendations(context: SearchContext): SearchResult[] {
    // Most common violations as defaults
    const popularCategories = ["helmet", "seatbelt", "speed", "signal_violation", "documentation"];
    return this.violations
      .filter((v) => popularCategories.includes(v.category))
      .slice(0, 6)
      .map((v) => ({
        violation: v,
        score: 0.5,
        matchType: "category" as const,
        highlights: [],
      }));
  }
}
