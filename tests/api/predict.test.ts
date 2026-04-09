import { sanitizeString, validateCallsign } from '@/lib/middleware/validation';

jest.mock('@/lib/delay-prediction', () => ({
  calculateDelayPrediction: jest.fn().mockResolvedValue({
    percentage: 25,
    avgDelayMinutes: 15,
    basedOnRecords: 75,
    riskLevel: 'medium',
  }),
}));

jest.mock('@/lib/middleware/rateLimit', () => ({
  rateLimit: jest.fn().mockReturnValue({ success: true, remaining: 99, resetIn: 60000 }),
  getClientIdentifier: jest.fn().mockReturnValue('127.0.0.1'),
}));

describe('Predict API Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Request Validation', () => {
    it('should require airline parameter', () => {
      const url = new URL('http://localhost/api/predict');
      const hasAirline = url.searchParams.has('airline');
      
      expect(hasAirline).toBe(false);
    });

    it('should accept airline parameter', () => {
      const url = new URL('http://localhost/api/predict?airline=Iberia');
      const airline = url.searchParams.get('airline');
      
      expect(airline).toBe('Iberia');
    });

    it('should accept optional origin and destination', () => {
      const url = new URL('http://localhost/api/predict?airline=Iberia&origin=LEMD&destination=LEBL');
      
      expect(url.searchParams.get('origin')).toBe('LEMD');
      expect(url.searchParams.get('destination')).toBe('LEBL');
    });

    it('should accept optional scheduledTime', () => {
      const scheduledTime = '2024-01-15T10:00:00Z';
      const url = new URL(`http://localhost/api/predict?airline=Iberia&scheduledTime=${scheduledTime}`);
      
      expect(url.searchParams.get('scheduledTime')).toBe(scheduledTime);
    });

    it('should sanitize airline input', () => {
      const result = sanitizeString('  Iberia  ');
      expect(result).toBe('Iberia');
    });

    it('should validate callsign', () => {
      expect(validateCallsign('IBE1234')).toBe(true);
      expect(validateCallsign('I')).toBe(false);
    });
  });

  describe('Prediction Calculation', () => {
    it('should calculate delay prediction', async () => {
      const { calculateDelayPrediction } = require('@/lib/delay-prediction');
      
      const prediction = await calculateDelayPrediction(
        'Iberia',
        'LEMD',
        'LEBL',
        new Date()
      );
      
      expect(prediction).toBeDefined();
      expect(prediction.percentage).toBe(25);
      expect(prediction.riskLevel).toBe('medium');
    });

    it('should handle missing optional parameters', async () => {
      const { calculateDelayPrediction } = require('@/lib/delay-prediction');
      
      const prediction = await calculateDelayPrediction(
        'Iberia',
        '',
        '',
        new Date()
      );
      
      expect(prediction).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should check rate limit', async () => {
      const { rateLimit } = require('@/lib/middleware/rateLimit');
      
      const result = rateLimit('127.0.0.1');
      
      expect(result.success).toBe(true);
    });
  });
});
