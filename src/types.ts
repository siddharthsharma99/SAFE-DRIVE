export type Severity = 'Low' | 'Moderate' | 'Critical';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Accident {
  id?: string;
  userId: string;
  severity: Severity;
  location: Location;
  speed: number;
  acceleration: number[];
  timestamp: string;
}

export interface Contact {
  id?: string;
  name: string;
  phone: string;
  relation: string;
  userId: string;
  createdAt: string;
}

export interface Alert {
  id?: string;
  userId: string;
  accidentId: string;
  message: string;
  sentTo: string[];
  timestamp: string;
}

export interface DashboardStats {
  totalAccidents: number;
  criticalEvents: number;
  moderateEvents: number;
  lowEvents: number;
  alertsSent: number;
}
