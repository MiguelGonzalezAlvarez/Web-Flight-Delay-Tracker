import { RiskLevel, RISK_LEVEL_THRESHOLDS } from '@/src/domain/value-objects/RiskLevel';

describe('RiskLevel', () => {
  describe('create', () => {
    describe('valid inputs', () => {
      it('should create low risk', () => {
        const result = RiskLevel.create('low');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('low');
          expect(result.value.label).toBe('Bajo riesgo');
        }
      });

      it('should create medium risk', () => {
        const result = RiskLevel.create('medium');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('medium');
          expect(result.value.label).toBe('Riesgo medio');
        }
      });

      it('should create high risk', () => {
        const result = RiskLevel.create('high');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('high');
          expect(result.value.label).toBe('Alto riesgo');
        }
      });

      it('should normalize uppercase input', () => {
        const result = RiskLevel.create('HIGH');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('high');
        }
      });

      it('should trim whitespace', () => {
        const result = RiskLevel.create('  low  ');

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.value).toBe('low');
        }
      });
    });

    describe('invalid inputs', () => {
      it('should reject null', () => {
        const result = RiskLevel.create(null);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('REQUIRED');
        }
      });

      it('should reject undefined', () => {
        const result = RiskLevel.create(undefined);

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('REQUIRED');
        }
      });

      it('should reject empty string', () => {
        const result = RiskLevel.create('');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('INVALID');
        }
      });

      it('should reject invalid risk level', () => {
        const result = RiskLevel.create('critical');

        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.code).toBe('INVALID');
        }
      });
    });
  });

  describe('fromPercentage', () => {
    it('should return low for 0%', () => {
      const risk = RiskLevel.fromPercentage(0);

      expect(risk.value).toBe('low');
      expect(risk.percentage).toBe(0);
    });

    it('should return low for 20% (threshold)', () => {
      const risk = RiskLevel.fromPercentage(20);

      expect(risk.value).toBe('low');
      expect(risk.percentage).toBe(20);
    });

    it('should return medium for 21%', () => {
      const risk = RiskLevel.fromPercentage(21);

      expect(risk.value).toBe('medium');
      expect(risk.percentage).toBe(21);
    });

    it('should return medium for 50% (threshold)', () => {
      const risk = RiskLevel.fromPercentage(50);

      expect(risk.value).toBe('medium');
      expect(risk.percentage).toBe(50);
    });

    it('should return high for 51%', () => {
      const risk = RiskLevel.fromPercentage(51);

      expect(risk.value).toBe('high');
      expect(risk.percentage).toBe(51);
    });

    it('should return high for 100%', () => {
      const risk = RiskLevel.fromPercentage(100);

      expect(risk.value).toBe('high');
      expect(risk.percentage).toBe(100);
    });

    it('should clamp negative values to 0', () => {
      const risk = RiskLevel.fromPercentage(-10);

      expect(risk.value).toBe('low');
      expect(risk.percentage).toBe(0);
    });

    it('should clamp values over 100 to 100', () => {
      const risk = RiskLevel.fromPercentage(150);

      expect(risk.value).toBe('high');
      expect(risk.percentage).toBe(100);
    });

    it('should round decimal values', () => {
      const risk = RiskLevel.fromPercentage(20.7);

      expect(risk.percentage).toBe(21);
    });
  });

  describe('factory methods', () => {
    it('should create low risk', () => {
      const risk = RiskLevel.low();

      expect(risk.value).toBe('low');
    });

    it('should create medium risk', () => {
      const risk = RiskLevel.medium();

      expect(risk.value).toBe('medium');
    });

    it('should create high risk', () => {
      const risk = RiskLevel.high();

      expect(risk.value).toBe('high');
    });
  });

  describe('requiresWarning', () => {
    it('should return false for low risk', () => {
      const risk = RiskLevel.low();

      expect(risk.requiresWarning()).toBe(false);
    });

    it('should return true for medium risk', () => {
      const risk = RiskLevel.medium();

      expect(risk.requiresWarning()).toBe(true);
    });

    it('should return true for high risk', () => {
      const risk = RiskLevel.high();

      expect(risk.requiresWarning()).toBe(true);
    });
  });

  describe('requiresAction', () => {
    it('should return false for low risk', () => {
      const risk = RiskLevel.low();

      expect(risk.requiresAction()).toBe(false);
    });

    it('should return false for medium risk', () => {
      const risk = RiskLevel.medium();

      expect(risk.requiresAction()).toBe(false);
    });

    it('should return true for high risk', () => {
      const risk = RiskLevel.high();

      expect(risk.requiresAction()).toBe(true);
    });
  });

  describe('getColor', () => {
    it('should return green for low', () => {
      expect(RiskLevel.low().getColor()).toBe('green');
    });

    it('should return amber for medium', () => {
      expect(RiskLevel.medium().getColor()).toBe('amber');
    });

    it('should return red for high', () => {
      expect(RiskLevel.high().getColor()).toBe('red');
    });
  });

  describe('compareTo', () => {
    it('should return negative when comparing low to medium', () => {
      expect(RiskLevel.low().compareTo(RiskLevel.medium())).toBeLessThan(0);
    });

    it('should return negative when comparing medium to high', () => {
      expect(RiskLevel.medium().compareTo(RiskLevel.high())).toBeLessThan(0);
    });

    it('should return positive when comparing high to low', () => {
      expect(RiskLevel.high().compareTo(RiskLevel.low())).toBeGreaterThan(0);
    });

    it('should return zero when comparing same levels', () => {
      expect(RiskLevel.medium().compareTo(RiskLevel.medium())).toBe(0);
    });
  });

  describe('toLocaleString', () => {
    it('should return Spanish label by default', () => {
      const risk = RiskLevel.high();

      expect(risk.toLocaleString()).toBe('Alto riesgo');
    });

    it('should return English label for en locale', () => {
      const risk = RiskLevel.high();

      expect(risk.toLocaleString('en-US')).toBe('high');
    });
  });

  describe('equals', () => {
    it('should return true for equal levels', () => {
      const r1 = RiskLevel.medium();
      const r2 = RiskLevel.medium();

      expect(r1.equals(r2)).toBe(true);
    });

    it('should return false for different levels', () => {
      const r1 = RiskLevel.low();
      const r2 = RiskLevel.high();

      expect(r1.equals(r2)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const risk = RiskLevel.medium();

      expect(Object.isFrozen(risk)).toBe(true);
    });
  });

  describe('thresholds', () => {
    it('should have correct threshold values', () => {
      expect(RISK_LEVEL_THRESHOLDS.LOW_MAX).toBe(20);
      expect(RISK_LEVEL_THRESHOLDS.MEDIUM_MAX).toBe(50);
    });
  });
});
