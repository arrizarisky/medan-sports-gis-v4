import { SportType } from "@/src/types";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dumbbell, Trophy, Footprints, Flame, Target, Users, Filter, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterBarProps {
  selectedType: SportType;
  onTypeChange: (type: SportType) => void;
  maxPrice: string;
  onPriceChange: (price: string) => void;
  maxDistance: string;
  onDistanceChange: (distance: string) => void;
}

const sportTypes: { value: SportType; label: string; icon: any }[] = [
  { value: "all", label: "All Sports", icon: Trophy },
  { value: "gym", label: "Gym", icon: Dumbbell },
  { value: "badminton", label: "Badminton", icon: Trophy },
  { value: "futsal", label: "Futsal", icon: Users },
  { value: "padel", label: "Padel", icon: Target },
  { value: "jogging", label: "Jogging", icon: Footprints },
  { value: "mini soccer", label: "Mini Soccer", icon: Flame },
];

export default function FilterBar({ 
  selectedType, 
  onTypeChange,
  maxPrice,
  onPriceChange,
  maxDistance,
  onDistanceChange
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2 p-1">
          {sportTypes.map((sport) => {
            const Icon = sport.icon;
            const isActive = selectedType === sport.value;
            return (
              <Button
                key={sport.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`rounded-full gap-2 transition-all ${isActive ? 'scale-105 shadow-sm' : 'hover:bg-secondary'}`}
                onClick={() => onTypeChange(sport.value)}
              >
                <Icon className="w-4 h-4" />
                {sport.label}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="flex items-center gap-3 px-1">
        <div className="flex-1 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <Select value={maxPrice} onValueChange={onPriceChange}>
            <SelectTrigger className="h-8 text-xs rounded-full bg-secondary/30 border-none">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0">Free Only</SelectItem>
              <SelectItem value="50000">Under Rp 50k</SelectItem>
              <SelectItem value="100000">Under Rp 100k</SelectItem>
              <SelectItem value="200000">Under Rp 200k</SelectItem>
            </SelectContent>
          </Select>

          <Select value={maxDistance} onValueChange={onDistanceChange}>
            <SelectTrigger className="h-8 text-xs rounded-full bg-secondary/30 border-none">
              <SelectValue placeholder="Distance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Distance</SelectItem>
              <SelectItem value="1">Within 1 km</SelectItem>
              <SelectItem value="3">Within 3 km</SelectItem>
              <SelectItem value="5">Within 5 km</SelectItem>
              <SelectItem value="10">Within 10 km</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
