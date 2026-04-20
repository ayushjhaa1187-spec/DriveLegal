/**
 * P14.1 — compute Green/Yellow/Red license health tier.
 * This logic is deterministic and runs client-side based on user's history.
 */

export type HealthTier = 'green' | 'yellow' | 'red';

export interface OffenceRecord {
  id: string;
  date: string;
  fine: number;
  isRepeat?: boolean;
  imprisonmentRisk?: boolean;
  points?: number;
}

export function computeHealth(history: any[]): { 
  tier: HealthTier, 
  score: number, 
  status: string,
  recommendation: string 
} {
  if (!history || history.length === 0) {
    return {
      tier: 'green',
      score: 100,
      status: 'PRISTINE',
      recommendation: 'Your record is clear. Drive safe to maintain this status.'
    };
  }

  const totalFines = history.reduce((sum, h) => sum + (h.fine || 0), 0);
  const repeatCount = history.filter(h => h.isRepeat).length;
  const severeCount = history.filter(h => h.imprisonmentRisk).length;
  
  // Scoring logic (starts at 100)
  let score = 100;
  score -= Math.min(40, (totalFines / 1000) * 2); // 2 points per 1k fine, max 40
  score -= (repeatCount * 15); // 15 points per repeat offence
  score -= (severeCount * 30); // 30 points per severe (imprisonable) offence
  
  score = Math.max(0, score);

  if (score < 40 || severeCount >= 1) {
    return {
      tier: 'red',
      score,
      status: 'AT RISK',
      recommendation: 'Urgent: High-risk offences detected. Your license usage is under scrutiny.'
    };
  }

  if (score < 75 || history.length >= 3) {
    return {
      tier: 'yellow',
      score,
      status: 'CAUTION',
      recommendation: 'Warning: Multiple citations. Further offences may lead to suspension.'
    };
  }

  return {
    tier: 'green',
    score,
    status: 'GOOD',
    recommendation: 'Healthy record. Maintain compliance to avoid penalty spikes.'
  };
}
