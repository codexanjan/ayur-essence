import { ApiError } from '../../utils/ApiError.js';
import { DoshaScores, ScoringResult } from './scoring.types.js';

export class ScoringService {
  /**
   * Calculates Dosha totals, normalized percentages, and identifies dominant Dosha.
   * Pure TypeScript domain calculation.
   */
  public static calculate(responses: DoshaScores[]): ScoringResult {
    if (!responses || responses.length === 0) {
      throw ApiError.badRequest(
        'Cannot calculate Prakriti without responses.',
        'EMPTY_RESPONSES'
      );
    }

    let vataScoreTotal = 0;
    let pittaScoreTotal = 0;
    let kaphaScoreTotal = 0;

    for (const res of responses) {
      vataScoreTotal += res.vataScore || 0;
      pittaScoreTotal += res.pittaScore || 0;
      kaphaScoreTotal += res.kaphaScore || 0;
    }

    const totalScore = vataScoreTotal + pittaScoreTotal + kaphaScoreTotal;

    if (totalScore <= 0) {
      throw ApiError.badRequest(
        'Assessment scores cannot be normalized because total score is zero.',
        'INVALID_SCORING_TOTAL'
      );
    }

    // Normalized percentages rounded to 2 decimal places
    const vataPct = Number(((vataScoreTotal / totalScore) * 100).toFixed(2));
    const pittaPct = Number(((pittaScoreTotal / totalScore) * 100).toFixed(2));
    const kaphaPct = Number(((kaphaScoreTotal / totalScore) * 100).toFixed(2));

    const dominantDosha = this.determineDominantDosha(vataPct, pittaPct, kaphaPct);

    return {
      vataScoreTotal,
      pittaScoreTotal,
      kaphaScoreTotal,
      totalScore,
      vataPct,
      pittaPct,
      kaphaPct,
      dominantDosha,
    };
  }

  /**
   * Deterministic tie-breaking rules for dominant Dosha.
   */
  public static determineDominantDosha(vata: number, pitta: number, kapha: number): string {
    const maxScore = Math.max(vata, pitta, kapha);

    const isVataMax = Math.abs(vata - maxScore) < 0.001;
    const isPittaMax = Math.abs(pitta - maxScore) < 0.001;
    const isKaphaMax = Math.abs(kapha - maxScore) < 0.001;

    // Tridoshic tie
    if (isVataMax && isPittaMax && isKaphaMax) {
      return 'TRIDOSHA';
    }

    // Dual-Dosha ties
    if (isVataMax && isPittaMax) {
      return 'VATA-PITTA';
    }
    if (isVataMax && isKaphaMax) {
      return 'VATA-KAPHA';
    }
    if (isPittaMax && isKaphaMax) {
      return 'PITTA-KAPHA';
    }

    // Single dominant
    if (isVataMax) return 'VATA';
    if (isPittaMax) return 'PITTA';
    return 'KAPHA';
  }

  /**
   * Validates that all required active questions for the methodVersion have answers.
   */
  public static validateCompleteness(
    activeQuestionIds: string[],
    answeredQuestionIds: string[]
  ): void {
    const answeredSet = new Set(answeredQuestionIds);
    const missing = activeQuestionIds.filter((id) => !answeredSet.has(id));

    if (missing.length > 0) {
      throw ApiError.unprocessableEntity(
        'Complete all required questionnaire responses before calculating the result.',
        'ASSESSMENT_INCOMPLETE',
        { missingQuestionIds: missing }
      );
    }
  }
}
