import { prisma } from './prisma';
import { DelayPrediction } from '@/types';

function getTimeOfDay(date: Date): string {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

function getRiskLevel(percentage: number): 'low' | 'medium' | 'high' {
  if (percentage < 20) return 'low';
  if (percentage < 50) return 'medium';
  return 'high';
}

export async function calculateDelayPrediction(
  airline: string,
  origin: string,
  destination: string,
  scheduledTime: Date
): Promise<DelayPrediction> {
  const dateStr = scheduledTime.toISOString().split('T')[0];
  const timeOfDay = getTimeOfDay(scheduledTime);

  const records = await prisma.delayRecord.findMany({
    where: {
      airline: airline,
      OR: [
        { origin: origin },
        { destination: destination },
      ],
      date: dateStr,
      timeOfDay: timeOfDay,
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

    return {
      percentage: Math.round((delayedCount / broaderRecords.length) * 100),
      avgDelayMinutes: Math.round(avgDelay),
      basedOnRecords: broaderRecords.length,
      riskLevel: getRiskLevel((delayedCount / broaderRecords.length) * 100),
    };
  }

  const delayedCount = records.filter(r => r.isDelayed).length;
  const avgDelay = records.reduce((sum, r) => sum + r.delayMinutes, 0) / records.length;

  return {
    percentage: Math.round((delayedCount / records.length) * 100),
    avgDelayMinutes: Math.round(avgDelay),
    basedOnRecords: records.length,
    riskLevel: getRiskLevel((delayedCount / records.length) * 100),
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
  const dateStr = scheduledTime.toISOString().split('T')[0];
  const timeOfDay = getTimeOfDay(scheduledTime);
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
      timeOfDay: timeOfDay,
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
