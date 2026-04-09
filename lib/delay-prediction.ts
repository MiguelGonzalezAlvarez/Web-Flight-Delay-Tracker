import { prisma } from './prisma';
import { DelayPrediction } from '@/types';
import { TimeOfDay } from '@/src/domain/value-objects/TimeOfDay';
import { RiskLevel } from '@/src/domain/value-objects/RiskLevel';

export async function calculateDelayPrediction(
  airline: string,
  origin: string,
  destination: string,
  scheduledTime: Date
): Promise<DelayPrediction> {
  const timeOfDay = TimeOfDay.fromDate(scheduledTime);
  const dateStr = scheduledTime.toISOString().split('T')[0];

  const records = await prisma.delayRecord.findMany({
    where: {
      airline: airline,
      OR: [
        { origin: origin },
        { destination: destination },
      ],
      date: dateStr,
      timeOfDay: timeOfDay.value,
    },
  });

  if (records.length === 0) {
    const broaderRecords = await prisma.delayRecord.findMany({
      where: {
        airline: airline,
      },
      take: 100,
    });

    if (broaderRecords.length === 0) {
      return {
        percentage: 15,
        avgDelayMinutes: 12,
        basedOnRecords: 0,
        riskLevel: 'low',
      };
    }

    const delayedCount = broaderRecords.filter(r => r.isDelayed).length;
    const avgDelay = broaderRecords.reduce((sum, r) => sum + r.delayMinutes, 0) / broaderRecords.length;
    const percentage = (delayedCount / broaderRecords.length) * 100;
    const riskLevel = RiskLevel.fromPercentage(percentage);

    return {
      percentage: Math.round(percentage),
      avgDelayMinutes: Math.round(avgDelay),
      basedOnRecords: broaderRecords.length,
      riskLevel: riskLevel.value,
    };
  }

  const delayedCount = records.filter(r => r.isDelayed).length;
  const avgDelay = records.reduce((sum, r) => sum + r.delayMinutes, 0) / records.length;
  const percentage = (delayedCount / records.length) * 100;
  const riskLevel = RiskLevel.fromPercentage(percentage);

  return {
    percentage: Math.round(percentage),
    avgDelayMinutes: Math.round(avgDelay),
    basedOnRecords: records.length,
    riskLevel: riskLevel.value,
  };
}

export async function recordFlight(
  callsign: string,
  origin: string,
  destination: string,
  airline: string,
  scheduledTime: Date,
  actualTime: Date | null,
  status: string
) {
  const timeOfDay = TimeOfDay.fromDate(scheduledTime);
  const dateStr = scheduledTime.toISOString().split('T')[0];
  const delayMinutes = actualTime 
    ? Math.max(0, Math.round((actualTime.getTime() - scheduledTime.getTime()) / 60000))
    : 0;
  const isDelayed = status === 'delayed' || delayMinutes > 15;

  await prisma.delayRecord.upsert({
    where: {
      callsign_date: {
        callsign: callsign,
        date: dateStr,
      },
    },
    update: {
      actualTime: actualTime,
      delayMinutes: delayMinutes,
      isDelayed: isDelayed,
    },
    create: {
      callsign: callsign,
      origin: origin,
      destination: destination,
      airline: airline,
      scheduledTime: scheduledTime,
      actualTime: actualTime,
      delayMinutes: delayMinutes,
      isDelayed: isDelayed,
      date: dateStr,
      timeOfDay: timeOfDay.value,
    },
  });
}

export async function getAirlineStats(airline: string) {
  const records = await prisma.delayRecord.findMany({
    where: { airline: airline },
    take: 100,
  });

  if (records.length === 0) {
    return {
      totalFlights: 0,
      delayedFlights: 0,
      delayPercentage: 0,
      avgDelay: 0,
    };
  }

  const delayedFlights = records.filter(r => r.isDelayed).length;
  const avgDelay = records.reduce((sum, r) => sum + r.delayMinutes, 0) / records.length;

  return {
    totalFlights: records.length,
    delayedFlights: delayedFlights,
    delayPercentage: Math.round((delayedFlights / records.length) * 100),
    avgDelay: Math.round(avgDelay),
  };
}

export async function getAirportStats(icao: string) {
  const records = await prisma.delayRecord.findMany({
    where: {
      OR: [
        { origin: icao },
        { destination: icao },
      ],
    },
    take: 100,
  });

  if (records.length === 0) {
    return {
      totalFlights: 0,
      delayedFlights: 0,
      delayPercentage: 0,
      avgDelay: 0,
    };
  }

  const delayedFlights = records.filter(r => r.isDelayed).length;
  const avgDelay = records.reduce((sum, r) => sum + r.delayMinutes, 0) / records.length;

  return {
    totalFlights: records.length,
    delayedFlights: delayedFlights,
    delayPercentage: Math.round((delayedFlights / records.length) * 100),
    avgDelay: Math.round(avgDelay),
  };
}
