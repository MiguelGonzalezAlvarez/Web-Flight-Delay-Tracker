import { DelayPrediction, DelayPredictionProps } from '../../domain/entities/DelayPrediction';
import { DelayPredictionRepository } from '../../domain/repositories/DelayPredictionRepository';
import { Result, success, failure } from '../../domain/value-objects/Result';
import { ValidationError } from '../../domain/value-objects/ValidationError';
import { prisma } from '../../../lib/prisma';

export class PrismaDelayPredictionRepository implements DelayPredictionRepository {
  async findByFlightId(flightId: string): Promise<Result<DelayPrediction, ValidationError> | null> {
    try {
      const record = await prisma.delayRecord.findFirst({
        where: { callsign: flightId },
        orderBy: { createdAt: 'desc' },
      });
      if (!record) {
        return null;
      }
      return this.mapToEntity(record);
    } catch {
      return null;
    }
  }

  async findByRiskLevel(riskLevel: 'low' | 'medium' | 'high'): Promise<Result<DelayPrediction, ValidationError>[]> {
    try {
      const records = await prisma.delayRecord.findMany({
        where: { isDelayed: riskLevel !== 'low' },
        take: 100,
      });

      const lowerBound = riskLevel === 'low' ? 0 : riskLevel === 'medium' ? 20 : 50;
      const upperBound = riskLevel === 'low' ? 20 : riskLevel === 'medium' ? 50 : 100;

      const filtered = records.filter((r) => {
        const percentage = r.isDelayed ? 50 : 15;
        return percentage >= lowerBound && percentage < upperBound;
      });

      return filtered
        .map((r) => this.mapToEntity(r))
        .filter((r): r is Result<DelayPrediction, ValidationError> => r !== null);
    } catch {
      return [];
    }
  }

  async findHighRisk(): Promise<Result<DelayPrediction, ValidationError>[]> {
    try {
      const records = await prisma.delayRecord.findMany({
        where: { isDelayed: true },
        take: 100,
      });
      return records
        .map((r) => this.mapToEntity(r))
        .filter((r): r is Result<DelayPrediction, ValidationError> => r !== null);
    } catch {
      return [];
    }
  }

  async save(prediction: DelayPrediction, flightId: string): Promise<Result<DelayPrediction, ValidationError>> {
    try {
      const plain = prediction.toPlainObject();
      await prisma.delayRecord.upsert({
        where: {
          callsign_date: {
            callsign: flightId,
            date: new Date().toISOString().split('T')[0],
          },
        },
        create: {
          callsign: flightId,
          origin: '',
          destination: '',
          airline: '',
          scheduledTime: new Date(),
          actualTime: null,
          delayMinutes: plain.avgDelayMinutes,
          isDelayed: plain.riskLevel !== 'low',
          date: new Date().toISOString().split('T')[0],
          timeOfDay: 'morning',
        },
        update: {
          delayMinutes: plain.avgDelayMinutes,
          isDelayed: plain.riskLevel !== 'low',
        },
      });
      return success(prediction);
    } catch {
      return failure(ValidationError.invalid('DelayPrediction', 'Failed to save'));
    }
  }

  async deleteByFlightId(flightId: string): Promise<Result<void, ValidationError>> {
    try {
      await prisma.delayRecord.deleteMany({
        where: { callsign: flightId },
      });
      return success(undefined);
    } catch {
      return failure(ValidationError.invalid('DelayPrediction', 'Failed to delete'));
    }
  }

  async findReliable(): Promise<Result<DelayPrediction, ValidationError>[]> {
    try {
      const records = await prisma.delayRecord.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        take: 100,
      });
      return records
        .map((r) => this.mapToEntity(r))
        .filter((r): r is Result<DelayPrediction, ValidationError> => r !== null);
    } catch {
      return [];
    }
  }

  private mapToEntity(
    record: {
      id: string;
      callsign: string;
      delayMinutes: number;
      isDelayed: boolean;
      createdAt: Date;
    }
  ): Result<DelayPrediction, ValidationError> | null {
    const percentage = record.isDelayed ? 50 : 15;
    const riskLevel: 'low' | 'medium' | 'high' = percentage < 20 ? 'low' : percentage < 50 ? 'medium' : 'high';

    const props: DelayPredictionProps = {
      percentage,
      riskLevel,
      avgDelayMinutes: record.delayMinutes,
      basedOnRecords: 1,
    };
    return DelayPrediction.create(props);
  }
}
