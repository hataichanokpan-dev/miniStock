/**
 * Thai Market Sector Standards and Benchmarks
 * Center standard information for SET stocks comparison
 * Data updated: 2024-2025
 * Sources:
 * - SET Annual Report 2024
 * - Bloomberg SET Index Data
 * - MSCI Thailand Index Factsheet
 * - CEIC Data
 * - Fitch Ratings, Kasikornbank Research, Thanachart Securities
 */

// SET Index Overall Benchmark Standards (Updated 2024-2025)
// Latest SET metrics: P/E 15.4x, P/BV 1.22x, Dividend Yield 3.71%
export const SET_INDEX_BENCHMARK = {
  name: 'SET Index',
  peRatio: 15.4,
  pbRatio: 1.22,
  dividendYield: 3.7,
} as const;

// Sector Peer Groups with representative stocks and updated benchmarks
// Research sources: SimplyWall.st, Fitch Ratings, Kasikornbank Research,
// Thanachart Securities, SET Official Data
export const SECTOR_PEER_GROUPS: Record<string, {
  name: string;
  peers: string[];
  benchmark?: {
    peRatio?: number;
    pbRatio?: number;
    dividendYield?: number;
    roe?: number;
  };
}> = {
  // Banking & Finance (Industry P/E: 7.9x, 3-year avg)
  // Source: Fitch Ratings, Kasikornbank Research 2024
  BANKING: {
    name: 'Banking',
    peers: ['BBL', 'KBANK', 'SCB', 'KTB', 'CIMBT', 'TMB', 'TISCO', 'KKP', 'BAY'],
    benchmark: {
      peRatio: 7.9,
      pbRatio: 0.8,
      dividendYield: 5.5,
      roe: 11.5,
    },
  },

  // Energy (Industry P/E: 11.7x, 3-year avg 9.2x)
  // PTT P/E: 12.7x, PTTEP: ~8-10x
  // Source: Thanachart Securities Energy Sector 2025
  ENERGY: {
    name: 'Energy',
    peers: ['PTT', 'PTTEP', 'TOP', 'BCH', 'BDMS', 'GULF', 'OR', 'IRPC', 'PTTGC'],
    benchmark: {
      peRatio: 11.7,
      pbRatio: 1.1,
      dividendYield: 5.0,
      roe: 14.5,
    },
  },

  // Telecommunications (Peer avg P/E: 14.4x)
  // INTUCH: 17.02x-23.1x, TRUE: expensive (turnaround), ADVANC: premium
  // 3-year avg was 84.4x, now compressed significantly
  // Source: Thanachart Telecom Sector 2025
  TELECOMMUNICATION: {
    name: 'Telecommunication',
    peers: ['ADVANC', 'INTUCH', 'TRUE', 'DTAC', 'THCOM'],
    benchmark: {
      peRatio: 14.4,
      pbRatio: 2.5,
      dividendYield: 4.0,
      roe: 16.0,
    },
  },

  // Property & Real Estate (Industry P/E: 13.5x)
  // AP: 6.4x-6.5x (undervalued vs fair P/E 7.6x), LH: 9.1x, FPT: 18.4x
  // Source: SET Property Data, JLL Research 2024
  PROPERTY: {
    name: 'Property',
    peers: ['AP', 'LH', 'QH', 'SF', 'MEGA', 'PSL', 'MTL', 'FPT', 'ORI', 'PRIN'],
    benchmark: {
      peRatio: 13.5,
      pbRatio: 0.7,
      dividendYield: 4.0,
      roe: 9.0,
    },
  },

  // Automotive
  // Source: F&S Thailand Automotive 2024
  AUTOMOTIVE: {
    name: 'Automotive',
    peers: ['TA', 'HMPRO', 'GPSC', 'SOKE', 'STEC', 'ADVICE'],
    benchmark: {
      peRatio: 12.5,
      pbRatio: 1.2,
      dividendYield: 3.5,
      roe: 11.0,
    },
  },

  // Food & Beverage (Agro & Food Industry)
  // Source: SET Agro & Food Index Data
  FOOD: {
    name: 'Food & Beverage',
    peers: ['CPF', 'MFC', 'TFM', 'TUF', 'TKS', 'SFP', 'TCP', 'AOT'],
    benchmark: {
      peRatio: 15.0,
      pbRatio: 1.5,
      dividendYield: 3.2,
      roe: 12.5,
    },
  },

  // Retail & Wholesale
  // CPALL, HMPRO are major players
  // Source: Thanachart Retail Sector 2024
  RETAIL: {
    name: 'Retail',
    peers: ['CPALL', 'BJC', 'OTCP', 'HMPRO', 'BTS', 'ERW', 'MAKRO', 'POWER_D'],
    benchmark: {
      peRatio: 20.0,
      pbRatio: 4.0,
      dividendYield: 3.0,
      roe: 15.0,
    },
  },

  // Health Care
  // BDMS is major player with premium valuation
  // Source: SET Healthcare Index
  HEALTHCARE: {
    name: 'Health Care',
    peers: ['BDMS', 'BH', 'PRG', 'CHG', 'SIH', 'ACC', 'NHealth'],
    benchmark: {
      peRatio: 28.0,
      pbRatio: 3.5,
      dividendYield: 2.0,
      roe: 15.0,
    },
  },

  // Technology (ICT)
  // JAS, FORTH are key players
  // Source: SET ICT Index
  TECHNOLOGY: {
    name: 'Technology',
    peers: ['JAS', 'FORTH', 'SIS', 'SAUCE', 'SYNEX', 'IVL'],
    benchmark: {
      peRatio: 25.0,
      pbRatio: 3.0,
      dividendYield: 1.5,
      roe: 14.0,
    },
  },

  // Building Materials & Construction
  // Source: SET Construction Index
  BUILDING_MATERIALS: {
    name: 'Building Materials',
    peers: ['SSC', 'TPIPL', 'SUC', 'DRT', 'VGI', 'SGP', 'CIMBT'],
    benchmark: {
      peRatio: 10.5,
      pbRatio: 1.0,
      dividendYield: 4.0,
      roe: 10.0,
    },
  },

  // Transportation & Logistics
  // BTS, AOT are key players in transportation
  // RATCH is a utility play
  // Source: SET Services Index
  TRANSPORTATION: {
    name: 'Transportation',
    peers: ['BTS', 'AOT', 'RATCH', 'GI', 'WHA', 'KSS', 'NCL'],
    benchmark: {
      peRatio: 16.0,
      pbRatio: 1.3,
      dividendYield: 3.5,
      roe: 12.0,
    },
  },

  // Insurance
  // Source: SET Insurance Index
  INSURANCE: {
    name: 'Insurance',
    peers: ['THAI', 'VNT', 'SMK', 'FSSTB', 'MTI'],
    benchmark: {
      peRatio: 9.0,
      pbRatio: 1.0,
      dividendYield: 4.5,
      roe: 11.0,
    },
  },

  // Petrochemicals
  // PTTGC is major player
  // Source: PTT Research, Industry Reports
  PETROCHEMICALS: {
    name: 'Petrochemicals',
    peers: ['PTTGC', 'IRPC', 'GPC', 'TPIPL', 'RPC'],
    benchmark: {
      peRatio: 12.0,
      pbRatio: 1.2,
      dividendYield: 4.2,
      roe: 13.0,
    },
  },

  // Electricity & Utilities
  // GULF, BGRIM, RATCH are major IPPs
  // Source: SET Utilities Index
  UTILITIES: {
    name: 'Utilities',
    peers: ['GULF', 'BGRIM', 'RATCH', 'BPP', 'QH', 'EA'],
    benchmark: {
      peRatio: 16.5,
      pbRatio: 1.5,
      dividendYield: 3.8,
      roe: 13.5,
    },
  },
};

