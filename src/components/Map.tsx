import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { Facility } from "@/src/types";
import { useEffect, useRef } from "react";
import { Star, Navigation, Info} from "lucide-react";

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
}

function MapEvents({ onMapClick }: { onMapClick: () => void }) {
  useMap().on("click", (e) => {
    // Check if the click target is the map container itself (not a marker or other control)
    // @ts-ignore
    if (e.originalEvent.target.classList.contains("leaflet-container")) {
      onMapClick();
    }
  });
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

export default function Map({ facilities, userLocation, onSelectFacility, selectedFacility }: MapProps) {
  const defaultCenter: [number, number] = [3.5952, 98.6722]; // Medan Center
  const center = userLocation || defaultCenter;

  return (
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

      <MapEvents onMapClick={() => onSelectFacility(null)} />
      
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
          icon={getLeafletIcon(facility.type)}
          eventHandlers={{
            click: () => onSelectFacility(facility, false),
          }}
        >
          <Popup>
            <div className="w-52 p-0 overflow-hidden rounded-lg">
              {facility.photos && facility.photos[0] && (
                <img 
                  src={facility.photos[0]} 
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
                  <span className="capitalize">{facility.type}</span>
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
  );
}
