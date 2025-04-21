import type { Company } from "./company";
import type { Attribute, Location } from "./tour";

export interface User {
  id?: number;
  username: string;
  name: string | null;
  surname: string | null;
  email: string;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  avatar: string | null;
  seen_at: Date;
  created_at: Date;
  updated_at: Date;
  description: string | null;
  is_public: boolean;
  stripe_id: string | null;
  pm_type: string | null;
  pm_last_four: string | null;
  trial_ends_at: string | null;
  personal_access_tokens?: PersonalAccessToken[];
  phone: string | null;
  phone_country_code: string;
  earnings?: number;
  potential_earnings_from_referrals?: number;
  referral_code: string | null;
  guide_profile?: GuideProfile;
  model_attributes_pivot?: UserAttribute[];
  companies?: Company[];
  gravatar: string;
  latitude: number | null;
  longitude: number | null;
  latest_location: Location | null;
  latest_cv_status: "pending" | "accepted" | "rejected" | null;
  credentials: Credential[];
}

export interface Credential {
  id: number;
  user_id: number;
  external_user_id: string;
  provider: string;
  scopes: string | null;
  meta: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface GuideProfile {
  user_id: number;
  city_id: number;
  description: null;
  created_at: Date;
  updated_at: Date;
  verified_at: null;
  city: City;
}

export interface City {
  id: number;
  name: string;
  country_code: string;
}

export interface PersonalAccessToken {
  id: string;
  user_id: number;
  client_id: number;
  name: string | null;
  scopes: string[];
  revoked: boolean;
  created_at: Date;
  updated_at: Date;
  expires_at: Date;
  client?: Client;
}

export interface Client {
  id: number;
  user_id: null;
  name: string;
  provider: null;
  redirect: string;
  personal_access_client: boolean;
  password_client: boolean;
  revoked: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserAttribute {
  user_id: number;
  attribute_id: number;
  created_at: Date;
  updated_at: Date;
  attribute: Attribute;
}
