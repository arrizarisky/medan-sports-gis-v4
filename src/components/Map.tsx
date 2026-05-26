import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { Facility } from "@/src/types";
import { useEffect, useRef, useState, useMemo } from "react";
import { Star, Navigation, Info, Layers, X } from "lucide-react";
import proj4 from "proj4";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { findKecamatanInFeatures } from "@/src/lib/geoUtils";

// @ts-ignore
import pinBadminton from "../assets/icon/pin-badminton.png";
// @ts-ignore
import pinFutsal from "../assets/icon/pin-futsal.png";
// @ts-ignore
import pinRunning from "../assets/icon/pin-running.png";
// @ts-ignore
import pinGym from "../assets/icon/pin-gym.png";
// @ts-ignore
import pinDefault from "../assets/icon/pin-default.png";

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

// 1. Definisikan mapping path gambarnya saja
const categoryIcons: Record<string, string> = {
  futsal: pinFutsal,
  "mini soccer": pinFutsal,
  badminton: pinBadminton,
  padel: pinBadminton,
  gym: pinGym,
  jogging: pinRunning,
  default: pinDefault, // Berikan default jika tipe tidak ditemukan
};

// 2. Buat fungsi untuk menghasilkan L.icon (Leaflet Icon)
const getLeafletIcon = (type: string) => {
  const iconUrl = categoryIcons[type.toLowerCase()] || categoryIcons.default;
  
  return L.icon({
    iconUrl: iconUrl,
    iconSize: [40, 60],
    iconAnchor: [20, 40], // Titik tengah bawah
    popupAnchor: [0, -20],
  });
};



// // Fix for default marker icons in Leaflet
// // @ts-ignore
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// // @ts-ignore
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// // @ts-ignore
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

// // @ts-ignore
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconUrl: markerIcon,
//   iconRetinaUrl: markerIcon2x,
//   shadowUrl: markerShadow,
// });

interface MapProps {
  facilities: Facility[];
  userLocation: [number, number] | null;
  onSelectFacility: (facility: Facility  | null, openDetail?: boolean) => void;
  selectedFacility: Facility | null;
  selectedKecamatanName?: string | null;
  onSelectKecamatan?: (name: string | null) => void;
}

function MapEvents({ onMapClick, boundaryData, onKecamatanSelect, selectedKecamatan }: { 
  onMapClick: () => void; 
  boundaryData: any;
  onKecamatanSelect: (kecamatan: string | null) => void;
  selectedKecamatan: string | null;
}) {
  const map = useMap();
  useEffect(() => {
    const handleClick = (e: any) => {
      onMapClick();
      
      if (boundaryData && boundaryData.features) {
        const clickedKecamatan = findKecamatanInFeatures(e.latlng.lat, e.latlng.lng, boundaryData.features);
        if (clickedKecamatan) {
          onKecamatanSelect(clickedKecamatan);
        } else {
          onKecamatanSelect(null);
        }
      } else {
        onKecamatanSelect(null);
      }
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onMapClick, boundaryData, onKecamatanSelect]);
  return null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

function RoutingControl({ userLocation, destination }: { 
  userLocation: [number, number], 
  destination: [number, number]
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !userLocation || !destination) return;

    // @ts-ignore
    const control = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(destination[0], destination[1])
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      // @ts-ignore
      lineOptions: {
        styles: [{ color: "#3b82f6", weight: 6, opacity: 0.8 }]
      },
      createMarker: () => null
    }).addTo(map);

    // Patch to prevent async routing callbacks from crashing after unmount
    // @ts-ignore
    if (control._clearLines) {
      // @ts-ignore
      const originalClearLines = control._clearLines;
      // @ts-ignore
      control._clearLines = function (...args: any[]) {
        // @ts-ignore
        if (this._map) {
          // @ts-ignore
          originalClearLines.apply(this, args);
        }
      };
    }

    // @ts-ignore
    const originalOnRouteDone = control._routeDone || control._onRouteDone;
    // @ts-ignore
    const routeDoneKey = control._routeDone ? '_routeDone' : (control._onRouteDone ? '_onRouteDone' : null);
    if (routeDoneKey && originalOnRouteDone) {
      // @ts-ignore
      control[routeDoneKey] = function (...args: any[]) {
        // @ts-ignore
        if (this._map) {
          // @ts-ignore
          originalOnRouteDone.apply(this, args);
        }
      };
    }

    return () => {
      if (map && control) {
        try {
          // Standard Leaflet control removal
          map.removeControl(control);
        } catch (e) {
          // Silently catch Leaflet internal errors that often happen during rapid unmounting
          // specifically the "Cannot read properties of null (reading 'removeLayer')" error
        }
      }
    };
  }, [map, userLocation, destination]);

  return null;
}

