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
  selectedKecamatan: string;
  onKecamatanChange: (kecamatan: string) => void;
  kecamatanList: { id: number; name: string }[];
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
  onDistanceChange,
  selectedKecamatan,
  onKecamatanChange,
  kecamatanList
}: FilterBarProps) {
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

      <div className="flex items-center gap-4 px-1">
        <div className="flex-1 flex items-center gap-3">
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
      </div>
    </div>
  );
}
