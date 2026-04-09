import { DelayPrediction } from '@/src/domain/entities/DelayPrediction';

describe('DelayPrediction', () => {
  describe('create', () => {
    describe('valid inputs', () => {
      it('should create a valid delay prediction', () => {
        const result = DelayPrediction.create({
          percentage: 35,
          riskLevel: 'medium',
          avgDelayMinutes: 15,
          basedOnRecords: 45,
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.percentage).toBe(35);
          expect(result.value.riskLevel.value).toBe('medium');
          expect(result.value.avgDelayMinutes).toBe(15);
          expect(result.value.basedOnRecords).toBe(45);
        }
      });

      it('should round percentage to nearest integer', () => {
        const result = DelayPrediction.create({
          percentage: 35.7,
          riskLevel: 'medium',
          avgDelayMinutes: 15,
          basedOnRecords: 45,
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.percentage).toBe(36);
        }
      });

      it('should round avgDelayMinutes to nearest integer', () => {
        const result = DelayPrediction.create({
          percentage: 35,
          riskLevel: 'medium',
          avgDelayMinutes: 15.7,
          basedOnRecords: 45,
        });

        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.value.avgDelayMinutes).toBe(16);
        }
      });
    });

    describe('invalid inputs', () => {
      it('should reject negative percentage', () => {
        const result = DelayPrediction.create({
          percentage: -5,
          riskLevel: 'low',
          avgDelayMinutes: 0,
          basedOnRecords: 10,
        });

        expect(result.ok).toBe(false);
      });

      it('should reject percentage over 100', () => {
        const result = DelayPrediction.create({
          percentage: 150,
          riskLevel: 'high',
          avgDelayMinutes: 30,
          basedOnRecords: 10,
        });

        expect(result.ok).toBe(false);
      });

      it('should reject negative avgDelayMinutes', () => {
        const result = DelayPrediction.create({
          percentage: 20,
          riskLevel: 'low',
          avgDelayMinutes: -5,
          basedOnRecords: 10,
        });

        expect(result.ok).toBe(false);
      });

      it('should reject negative basedOnRecords', () => {
        const result = DelayPrediction.create({
          percentage: 20,
          riskLevel: 'low',
          avgDelayMinutes: 5,
          basedOnRecords: -5,
        });

        expect(result.ok).toBe(false);
      });

      it('should reject non-integer basedOnRecords', () => {
        const result = DelayPrediction.create({
          percentage: 20,
          riskLevel: 'low',
          avgDelayMinutes: 5,
          basedOnRecords: 10.5,
        });

        expect(result.ok).toBe(false);
      });
    });
  });

  describe('fromPercentage', () => {
    it('should create prediction from percentage', () => {
      const prediction = DelayPrediction.fromPercentage(35, 15, 45);

      expect(prediction.percentage).toBe(35);
      expect(prediction.riskLevel.value).toBe('medium');
      expect(prediction.avgDelayMinutes).toBe(15);
      expect(prediction.basedOnRecords).toBe(45);
    });

    it('should derive risk level from percentage', () => {
      const low = DelayPrediction.fromPercentage(15, 5, 10);
      expect(low.riskLevel.value).toBe('low');

      const medium = DelayPrediction.fromPercentage(35, 15, 10);
      expect(medium.riskLevel.value).toBe('medium');

      const high = DelayPrediction.fromPercentage(75, 30, 10);
      expect(high.riskLevel.value).toBe('high');
    });
  });

  describe('noData', () => {
    it('should create prediction with no data', () => {
      const prediction = DelayPrediction.noData();

      expect(prediction.percentage).toBe(0);
      expect(prediction.riskLevel.value).toBe('low');
      expect(prediction.avgDelayMinutes).toBe(0);
      expect(prediction.basedOnRecords).toBe(0);
    });
  });

  describe('requiresWarning', () => {
    it('should return false for low risk', () => {
      const prediction = DelayPrediction.fromPercentage(15, 5, 10);

      expect(prediction.requiresWarning()).toBe(false);
    });

    it('should return true for medium risk', () => {
      const prediction = DelayPrediction.fromPercentage(35, 15, 10);

      expect(prediction.requiresWarning()).toBe(true);
    });

    it('should return true for high risk', () => {
      const prediction = DelayPrediction.fromPercentage(75, 30, 10);

      expect(prediction.requiresWarning()).toBe(true);
    });
  });

  describe('requiresAction', () => {
    it('should return false for low risk', () => {
      const prediction = DelayPrediction.fromPercentage(15, 5, 10);

      expect(prediction.requiresAction()).toBe(false);
    });

    it('should return false for medium risk', () => {
      const prediction = DelayPrediction.fromPercentage(35, 15, 10);

      expect(prediction.requiresAction()).toBe(false);
    });

    it('should return true for high risk', () => {
      const prediction = DelayPrediction.fromPercentage(75, 30, 10);

      expect(prediction.requiresAction()).toBe(true);
    });
  });

  describe('isReliable', () => {
    it('should return false for less than 10 records', () => {
      const prediction = DelayPrediction.fromPercentage(35, 15, 5);

      expect(prediction.isReliable()).toBe(false);
    });

    it('should return true for 10 or more records', () => {
      const prediction = DelayPrediction.fromPercentage(35, 15, 10);

      expect(prediction.isReliable()).toBe(true);
    });
  });

  describe('isHighConfidence', () => {
    it('should return false for less than 50 records', () => {
      const prediction = DelayPrediction.fromPercentage(35, 15, 30);

      expect(prediction.isHighConfidence()).toBe(false);
    });

    it('should return true for 50 or more records', () => {
      const prediction = DelayPrediction.fromPercentage(35, 15, 50);

      expect(prediction.isHighConfidence()).toBe(true);
    });
  });

  describe('getConfidenceLevel', () => {
    it('should return low for less than 10 records', () => {
      const prediction = DelayPrediction.fromPercentage(35, 15, 5);

      expect(prediction.getConfidenceLevel()).toBe('low');
    });

    it('should return medium for 10-49 records', () => {
      const prediction = DelayPrediction.fromPercentage(35, 15, 25);

      expect(prediction.getConfidenceLevel()).toBe('medium');
    });

    it('should return high for 50+ records', () => {
      const prediction = DelayPrediction.fromPercentage(35, 15, 50);

      expect(prediction.getConfidenceLevel()).toBe('high');
    });
  });

  describe('getFormattedDelay', () => {
    it('should format minutes only', () => {
      const prediction = DelayPrediction.fromPercentage(35, 45, 10);

      expect(prediction.getFormattedDelay()).toBe('45 min');
    });

    it('should format hours only', () => {
      const prediction = DelayPrediction.fromPercentage(35, 120, 10);

      expect(prediction.getFormattedDelay()).toBe('2h');
    });

    it('should format hours and minutes', () => {
      const prediction = DelayPrediction.fromPercentage(35, 90, 10);

      expect(prediction.getFormattedDelay()).toBe('1h 30m');
    });
  });

  describe('equals', () => {
    it('should return true for equal predictions', () => {
      const p1 = DelayPrediction.fromPercentage(35, 15, 45);
      const p2 = DelayPrediction.fromPercentage(35, 15, 45);

      expect(p1.equals(p2)).toBe(true);
    });

    it('should return false for different predictions', () => {
      const p1 = DelayPrediction.fromPercentage(35, 15, 45);
      const p2 = DelayPrediction.fromPercentage(40, 20, 45);

      expect(p1.equals(p2)).toBe(false);
    });
  });

  describe('toPlainObject', () => {
    it('should return plain object', () => {
      const prediction = DelayPrediction.fromPercentage(35, 15, 45);
      const obj = prediction.toPlainObject();

      expect(obj).toEqual({
        percentage: 35,
        riskLevel: 'medium',
        avgDelayMinutes: 15,
        basedOnRecords: 45,
      });
    });
  });

  describe('immutability', () => {
    it('should be frozen', () => {
      const prediction = DelayPrediction.fromPercentage(35, 15, 45);

      expect(Object.isFrozen(prediction)).toBe(true);
    });
  });
});
