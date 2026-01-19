/**
 * Firebase Realtime Database Service for SETTRADE Data
 * Fetches market data from Firebase Realtime Database
 */

import { ref, get, Database } from 'firebase/database';
import { db } from '@/lib/firebase';
import {
  IndustrySector,
  InvestorType,
  IndustrySectorResponse,
  InvestorTypeResponse,
} from '@/types/settrade';

/**
 * Get the latest industry sector data from Firebase
 */
export async function getLatestIndustrySector(): Promise<IndustrySectorResponse | null> {
  try {
    const latestRef = ref(db, 'settrade/industrySector/latest');
    const latestSnapshot = await get(latestRef);

    if (!latestSnapshot.exists()) {
      console.warn('No industry sector latest data found');
      return null;
    }

    const latest = latestSnapshot.val();
    const date = latest.date;

    // Fetch the actual data using the reference path
    const dataRef = ref(db, `settrade/industrySector/byDate/${date}`);
    const dataSnapshot = await get(dataRef);

    if (!dataSnapshot.exists()) {
      console.warn(`No industry sector data found for date: ${date}`);
      return null;
    }

    const data = dataSnapshot.val();

    // Transform rows into array format
    const sectors = Object.entries(data.rows || {}).map(([id, row]: [string, any]) => ({
      id,
      name: row.name,
      last: row.last,
      chg: row.chg,
      chgPct: row.chgPct,
      volK: row.volK,
      valMn: row.valMn,
    }));

    // Sort by change percent descending
    sectors.sort((a, b) => b.chgPct - a.chgPct);

    return {
      date,
      capturedAt: data.meta.capturedAt,
      sectors,
    };
  } catch (error) {
    console.error('Error fetching industry sector data:', error);
    return null;
  }
}

/**
 * Get the latest investor type data from Firebase
 */
export async function getLatestInvestorType(): Promise<InvestorTypeResponse | null> {
  try {
    const latestRef = ref(db, 'settrade/investorType/latest');
    const latestSnapshot = await get(latestRef);

    if (!latestSnapshot.exists()) {
      console.warn('No investor type latest data found');
      return null;
    }

    const latest = latestSnapshot.val();
    const date = latest.date;

    // Fetch the actual data using the reference path
    const dataRef = ref(db, `settrade/investorType/byDate/${date}`);
    const dataSnapshot = await get(dataRef);

    if (!dataSnapshot.exists()) {
      console.warn(`No investor type data found for date: ${date}`);
      return null;
    }

    const data = dataSnapshot.val();

    // Transform rows into array format
    const investors = Object.entries(data.rows || {}).map(([id, row]: [string, any]) => ({
      id,
      name: row.name,
      buyValue: row.buyValue,
      sellValue: row.sellValue,
      netValue: row.netValue,
      buyPct: row.buyPct,
      sellPct: row.sellPct,
    }));

    // Sort by net value descending
    investors.sort((a, b) => b.netValue - a.netValue);

    return {
      date,
      capturedAt: data.meta.capturedAt,
      investors,
    };
  } catch (error) {
    console.error('Error fetching investor type data:', error);
    return null;
  }
}

/**
 * Get industry sector data for a specific date
 */
export async function getIndustrySectorByDate(date: string): Promise<IndustrySectorResponse | null> {
  try {
    const dataRef = ref(db, `settrade/industrySector/byDate/${date}`);
    const dataSnapshot = await get(dataRef);

    if (!dataSnapshot.exists()) {
      console.warn(`No industry sector data found for date: ${date}`);
      return null;
    }

    const data = dataSnapshot.val();

    const sectors = Object.entries(data.rows || {}).map(([id, row]: [string, any]) => ({
      id,
      name: row.name,
      last: row.last,
      chg: row.chg,
      chgPct: row.chgPct,
      volK: row.volK,
      valMn: row.valMn,
    }));

    sectors.sort((a, b) => b.chgPct - a.chgPct);

    return {
      date,
      capturedAt: data.meta.capturedAt,
      sectors,
    };
  } catch (error) {
    console.error(`Error fetching industry sector data for date ${date}:`, error);
    return null;
  }
}

/**
 * Get investor type data for a specific date
 */
export async function getInvestorTypeByDate(date: string): Promise<InvestorTypeResponse | null> {
  try {
    const dataRef = ref(db, `settrade/investorType/byDate/${date}`);
    const dataSnapshot = await get(dataRef);

    if (!dataSnapshot.exists()) {
      console.warn(`No investor type data found for date: ${date}`);
      return null;
    }

    const data = dataSnapshot.val();

    const investors = Object.entries(data.rows || {}).map(([id, row]: [string, any]) => ({
      id,
      name: row.name,
      buyValue: row.buyValue,
      sellValue: row.sellValue,
      netValue: row.netValue,
      buyPct: row.buyPct,
      sellPct: row.sellPct,
    }));

    investors.sort((a, b) => b.netValue - a.netValue);

    return {
      date,
      capturedAt: data.meta.capturedAt,
      investors,
    };
  } catch (error) {
    console.error(`Error fetching investor type data for date ${date}:`, error);
    return null;
  }
}

/**
 * Get available dates for industry sector data
 */
export async function getIndustrySectorDates(): Promise<string[]> {
  try {
    const indexRef = ref(db, 'settrade/industrySector/indexByDate');
    const indexSnapshot = await get(indexRef);

    if (!indexSnapshot.exists()) {
      return [];
    }

    const index = indexSnapshot.val();
    const dates = Object.values(index).map((entry: any) => entry.date);

    // Sort dates descending (newest first)
    return dates.sort((a, b) => b.localeCompare(a));
  } catch (error) {
    console.error('Error fetching industry sector dates:', error);
    return [];
  }
}

/**
 * Get available dates for investor type data
 */
export async function getInvestorTypeDates(): Promise<string[]> {
  try {
    const indexRef = ref(db, 'settrade/investorType/indexByDate');
    const indexSnapshot = await get(indexRef);

    if (!indexSnapshot.exists()) {
      return [];
    }

    const index = indexSnapshot.val();
    const dates = Object.values(index).map((entry: any) => entry.date);

    // Sort dates descending (newest first)
    return dates.sort((a, b) => b.localeCompare(a));
  } catch (error) {
    console.error('Error fetching investor type dates:', error);
    return [];
  }
}
