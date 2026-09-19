export interface DoshaScores {
  vataScore: number;
  pittaScore: number;
  kaphaScore: number;
}

export interface ScoringResult {
  vataScoreTotal: number;
  pittaScoreTotal: number;
  kaphaScoreTotal: number;
  totalScore: number;
  vataPct: number;
  pittaPct: number;
  kaphaPct: number;
  dominantDosha: string;
}

export interface ScoringSnapshot {
  questionVersion: number;
  methodVersion: string;
  selectedOption: string;
  weights: {
    vata: number;
    pitta: number;
    kapha: number;
  };
}
