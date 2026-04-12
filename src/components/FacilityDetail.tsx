import { Facility } from "@/src/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Navigation, ExternalLink, CheckCircle2, Clock, User } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import CommentSection from "./CommentSection";

interface FacilityDetailProps {
  facility: Facility;
  onClose: () => void;
  userLocation: [number, number] | null;
  user: any;
  setAuthIsOpen: (open: boolean) => void;
}

export default function FacilityDetail({ facility, onClose, userLocation, user, setAuthIsOpen }: FacilityDetailProps) {
  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lng}`, "_blank");
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="relative shrink-0 p-6 pb-0">
        <ScrollArea className="w-full whitespace-nowrap rounded-[2.5rem] overflow-hidden soft-shadow-lg">
          <div className="flex w-max">
            {Array.isArray(facility.photos) && facility.photos.map((photo, idx) => (
              <div key={idx} className="relative h-72 w-[85vw] md:w-[450px]">
                <img
                  src={photo}
                  alt={`${facility.name} ${idx + 1}`}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-4 right-4 bg-black/30 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-md font-bold">
                  {idx + 1} / {facility.photos.length}
                </div>
              </div>
            ))}
            {(!Array.isArray(facility.photos) || facility.photos.length === 0) && (
              <div className="relative h-72 w-[85vw] md:w-[450px] bg-slate-100 flex items-center justify-center">
                <span className="text-slate-400 font-medium">No photos available</span>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="hidden"/>
        </ScrollArea>
        
        <Button 
          variant="secondary" 
          size="icon" 
          className="absolute top-10 right-10 rounded-full bg-white/90 backdrop-blur-md z-10 soft-shadow hover:bg-white transition-all"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </Button>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-8 space-y-8">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="space-y-4">
                <h2 className="text-2xl font-black tracking-tight text-slate-900">{facility.name}</h2>
                {(facility.contributor_name || facility.contributor_email) && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 bg-blue-500/5 px-3 py-1 rounded-full w-fit border border-primary/10 tracking-wider">
                    <CheckCircle2 className="w-3 h-3" />
                    Added by {facility.contributor_name || facility.contributor_email}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-3 py-1.5 rounded-2xl soft-shadow-sm">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-black text-lg leading-none">{facility.rating}</span>
                </div>
                {facility.ratingSource && (
                  <span className="text-[10px] text-muted-foreground mt-1">
                    Source: {facility.ratingSource}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>Medan City, North Sumatra</span>
              </div>
              {facility.opening_hours && (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full text-sm font-bold">
                  <Clock className="w-4 h-4" />
                  <span>{facility.opening_hours}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="capitalize px-4 py-1.5  rounded-full bg-slate-100 text-slate-600 hover:bg-slate-100 border-none font-bold text-xs">{facility.type}</Badge>
            <Badge variant="outline" className="px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/10 border-none font-black text-xs">{facility.price}</Badge>
            {typeof facility.distance === 'number' && (
              <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-100 border-none font-bold text-xs flex gap-2 items-center">
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

          <div className="space-y-4">
            <h3 className="font-black text-xl tracking-tight text-slate-900">About this place</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              {facility.description}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-black text-xl tracking-tight text-slate-900">Facilities</h3>
            <div className="grid grid-cols-2 gap-3">
              {Array.isArray(facility.facilities) ? facility.facilities.map((f) => (
                <div key={f} className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="capitalize">{f}</span>
                </div>
              )) : (
                <p className="text-sm text-slate-400">No facility information available</p>
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={openInGoogleMaps} className="w-full gap-3 h-14 text-lg font-black rounded-[1.5rem] soft-shadow-lg hover:scale-[1.02] transition-transform">
              <ExternalLink className="w-6 h-6" />
              Open in Google Maps
            </Button>
          </div>

          <div className="pt-4">
            <CommentSection facilityId={facility.id} user={user} setAuthIsOpen={setAuthIsOpen} />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
