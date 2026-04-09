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
}

export type SportType = Facility["type"] | "all";