export default function Map({ facilities, userLocation, onSelectFacility, selectedFacility, selectedKecamatanName, onSelectKecamatan }: MapProps) {
  const defaultCenter: [number, number] = [3.5952, 98.6722]; // Medan Center
  const center = userLocation || defaultCenter;
  const [boundaryData, setBoundaryData] = useState<any>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [internalSelectedKecamatan, setInternalSelectedKecamatan] = useState<string | null>(null);

  const selectedKecamatan = selectedKecamatanName !== undefined ? selectedKecamatanName : internalSelectedKecamatan;

  const handleKecamatanSelect = (name: string | null) => {
    if (onSelectKecamatan) {
      onSelectKecamatan(name);
    } else {
      setInternalSelectedKecamatan(name);
    }
  };

  // Load and convert GeoJSON boundary
  useEffect(() => {
    console.log("Loading GeoJSON...");
    fetch("/BATAS%20MEDAN.geojson")
      .then((res) => {
        console.log("Response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("GeoJSON loaded, features:", data.features?.length);
        const converted = {
          ...data,
          features: data.features.map(convertFeature)
        };
        console.log("Converted first feature coords:", converted.features[0]?.geometry?.coordinates?.[0]?.[0]?.[0]);
        setBoundaryData(converted);
      })
      .catch((err) => console.error("Error loading boundary:", err));
  }, []);

  // Color palette for kecamatan
  const kecamatanColors = [
    "#ef4444", // red
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#f43f5e", // rose
    "#84cc16", // lime
    "#14b8a6", // teal
    "#6366f1", // indigo
    "#a855f7", // purple
    "#d946ef", // fuchsia
    "#f59e0b", // amber
    "#10b981", // emerald
    "#0ea5e9", // sky
    "#64748b", // slate
    "#78716c", // stone
    "#71717a", // zinc
  ];

  // Function to get color based on kecamatan name
  const getKecamatanColor = (feature: any) => {
    const kecamatanName = feature.properties?.NAMOBJ || "Unknown";
    // Use a simple hash to consistently assign colors
    let hash = 0;
    for (let i = 0; i < kecamatanName.length; i++) {
      hash = kecamatanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % kecamatanColors.length;
    return kecamatanColors[colorIndex];
  };

  // Extract and sort unique kecamatan list from boundaryData
  const kecamatanListFromGeoJSON = useMemo(() => {
    if (!boundaryData || !boundaryData.features) return [];
    
    const uniqueKecamatans: Record<string, string> = {};
    boundaryData.features.forEach((feature: any) => {
      const name = feature.properties?.NAMOBJ;
      if (name) {
        uniqueKecamatans[name] = getKecamatanColor(feature);
      }
    });

    return Object.entries(uniqueKecamatans)
      .map(([name, color]) => ({ name, color }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [boundaryData]);

  // Style function for the active boundary
  const activeBoundaryStyle = (feature: any) => ({
    color: "#3b82f6", // bold border color
    weight: 3,
    opacity: 1,
    fillOpacity: 0.2, // transparent fill
    fillColor: getKecamatanColor(feature)
  });

  const selectedFeature = selectedKecamatan 
    ? boundaryData?.features?.find(
        (f: any) => f.properties?.NAMOBJ?.replace(/\s+/g, '').toUpperCase() === selectedKecamatan.replace(/\s+/g, '').toUpperCase()
      )
    : null;

  // Custom component to handle flyTo for the selected polygon
  const PolygonFitter = ({ feature }: { feature: any }) => {
    const map = useMap();
    useEffect(() => {
      if (feature) {
        // Create a temporary geojson layer just to get bounds
        const layer = L.geoJSON(feature);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
        }
      }
    }, [feature, map]);
    return null;
  };

  const onEachFeature = (feature: any, layer: any) => {
    const name = feature.properties?.NAMOBJ || "Unknown";
    
    // Bind permanent tooltip showing the sub-district name
    layer.bindTooltip(name, {
      permanent: true,
      direction: "center",
      className: "kecamatan-tooltip",
    });

    layer.on({
      click: (e: any) => {
        // Prevent click from bubbling to the map so we don't accidentally deselect
        L.DomEvent.stopPropagation(e);
        handleKecamatanSelect(name);
      }
    });
  };

  return (
    <>
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {boundaryData && (
        <GeoJSON
          key={selectedKecamatan || "all"}
          data={boundaryData}
          style={(feature: any) => {
            const isSelected = selectedKecamatan && 
              feature.properties?.NAMOBJ?.replace(/\s+/g, '').toUpperCase() === selectedKecamatan.replace(/\s+/g, '').toUpperCase();
            
            return {
              color: isSelected ? "#3b82f6" : "#94a3b8", // bold blue border if selected, slate-400 border otherwise
              weight: isSelected ? 3 : 1.5,
              opacity: isSelected ? 1 : 0.4,
              fillOpacity: isSelected ? 0.35 : 0.1,
              fillColor: getKecamatanColor(feature)
            };
          }}
          onEachFeature={onEachFeature}
        />
      )}
      {selectedFeature && <PolygonFitter feature={selectedFeature} />}

      <MapEvents 
        onMapClick={() => {
          onSelectFacility(null);
        }} 
        boundaryData={boundaryData}
        onKecamatanSelect={handleKecamatanSelect}
        selectedKecamatan={selectedKecamatan}
      />
      
      {userLocation && (
        <Marker 
          position={userLocation}
          icon={L.divIcon({
            className: "user-location-marker",
            html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
            iconSize: [16, 16]
          })}
        >
          <Popup>You are here</Popup>
        </Marker>
      )}

      {facilities.map((facility) => (
        <Marker
          key={facility.id}
          position={[facility.lat, facility.lng]}
          icon={getLeafletIcon(facility.type?.name || '')}
          eventHandlers={{
            click: () => onSelectFacility(facility, false),
          }}
        >
          <Popup>
            <div className="w-52 p-0 overflow-hidden rounded-lg">
              {facility.photos && facility.photos.length > 0 && (
                <img 
                  src={facility.photos.find(p => p.is_primary)?.url || facility.photos[0]?.url} 
                  alt={facility.name} 
                  className="w-full h-24 object-cover rounded-t-lg mb-2"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="p-2 pt-0">
                <h3 className="font-bold text-sm leading-tight mb-2">{facility.name}</h3>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button 
                    onClick={() => onSelectFacility(facility, true)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group"
                  >
                    <Info className="w-4 h-4 text-primary group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] font-black text-primary uppercase">Details</span>
                  </button>
                  <button 
                    onClick={() => onSelectFacility(facility, false)}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 transition-colors group"
                  >
                    <Navigation className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform mb-1" />
                    <span className="text-[10px] font-black text-blue-500 uppercase">Route</span>
                  </button>
                </div>

                <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold border-t border-slate-100 pt-2">
                  <span className="capitalize">{facility.type?.name || 'Unknown'}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    {facility.rating}
                  </div>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {userLocation && selectedFacility && (
        <RoutingControl 
          userLocation={userLocation} 
          destination={[selectedFacility.lat, selectedFacility.lng]} 
        />
      )}

      {selectedFacility && (
        <ChangeView center={[selectedFacility.lat, selectedFacility.lng]} />
      )}
    </MapContainer>

      {/* Legend Toggle Button */}
      <Button
        variant="default"
        size="icon"
        className="absolute top-4 right-4 z-[1000] rounded-full shadow-lg bg-white text-slate-700 hover:bg-slate-50 w-9 h-9 md:w-10 md:h-10"
        onClick={() => setShowLegend(!showLegend)}
        title="Toggle Legend"
      >
        {showLegend ? <X className="w-4 h-4 md:w-5 md:h-5" /> : <Layers className="w-4 h-4 md:w-5 md:h-5" />}
      </Button>

      {/* Legend Card */}
      {showLegend && (
        <Card className="absolute top-14 right-4 left-4 md:left-auto md:top-16 md:right-4 md:w-64 z-[999] p-3 md:p-4 bg-white/95 backdrop-blur-sm shadow-xl max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <Layers className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <h3 className="font-bold text-xs md:text-sm">Legend</h3>
          </div>

          {/* Icon Pins Section */}
          <div className="mb-3 md:mb-4">
            <h4 className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 md:mb-2">Facility Types</h4>
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center gap-1 md:gap-2">
                <img src={pinFutsal} alt="Futsal" className="w-4 h-6 md:w-6 md:h-9 object-contain" />
                <span className="text-[10px] md:text-xs font-medium">Futsal</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <img src={pinBadminton} alt="Badminton" className="w-4 h-6 md:w-6 md:h-9 object-contain" />
                <span className="text-[10px] md:text-xs font-medium">Badminton</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <img src={pinGym} alt="Gym" className="w-4 h-6 md:w-6 md:h-9 object-contain" />
                <span className="text-[10px] md:text-xs font-medium">Gym</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <img src={pinRunning} alt="Running" className="w-4 h-6 md:w-6 md:h-9 object-contain" />
                <span className="text-[10px] md:text-xs font-medium">Running</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <img src={pinDefault} alt="Other" className="w-4 h-6 md:w-6 md:h-9 object-contain" />
                <span className="text-[10px] md:text-xs font-medium">Other</span>
              </div>
            </div>
          </div>

          {/* Kecamatan Colors Section */}
          <div className="mt-3 border-t border-slate-100 dark:border-slate-800 pt-3">
            <h4 className="text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Kecamatan Areas</h4>
            {kecamatanListFromGeoJSON.length === 0 ? (
              <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed">
                Loading kecamatan boundaries...
              </p>
            ) : (
              <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                {kecamatanListFromGeoJSON.map((kec, index) => {
                  const isSelected = selectedKecamatan && 
                    kec.name.replace(/\s+/g, '').toUpperCase() === selectedKecamatan.replace(/\s+/g, '').toUpperCase();
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleKecamatanSelect(isSelected ? null : kec.name)}
                      className={`flex items-center gap-2 w-full text-left p-1 rounded transition-colors group ${
                        isSelected 
                          ? "bg-primary/10 text-primary font-bold dark:bg-primary/20 dark:text-primary-foreground" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-sm border border-slate-200 dark:border-slate-700 flex-shrink-0 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: kec.color }}
                      />
                      <span className="text-[10px] md:text-xs truncate font-medium">
                        {kec.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
