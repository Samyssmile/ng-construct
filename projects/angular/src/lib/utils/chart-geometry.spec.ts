import { estimateTextWidth, pickTickIndices } from './chart-geometry';

describe('chart-geometry', () => {
  describe('estimateTextWidth', () => {
    it('scales with length and font size', () => {
      expect(estimateTextWidth('18:00', 12)).toBeCloseTo(36);
      expect(estimateTextWidth('18:00', 24)).toBeCloseTo(72);
      expect(estimateTextWidth('', 12)).toBe(0);
    });

    it('counts code points, not UTF-16 units', () => {
      expect(estimateTextWidth('𝟙𝟚', 10)).toBeCloseTo(12);
    });
  });

  describe('pickTickIndices', () => {
    it('handles empty and single-category axes', () => {
      expect(pickTickIndices(0, 50, 40, 12)).toEqual([]);
      expect(pickTickIndices(1, 50, 40, 12)).toEqual([0]);
    });

    it('labels every tick when labels fit', () => {
      expect(pickTickIndices(5, 144, 40, 12)).toEqual([0, 1, 2, 3, 4]);
    });

    it('never places two labels closer than the label width', () => {
      const spacing = 576 / 30;
      const indices = pickTickIndices(31, spacing, 80, 12);
      for (let i = 1; i < indices.length; i++) {
        expect((indices[i] - indices[i - 1]) * spacing).toBeGreaterThanOrEqual(80);
      }
    });

    it('keeps the last tick and drops the pick that would collide with it', () => {
      // step 5 → 0, 5, 10, 15, 20; 24 is too close to 20, so it replaces it
      expect(pickTickIndices(25, 24, 108.8, 12)).toEqual([0, 5, 10, 15, 24]);
    });

    it('respects the label cap even when space would allow more', () => {
      expect(pickTickIndices(100, 100, 10, 12).length).toBeLessThanOrEqual(12);
    });

    it('keeps only the first label when not even two fit', () => {
      expect(pickTickIndices(2, 100, 300, 12)).toEqual([0]);
    });
  });
});