// Helper function to get sector group for a stock symbol
export function getSectorForSymbol(symbol: string): keyof typeof SECTOR_PEER_GROUPS | null {
  const upperSymbol = symbol.toUpperCase().replace('.BK', '');

  for (const [key, group] of Object.entries(SECTOR_PEER_GROUPS)) {
    if (group.peers.includes(upperSymbol)) {
      return key as keyof typeof SECTOR_PEER_GROUPS;
    }
  }

  return null;
}

// Helper function to get sector benchmark
export function getSectorBenchmark(symbol: string) {
  const sector = getSectorForSymbol(symbol);
  if (!sector) return null;
  return SECTOR_PEER_GROUPS[sector].benchmark || null;
}

// Helper function to get peer stocks for a symbol
export function getPeerStocks(symbol: string): string[] {
  const sector = getSectorForSymbol(symbol);
  if (!sector) return [];
  return SECTOR_PEER_GROUPS[sector].peers.filter(p => p !== symbol.toUpperCase().replace('.BK', ''));
}

// Helper function to get sector name
export function getSectorName(symbol: string): string | null {
  const sector = getSectorForSymbol(symbol);
  if (!sector) return null;
  return SECTOR_PEER_GROUPS[sector].name;
}

// All available sectors
export const ALL_SECTORS = Object.keys(SECTOR_PEER_GROUPS) as Array<keyof typeof SECTOR_PEER_GROUPS>;
