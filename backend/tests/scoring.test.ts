import { describe, it, expect } from 'vitest';
import { ScoringService } from '../src/modules/scoring/scoring.service.js';

describe('ScoringService — Pure Domain Unit Tests', () => {
  it('TC-SCORE-001: Should calculate exact percentages and dominant Dosha matching prompt example', () => {
    // Vata = 24, Pitta = 15, Kapha = 11 -> Total = 50 -> Vata 48%, Pitta 30%, Kapha 22%, Dominant: VATA
    const responses = [
      { vataScore: 24, pittaScore: 15, kaphaScore: 11 },
    ];

    const result = ScoringService.calculate(responses);

    expect(result.totalScore).toBe(50);
    expect(result.vataPct).toBe(48);
    expect(result.pittaPct).toBe(30);
    expect(result.kaphaPct).toBe(22);
    expect(result.dominantDosha).toBe('VATA');
    expect(result.vataPct + result.pittaPct + result.kaphaPct).toBe(100);
  });

  it('TC-SCORE-002: Should correctly identify Pitta dominant constitution', () => {
    const responses = [
      { vataScore: 3, pittaScore: 9, kaphaScore: 3 },
    ];

    const result = ScoringService.calculate(responses);

    expect(result.dominantDosha).toBe('PITTA');
    expect(result.pittaPct).toBe(60);
    expect(result.vataPct).toBe(20);
    expect(result.kaphaPct).toBe(20);
  });

  it('TC-SCORE-003: Should correctly identify Kapha dominant constitution', () => {
    const responses = [
      { vataScore: 1, pittaScore: 2, kaphaScore: 7 },
    ];

    const result = ScoringService.calculate(responses);

    expect(result.dominantDosha).toBe('KAPHA');
    expect(result.kaphaPct).toBe(70);
    expect(result.pittaPct).toBe(20);
    expect(result.vataPct).toBe(10);
  });

  it('TC-SCORE-004: Should deterministically resolve dual-dosha ties', () => {
    // Vata == Pitta > Kapha
    const tieVP = ScoringService.determineDominantDosha(45, 45, 10);
    expect(tieVP).toBe('VATA-PITTA');

    // Vata == Kapha > Pitta
    const tieVK = ScoringService.determineDominantDosha(45, 10, 45);
    expect(tieVK).toBe('VATA-KAPHA');

    // Pitta == Kapha > Vata
    const tiePK = ScoringService.determineDominantDosha(10, 45, 45);
    expect(tiePK).toBe('PITTA-KAPHA');
  });

  it('TC-SCORE-005: Should deterministically resolve tridoshic equal tie', () => {
    const tri = ScoringService.determineDominantDosha(33.33, 33.33, 33.33);
    expect(tri).toBe('TRIDOSHA');
  });

  it('TC-SCORE-006: Should throw INVALID_SCORING_TOTAL error if total score is zero', () => {
    const zeroResponses = [
      { vataScore: 0, pittaScore: 0, kaphaScore: 0 },
    ];

    expect(() => ScoringService.calculate(zeroResponses)).toThrowError(
      /cannot be normalized because total score is zero/
    );
  });

  it('TC-SCORE-007: Should throw EMPTY_RESPONSES error if responses array is empty', () => {
    expect(() => ScoringService.calculate([])).toThrowError(
      /Cannot calculate Prakriti without responses/
    );
  });

  it('TC-SCORE-008: Completeness check should identify missing required questions', () => {
    const active = ['q1', 'q2', 'q3'];
    const answered = ['q1', 'q2'];

    expect(() => ScoringService.validateCompleteness(active, answered)).toThrowError(
      /Complete all required questionnaire responses/
    );
  });

  it('TC-SCORE-009: Completeness check should pass when all questions are answered', () => {
    const active = ['q1', 'q2', 'q3'];
    const answered = ['q3', 'q1', 'q2'];

    expect(() => ScoringService.validateCompleteness(active, answered)).not.toThrow();
  });
});
