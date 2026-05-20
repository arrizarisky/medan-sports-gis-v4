import { useState, useEffect } from "react";
import { SportType, FacilityType } from "@/src/types";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Trophy, Dumbbell, Users, Target, Footprints, Flame, Filter, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/src/lib/supabase";

interface FilterBarProps {
  selectedType: SportType;
  onTypeChange: (type: SportType) => void;
  maxPrice: string;
  onPriceChange: (price: string) => void;
  maxDistance: string;
  onDistanceChange: (distance: string) => void;
  selectedKecamatan: string;
  onKecamatanChange: (kecamatan: string) => void;
  kecamatanList: { id: number; name: string }[];
}

// Default icons for common sport types
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  gym: Dumbbell,
  badminton: Trophy,
  futsal: Users,
  padel: Target,
  jogging: Footprints,
  "mini soccer": Flame,
};

export default function FilterBar({ 
  selectedType, 
  onTypeChange,
  maxPrice,
  onPriceChange,
  maxDistance,
  onDistanceChange,
  selectedKecamatan,
  onKecamatanChange,
  kecamatanList
}: FilterBarProps) {
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>([]);

  useEffect(() => {
    const fetchFacilityTypes = async () => {
      const { data, error } = await supabase
        .from('facility_types')
        .select('*')
        .order('name');
      
      if (!error && data) {
        setFacilityTypes(data);
      }
    };
    fetchFacilityTypes();
  }, []);

  // Build sport types from database
  const sportTypes = [
    { value: "all" as SportType, label: "All Sports", icon: Trophy },
    ...facilityTypes.map(type => ({
      value: type.name as SportType,
      label: type.name.charAt(0).toUpperCase() + type.name.slice(1),
      icon: iconMap[type.name] || Trophy
    }))
  ];

  return (
    <div className="space-y-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-3 p-1">
          {sportTypes.map((sport) => {
            const Icon = sport.icon;
            const isActive = selectedType === sport.value;
            return (
              <Button
                key={sport.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`rounded-2xl h-11 px-6 gap-2.5 transition-all font-bold border-slate-100 ${isActive ? 'scale-105 soft-shadow-lg' : 'hover:bg-slate-50 text-slate-500'}`}
                onClick={() => onTypeChange(sport.value)}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {sport.label}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="hidden"/>
      </ScrollArea>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center gap-4 px-1">
          <div className="flex items-center gap-2 bg-slate-100/50 px-4 py-2 rounded-2xl border border-slate-50">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filters</span>
          </div>
          <Select value={maxPrice} onValueChange={onPriceChange}>
            <SelectTrigger className="h-15 text-xs rounded-2xl bg-white border-slate-100 soft-shadow font-bold text-slate-600 w-[100px]">
              <SelectValue placeholder="Price Range" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none soft-shadow-lg">
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0">Free Only</SelectItem>
              <SelectItem value="50000">Under Rp 50k</SelectItem>
              <SelectItem value="100000">Under Rp 100k</SelectItem>
              <SelectItem value="200000">Under Rp 200k</SelectItem>
            </SelectContent>
          </Select>

          <Select value={maxDistance} onValueChange={onDistanceChange}>
            <SelectTrigger className="h-15 text-xs rounded-2xl bg-white border-slate-100 soft-shadow font-bold text-slate-600 w-[100px]">
              <SelectValue placeholder="Distance" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none soft-shadow-lg">
              <SelectItem value="all">Any Distance</SelectItem>
              <SelectItem value="1">Within 1 km</SelectItem>
              <SelectItem value="3">Within 3 km</SelectItem>
              <SelectItem value="5">Within 5 km</SelectItem>
              <SelectItem value="10">Within 10 km</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedKecamatan} onValueChange={onKecamatanChange}>
            <SelectTrigger className="h-15 text-xs rounded-2xl bg-white border-slate-100 soft-shadow font-bold text-slate-600 w-[140px]">
              <SelectValue placeholder="Kecamatan" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none soft-shadow-lg max-h-[300px]">
              <SelectItem value="all">All Kecamatan</SelectItem>
              {kecamatanList.map((kec) => (
                <SelectItem key={kec.id} value={kec.id.toString()}>
                  {kec.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
