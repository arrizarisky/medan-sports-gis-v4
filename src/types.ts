export interface FacilityType {
  id: number;
  name: string;
  icon?: string;
}

export interface FacilityPhoto {
  id: string;
  facility_id: string;
  url: string;
  caption?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface FacilityAmenity {
  id: number;
  facility_id: string;
  amenity: string;
}

export interface OperatingHour {
  id: number;
  facility_id: string;
  day_of_week: number;
  open_time?: string;
  close_time?: string;
  is_closed: boolean;
}

export interface Facility {
  id: string;
  name: string;
  type_id?: number;
  type?: FacilityType;
  lat: number;
  lng: number;
  price: string;
  priceValue?: number;
  rating: number;
  ratingSource?: string;
  facilities?: FacilityAmenity[];
  description: string;
  photos?: FacilityPhoto[];
  distance?: number;
  user_id?: string;
  contributor_name?: string;
  contributor_email?: string;
  opening_hours?: OperatingHour[];
  opening_hours_text?: string;
  kecamatan_id?: number;
  created_at?: string;
}

export interface Comment {
  id: string;
  facility_id: string;
  user_id: string;
  user_email: string;
  content: string;
  rating: number;
  created_at: string;
}

export type SportType = string | "all";
