export interface MeterReading {
  id?: number;
  code: string;
  installationID: string;
  branchID: string;
  compteur: string;
  inxDep: string;
  meterValue: string | null;
  name: string;
  obs: string;
  usage: string;
  seq: string;
  readingDate: string | null;
  flagged: boolean;
}

export interface Bill {
  id?: number;
  code: string;
  branchID: string;
  installationID: string;
  name: string;
  billLBP: number;
  billUSD: number;
  paymentStatus: 'paid' | 'unpaid';
  paymentDate?: string | null;
}

export interface LogEntry {
  id?: number;
  action: string;
  details: string;
  timestamp: string;
}
