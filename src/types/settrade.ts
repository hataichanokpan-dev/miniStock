/**
 * SETTRADE Data Types from Firebase Realtime Database
 * Data structure from /settrade path
 */

// Individual sector data
export interface IndustrySectorRow {
  chg: number;
  chgPct: number;
  last: number;
  name: string;
  valMn: number;
  volK: number;
}

// Metadata for captured data
export interface SettradeMeta {
  capturedAt: string;
  schemaVersion: number;
  source: string;
}

// Industry sector by date entry
export interface IndustrySectorByDate {
  meta: SettradeMeta;
  rows: Record<string, IndustrySectorRow>;
}

// Index entry for date reference
export interface SettradeDateIndex {
  date: string;
  dateKey: number;
  refPath: string;
}

// Latest info
export interface SettradeLatest {
  date: string;
  dateKey: number;
  refPath: string;
  schemaVersion: number;
}

// Industry sector collection
export interface IndustrySector {
  byDate: Record<string, IndustrySectorByDate>;
  indexByDate: Record<string, SettradeDateIndex>;
  latest: SettradeLatest;
}

// Investor type row data
export interface InvestorTypeRow {
  buyPct: number;
  buyValue: number;
  name: string;
  netValue: number;
  sellPct: number;
  sellValue: number;
}

// Investor type by date entry
export interface InvestorTypeByDate {
  meta: SettradeMeta;
  rows: {
    FOREIGN: InvestorTypeRow;
    LOCAL_INDIVIDUAL: InvestorTypeRow;
    LOCAL_INST: InvestorTypeRow;
    PROPRIETARY: InvestorTypeRow;
  };
}

// Investor type collection
export interface InvestorType {
  byDate: Record<string, InvestorTypeByDate>;
  indexByDate: Record<string, SettradeDateIndex>;
  latest: SettradeLatest;
}

// Root SETTRADE data structure
export interface SettradeData {
  industrySector: IndustrySector;
  investorType: InvestorType;
}

// Helper types for API responses
export interface IndustrySectorResponse {
  date: string;
  capturedAt: string;
  sectors: Array<{
    id: string;
    name: string;
    last: number;
    chg: number;
    chgPct: number;
    volK: number;
    valMn: number;
  }>;
}

export interface InvestorTypeResponse {
  date: string;
  capturedAt: string;
  investors: Array<{
    id: string;
    name: string;
    buyValue: number;
    sellValue: number;
    netValue: number;
    buyPct: number;
    sellPct: number;
  }>;
}
