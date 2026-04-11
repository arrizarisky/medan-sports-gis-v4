import { Facility } from "@/src/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Navigation, ExternalLink, CheckCircle2, Clock } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import CommentSection from "./CommentSection";

interface FacilityDetailProps {
  facility: Facility;
  onClose: () => void;
  userLocation: [number, number] | null;
  user: any;
}

export default function FacilityDetail({ facility, onClose, userLocation, user }: FacilityDetailProps) {
  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lng}`, "_blank");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative shrink-0">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max">
            {Array.isArray(facility.photos) && facility.photos.map((photo, idx) => (
              <div key={idx} className="relative h-64 w-[85vw] md:w-[400px]">
                <img
                  src={photo}
                  alt={`${facility.name} ${idx + 1}`}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {idx + 1} / {facility.photos.length}
                </div>
              </div>
            ))}
            {(!Array.isArray(facility.photos) || facility.photos.length === 0) && (
              <div className="relative h-64 w-[85vw] md:w-[400px] bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No photos available</span>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute top-4 right-4 rounded-full bg-white/80 backdrop-blur-sm z-10"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6 space-y-6">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{facility.name}</h2>
                {(facility.contributor_name || facility.contributor_email) && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 bg-blue-500/5 px-2 py-0.5 rounded-full w-fit border border-primary/10">
                    <CheckCircle2 className="w-3 h-3" />
                    Added by {facility.contributor_name || facility.contributor_email}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{facility.rating}</span>
                </div>
                {facility.ratingSource && (
                  <span className="text-[10px] text-muted-foreground mt-1">
                    Source: {facility.ratingSource}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Medan City, North Sumatra</span>
            </div>
            {facility.opening_hours && (
              <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Clock className="w-4 h-4" />
                <span className="font-medium text-primary">{facility.opening_hours}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize px-3 py-1">{facility.type}</Badge>
            <Badge variant="outline" className="px-3 py-1 font-semibold text-primary">{facility.price}</Badge>
            {typeof facility.distance === 'number' && (
              <Badge variant="secondary" className="px-3 py-1 flex gap-1 items-center">
                <Navigation className="w-3 h-3" />
                {facility.distance.toFixed(1)} km away
              </Badge>
            )}
            {userLocation && (
              <Badge variant="default" className="px-3 py-1 flex gap-1 items-center bg-blue-500 hover:bg-blue-600">
                <Navigation className="w-3 h-3 fill-current" />
                Route Active on Map
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-lg">About this place</h3>
            <p className="text-muted-foreground leading-relaxed">
              {facility.description}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-lg">Facilities</h3>
            <div className="grid grid-cols-2 gap-3">
              {Array.isArray(facility.facilities) ? facility.facilities.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="capitalize">{f}</span>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No facility information available</p>
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={openInGoogleMaps} className="w-full gap-2 h-12 text-lg">
              <ExternalLink className="w-5 h-5" />
              Open in Google Maps
            </Button>
          </div>

          <CommentSection facilityId={facility.id} user={user} />
        </div>
      </ScrollArea>
    </div>
  );
}
