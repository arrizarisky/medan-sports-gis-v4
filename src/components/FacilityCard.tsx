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
      <Card className={`overflow-hidden transition-all duration-300 ${isSelected ? 'ring-2 ring-primary border-primary' : 'hover:shadow-md'}`}>
        <div className="relative h-32 w-full">
          {Array.isArray(facility.photos) && facility.photos.length > 0 ? (
            <img
              src={facility.photos[0]}
              alt={facility.name}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
            </div>
          )}
          <Badge className="absolute top-2 right-2 bg-white/90 text-primary hover:bg-white capitalize">
            {facility.type}
          </Badge>
          {Array.isArray(facility.photos) && facility.photos.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              {facility.photos.length}
            </div>
          )}
        </div>
        <CardContent className="p-3">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-sm line-clamp-1">{facility.name}</h3>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-medium">{facility.rating}</span>
              </div>
              {facility.ratingSource && (
                <span className="text-[9px] text-muted-foreground leading-none mt-0.5">
                  by {facility.ratingSource}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2">
            <MapPin className="w-3 h-3" />
            <span className="line-clamp-1">Medan, Indonesia</span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs font-bold ${facility.priceValue === 0 ? 'text-green-600' : 'text-primary'}`}>
              {facility.priceValue === 0 ? 'FREE' : facility.price}
            </span>
            {typeof facility.distance === 'number' && (
              <div className="flex items-center gap-1 text-[10px] bg-secondary px-2 py-0.5 rounded-full">
                <Navigation className="w-2 h-2" />
                <span>{facility.distance.toFixed(1)} km</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
