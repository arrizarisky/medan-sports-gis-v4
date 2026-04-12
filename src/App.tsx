import { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "sonner";
import { supabase } from "./lib/supabase";
import { Facility, SportType } from "./types";
import Map from "./components/Map";
import FacilityCard from "./components/FacilityCard";
import FilterBar from "./components/FilterBar";
import FacilityDetail from "./components/FacilityDetail";
import AddFacilityForm from "./components/AddFacilityForm";
import Auth from "./components/Auth";
import { calculateDistance } from "./lib/geoUtils";
import { 
  Search, 
  Map as MapIcon, 
  List as ListIcon, 
  Plus, 
  Navigation,
  Loader2,
  Info,
  User,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "motion/react";

// @ts-ignore
import logoPng from "./assets/logos/logo.png";

export default function App() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedType, setSelectedType] = useState<SportType>("all");
  const [maxPrice, setMaxPrice] = useState("all");
  const [maxDistance, setMaxDistance] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchFacilities();
    detectLocation();

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

     return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
        // Inactivity Timeout Logic (15 minutes)
    let inactivityTimer: NodeJS.Timeout;
    const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (user) {
          supabase.auth.signOut();
          toast.info("Session expired due to inactivity", {
            description: "Please log in again to continue."
          });
        }
      }, INACTIVITY_LIMIT);
    };

    // Events to track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    if (user) {
      activityEvents.forEach(event => {
        window.addEventListener(event, resetTimer);
      });
      resetTimer();
    }

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  const fetchFacilities = async () => {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*');
      
      if (error) throw error;
      
      if (Array.isArray(data)) {
        setFacilities(data as Facility[]);
      } else {
        setFacilities([]);
      }
    } catch (error) {
      console.error("Error fetching facilities:", error);
      toast.error("Failed to load facilities from Supabase");
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error detecting location:", error);
        }
      );
    }
  };

  const processedFacilities = useMemo<Facility[]>(() => {
    if (!Array.isArray(facilities)) return [];
    let filtered = [...facilities];

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(f => f.type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by price
    if (maxPrice !== "all") {
      const priceLimit = Number(maxPrice);
      filtered = filtered.filter(f => {
        let pValue: number;
        if (f.priceValue !== undefined && f.priceValue !== null) {
          pValue = Number(f.priceValue);
        } else if (f.price?.toLowerCase().includes("free")) {
          pValue = 0;
        } else {
          // If no price info, exclude from filtered results unless "all" is selected
          return false;
        }
        return pValue <= priceLimit;
      });
    }

    // Calculate distances
    const withDistance: Facility[] = filtered.map(f => ({
      ...f,
      distance: userLocation 
        ? calculateDistance(userLocation[0], userLocation[1], f.lat, f.lng)
        : undefined
    }));

    // Filter by distance
    let finalFiltered = withDistance;
    if (maxDistance !== "all" && userLocation) {
      const distLimit = parseInt(maxDistance);
      finalFiltered = finalFiltered.filter(f => (f.distance || 0) <= distLimit);
    }

    if (userLocation) {
      return finalFiltered.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return finalFiltered;
  }, [facilities, selectedType, searchQuery, userLocation, maxPrice, maxDistance]);

  const handleAddSuccess = (newFacility: Facility) => {
    console.log("New facility added:", newFacility);
    setFacilities(prev => {
      const updated = [...prev, newFacility];
      console.log("Updated facilities list length:", updated.length);
      return updated;
    });
    // Reset filters to ensure the new facility is visible
    setSelectedType("all");
    setSearchQuery("");
    setMaxPrice("all");
    setMaxDistance("all");
    setIsAddFormOpen(false);
    setSelectedFacility(newFacility);
    // On mobile, switch to list view to show the new item
    if (window.innerWidth < 768) setViewMode("list");
    
    toast.success("Facility added successfully!", {
      description: `${newFacility.name} is now available on the map.`,
    });
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Sebentar kami siapkan tempat olahrga terbaik untuk anda...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <header className="p-4 border-b bg-white/80 backdrop-blur-md z-10 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <img 
                src={logoPng} 
                alt="Medan Sports Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Medan Sports Area</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Sport Facility Finder</p>
            </div>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search facilities..." 
                className="pl-12 h-12 bg-slate-100/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm font-medium"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-xs font-bold leading-none">{user.email.split('@')[0]}</span>
                  <span className="text-[10px] text-muted-foreground">Contributor</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full"
                  onClick={() => supabase.auth.signOut()}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-2xl h-11 px-6 gap-2 font-bold border-slate-200 hover:bg-slate-50 transition-all"
                onClick={() => setIsAuthOpen(true)}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Log In</span>
              </Button>
            )}

            <div className="flex items-center gap-2">
              <Sheet open={isAddFormOpen} onOpenChange={(open) => {
                if (open && !user) {
                  setIsAuthOpen(true);
                  toast.info("Please log in to add a new place");
                  return;
                }
                setIsAddFormOpen(open);
              }}>
                <SheetTrigger asChild>
                  <Button size="sm" className="rounded-2xl h-11 px-6 gap-2 font-black soft-shadow-lg hover:scale-105 transition-transform md:hidden">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Place</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full h-full p-0 flex flex-col border-none">
                  <SheetHeader className="p-6 border-b shrink-0">
                    <SheetTitle>Submit New Facility</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-hidden">
                    <AddFacilityForm onSuccess={handleAddSuccess} userLocation={userLocation} user={user} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        {/* Mobile Search & Filters */}
        <div className="p-4 space-y-3 bg-white border-b md:hidden shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search facilities..." 
              className="pl-10 bg-secondary/50 border-none rounded-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <FilterBar 
            selectedType={selectedType} 
            onTypeChange={setSelectedType}
            maxPrice={maxPrice}
            onPriceChange={setMaxPrice}
            maxDistance={maxDistance}
            onDistanceChange={setMaxDistance}
          />
        </div>

        {/* Sidebar (Desktop) / List View (Mobile) */}
        <aside className={`
          ${viewMode === 'list' ? 'flex' : 'hidden'} 
          md:flex flex-col w-full md:w-96 border-r bg-secondary/20 shrink-0 overflow-hidden flex-1 md:flex-none min-h-0
        `}>
          <div className="p-4 border-b bg-white hidden md:block">
            <FilterBar 
              selectedType={selectedType} 
              onTypeChange={setSelectedType}
              maxPrice={maxPrice}
              onPriceChange={setMaxPrice}
              maxDistance={maxDistance}
              onDistanceChange={setMaxDistance}
            />
          </div>
          
          <div className="p-4 flex justify-between items-center bg-white/50 backdrop-blur-sm">
            <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
              {processedFacilities.length} Results Found
            </h2>
            {userLocation && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                <Navigation className="w-3 h-3" />
                GPS ACTIVE
              </div>
            )}
          </div>

          <ScrollArea className="flex-1 p-4 min-h-0">
            <div className="grid grid-cols-1 gap-4 pb-20 md:pb-4">
              {processedFacilities.map(facility => (
                <div key={facility.id}>
                  <FacilityCard 
                    facility={facility} 
                    isSelected={selectedFacility?.id === facility.id}
                    onClick={() => {
                      setSelectedFacility(facility);
                      if (window.innerWidth < 768) setViewMode("map");
                    }}
                  />
                </div>
              ))}
              {processedFacilities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                    <Info className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold">No results found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Map View */}
        <div className={`flex-1 relative ${viewMode === 'map' ? 'block' : 'hidden'} md:block`}>
          <Map 
            facilities={processedFacilities} 
            userLocation={userLocation} 
            selectedFacility={selectedFacility}
            onSelectFacility={setSelectedFacility}
          />

          {/* Floating Action Buttons (Map View) */}
          {!isAddFormOpen && (
            <div className="absolute bottom-25 left-1/2 -translate-x-1/2 flex items-center gap-2 z-999 md:hidden">
              <Button 
                variant={viewMode === 'map' ? 'default' : 'secondary'}
                className="rounded-full shadow-2xl h-14 px-8 text-base font-bold border-2 border-white/20 backdrop-blur-sm"
                onClick={() => setViewMode('map')}
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Map
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'secondary'}
                className="rounded-full shadow-2xl h-14 px-8 text-base font-bold border-2 border-white/20 backdrop-blur-sm"
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>
          )}
        </div>

        {/* Detail Overlay */}
        <AnimatePresence>
          {selectedFacility && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute inset-0 md:inset-y-0 md:right-0 md:left-auto md:w-[450px] bg-white z-[2000] shadow-2xl border-l"
            >
              <FacilityDetail 
                facility={selectedFacility} 
                onClose={() => setSelectedFacility(null)} 
                userLocation={userLocation}
                user={user}
                setAuthIsOpen={setIsAuthOpen}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Dialog */}
        <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
          <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none z-1000">
            <Auth onSuccess={() => setIsAuthOpen(false)} />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
