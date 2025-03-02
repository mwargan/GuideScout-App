import type { Pax } from "./offer";
import type { Company } from "./user";

export interface Tour {
  offer_id: number;
  cancelled: boolean | null;
  hourly_rate_eur_cents: number;
  starts_at: Date;
  tour: TourType;
  pax: Pax[];
  resources?: Resource[];
  company: Company;
}

export interface Resource {
  type: "camera" | "guide" | "van";
  name: string;
  location?: string | null;
  assignedTo: string | null;
}

export interface Pickup {
  location: Location | null;
  time: string | null;
  minutesAwayFromOffice: number | null;
}

export interface TourType {
  id: number;
  name: string;
  minutesDuration: number;
  prepMinutes: number;
  cleanupMinutes: number;
  locations: Location[] | null;
  url: string | null;
  hard_required_guide_attributes: Attribute[];
}

export enum LocationType {
  Point = "Point",
}

export interface Location {
  type: LocationType;
  name: string;
  startHere?: boolean;
  endHere?: boolean;
  coordinates?: {
    latitude: GeolocationCoordinates["latitude"];
    longitude: GeolocationCoordinates["longitude"];
  };
  latitude?: GeolocationCoordinates["latitude"];
  longitude?: GeolocationCoordinates["longitude"];
  created_at?: Date;
}

// Generated by https://quicktype.io

export interface Attribute {
  id: number;
  name: string;
  type: string;
  self_assignable: number;
  created_at: Date;
  updated_at: Date;
  pivot: Pivot;
}

export interface Pivot {
  company_tour_id: number;
  attribute_id: number;
}
