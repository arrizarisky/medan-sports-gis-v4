export interface Facility {
  id: string;
  name: string;
  type: "gym" | "futsal" | "badminton" | "padel" | "jogging" | "mini soccer";
  lat: number;
  lng: number;
  price: string;
  priceValue?: number;
  rating: number;
  ratingSource?: string;
  facilities: string[];
  description: string;
  photos: string[];
  distance?: number;
  user_id?: string;
  contributor_name?: string;
  contributor_email?: string;
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

export type SportType = Facility["type"] | "all";
