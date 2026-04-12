import { Facility } from "@/src/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Navigation, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";

interface FacilityCardProps {
  facility: Facility;
  onClick: () => void;
  isSelected?: boolean;
}

export default function FacilityCard({ facility, onClick, isSelected }: FacilityCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <Card className={`overflow-hidden transition-all duration-500 rounded-[2rem] border-none soft-shadow hover:soft-shadow-lg ${isSelected ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'}`}>
        <div className="relative h-45 w-full">
          {Array.isArray(facility.photos) && facility.photos.length > 0 ? (
            <img
              src={facility.photos[0]}
              alt={facility.name}
              className="h-full w-full p-3 object-cover rounded-t-2xl transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-full w-full bg-slate-100 flex items-center justify-center">
              <ImageIcon className="w-9 h-8 text-slate-300" />
            </div>
          )}
          <Badge className="absolute top-3 right-3 bg-white/95 text-primary hover:bg-white capitalize rounded-full px-3 py-1 text-[10px] font-bold soft-shadow border-none">
            {facility.type}
          </Badge>
          {Array.isArray(facility.photos) && facility.photos.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 font-medium">
              <ImageIcon className="w-3 h-3" />
              {facility.photos.length}
            </div>
          )}
        </div>
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-base text-slate-800 line-clamp-1">{facility.name}</h3>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[11px] font-bold">{facility.rating}</span>
              </div>
              {facility.ratingSource && (
                <span className="text-[9px] text-muted-foreground leading-none mt-0.5">
                  by {facility.ratingSource}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">Medan, Indonesia</span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-50">
            <span className={`text-sm font-black tracking-tight ${facility.priceValue === 0 ? 'text-emerald-500' : 'text-slate-900'}`}>
              {facility.priceValue === 0 ? 'FREE' : facility.price}
            </span>
            {typeof facility.distance === 'number' && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-100/80 px-3 py-1 rounded-full">
                <Navigation className="w-2.5 h-2.5" />
                <span>{facility.distance.toFixed(1)} km</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
