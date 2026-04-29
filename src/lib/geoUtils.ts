import proj4 from "proj4";

// Define coordinate systems for proj4
const utm48s = '+proj=utm +zone=48 +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs';
const wgs84 = '+proj=longlat +datum=WGS84 +no_defs';

// Function to convert UTM coordinates to WGS84
function convertCoordinates(coords: any[]): any[] {
  if (!coords || coords.length === 0) return coords;
  
  // Check if this is a coordinate pair [x, y] or [x, y, z]
  if (typeof coords[0] === 'number') {
    const [x, y, z] = coords;
    const [lon, lat] = proj4(utm48s, wgs84, [x, y]);
    return z !== undefined ? [lon, lat, z] : [lon, lat];
  }
  
  // Recursively convert nested arrays
  return coords.map((coord: any) => convertCoordinates(coord));
}

// Function to convert entire GeoJSON feature
function convertFeature(feature: any): any {
  const converted = { ...feature };
  if (converted.geometry && converted.geometry.coordinates) {
    converted.geometry = {
      ...converted.geometry,
      coordinates: convertCoordinates(converted.geometry.coordinates)
    };
  }
  return converted;
}

// Point-in-polygon algorithm (Ray casting)
function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    
    const intersect = ((yi > point[1]) !== (yj > point[1])) &&
      (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Check if point is in any polygon of a MultiPolygon
function isPointInMultiPolygon(point: [number, number], multiPolygon: [number, number][][][]): boolean {
  for (const polygon of multiPolygon) {
    for (const ring of polygon) {
      if (isPointInPolygon(point, ring)) {
        return true;
      }
    }
  }
  return false;
}

// Find kecamatan name from coordinates using GeoJSON
export async function findKecamatanFromCoordinates(
  lat: number, 
  lng: number
): Promise<string | null> {
  try {
    const response = await fetch("/BATAS%20MEDAN.geojson");
    const data = await response.json();
    
    // Convert all features to WGS84
    const convertedData = {
      ...data,
      features: data.features.map(convertFeature)
    };
    
    const point: [number, number] = [lng, lat];
    
    for (const feature of convertedData.features) {
      if (feature.geometry.type === "MultiPolygon") {
        if (isPointInMultiPolygon(point, feature.geometry.coordinates)) {
          return feature.properties?.NAMOBJ || null;
        }
      } else if (feature.geometry.type === "Polygon") {
        for (const ring of feature.geometry.coordinates) {
          if (isPointInPolygon(point, ring)) {
            return feature.properties?.NAMOBJ || null;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error finding kecamatan:", error);
    return null;
  }
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
