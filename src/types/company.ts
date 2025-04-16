import type { Tour } from "./offer";

export interface Company {
  id: number;
  name: string;
  description: string;
  email: string;
  phone: string;
  osm_id: null;
  website: string;
  address: string;
  location: Location;
  city_id: number;
  created_at: Date;
  updated_at: Date;
  latitude: number;
  longitude: number;
  pivot: Pivot;
  tours?: Tour[];
}

export enum Role {
  Guide = "guide",
  Manager = "manager",
}

export interface Pivot {
  user_id: number;
  company_id: number;
  role: Role;
}
