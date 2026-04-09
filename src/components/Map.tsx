import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import { Facility } from "@/src/types";
import { useEffect, useRef } from "react";
import { Star, Navigation } from "lucide-react";

// Fix for default marker icons in Leaflet
// @ts-ignore
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// @ts-ignore
import markerIcon from "leaflet/dist/images/marker-icon.png";
// @ts-ignore
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapProps {
  facilities: Facility[];
  userLocation: [number, number] | null;
  onSelectFacility: (facility: Facility) => void;
  selectedFacility: Facility | null;
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
          eventHandlers={{
            click: () => onSelectFacility(facility),
          }}
        >
          <Popup>
            <div className="w-48 p-0 overflow-hidden rounded-lg">
              {facility.photos && facility.photos[0] && (
                <img 
                  src={facility.photos[0]} 
                  alt={facility.name} 
                  className="w-full h-24 object-cover rounded-t-lg mb-2"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="p-2 pt-0">
                <h3 className="font-bold text-sm leading-tight mb-1">{facility.name}</h3>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded capitalize">{facility.type}</span>
                  <div className="flex items-center gap-0.5 text-yellow-500 text-[10px] font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    {facility.rating}
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-bold text-primary">{facility.price}</span>
                  {facility.distance !== undefined && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Navigation className="w-2 h-2 fill-current" />
                      {facility.distance.toFixed(1)} km
                    </span>
                  )}
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
