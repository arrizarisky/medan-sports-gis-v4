import React, { useState, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Facility } from "@/src/types";
import { supabase } from "@/src/lib/supabase";
import { MapPin, Loader2, Image as ImageIcon, Search, Plus } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { ScrollArea } from "@/components/ui/scroll-area";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

interface AddFacilityFormProps {
  onSuccess: (facility: Facility) => void;
  userLocation: [number, number] | null;
  user: any;
}

const facilityOptions = ["Parking", "Toilet", "Shower", "Canteen", "Lighting", "AC", "Locker", "Cafe"];

function DraggableMarker({ position, setPosition }: { position: [number, number], setPosition: (pos: [number, number]) => void }) {
  const markerRef = useRef<L.Marker>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          setPosition([latLng.lat, latLng.lng]);
        }
      },
    }),
    [setPosition],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

function MapEvents({ setPosition }: { setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function AddFacilityForm({ onSuccess, userLocation, user }: AddFacilityFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "gym" as Facility["type"],
    price: "",
    priceValue: "",
    rating: "4.5",
    ratingSource: "Google Maps",
    description: "",
    facilities: [] as string[],
    lat: userLocation ? userLocation[0] : 3.5952,
    lng: userLocation ? userLocation[1] : 98.6722,
    photoUrls: [""] as string[],
    address: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      newFiles.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePreviewImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.photoUrls];
    newUrls[index] = value;
    setFormData(prev => ({ ...prev, photoUrls: newUrls }));
  };

  const addUrlField = () => {
    setFormData(prev => ({ ...prev, photoUrls: [...prev.photoUrls, ""] }));
  };

  const removeUrlField = (index: number) => {
    setFormData(prev => ({ ...prev, photoUrls: prev.photoUrls.filter((_, i) => i !== index) }));
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of selectedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('facility-photos')
        .upload(filePath, file);

      if (error) {
        console.error("Detailed upload error:", error);
        toast.error(`Upload failed for ${file.name}`, {
          description: error.message
        });
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('facility-photos')
        .getPublicUrl(filePath);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Upload files to Supabase Storage first
      const storageUrls = await uploadImages();
      
      // 2. Combine with manual URLs
      const validUrls = formData.photoUrls.filter(url => url.trim() !== "");
      const allPhotos = [...storageUrls, ...validUrls];
      
      const payload = {
        name: formData.name,
        type: formData.type,
        price: formData.price,
        priceValue: parseInt(formData.priceValue) || 0,
        rating: parseFloat(formData.rating) || 0,
        ratingSource: formData.ratingSource || "",
        description: formData.description,
        facilities: formData.facilities,
        lat: formData.lat,
        lng: formData.lng,
        photos: allPhotos.length > 0 ? allPhotos : ["https://picsum.photos/seed/new/800/600"],
        user_id: user?.id
      };

      const { data, error } = await supabase
        .from('facilities')
        .insert([payload])
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        onSuccess(data as Facility);
      }
    } catch (error: any) {
      console.error("Error adding facility:", error);
      
      let errorMessage = "Could not reach the server. Please try again.";
      let errorTitle = "Connection error";

      if (error.code === '42501') {
        errorTitle = "Permission Denied (RLS)";
        errorMessage = "Database policy prevents adding new facilities. Please ensure RLS policies are configured in Supabase.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorTitle, {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFacility = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const setPosition = useCallback((pos: [number, number]) => {
    setFormData(prev => ({ ...prev, lat: pos[0], lng: pos[1] }));
  }, []);

  return (
    <ScrollArea className="h-full">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Facility Name</Label>
          <Input 
            id="name" 
            placeholder="Enter place name" 
            required 
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>

        {/* Mobile-only Location Input (Address Search Simulation) */}
        <div className="space-y-2 md:hidden">
          <Label htmlFor="address">Search Address (Mobile Only)</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              id="address" 
              placeholder="Type address or area..." 
              className="pl-10"
              value={formData.address}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">This field is optimized for mobile address entry.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Sport Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={val => setFormData(prev => ({ ...prev, type: val as any }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gym">Gym</SelectItem>
                <SelectItem value="badminton">Badminton</SelectItem>
                <SelectItem value="futsal">Futsal</SelectItem>
                <SelectItem value="padel">Padel</SelectItem>
                <SelectItem value="jogging">Jogging</SelectItem>
                <SelectItem value="mini soccer">Mini Soccer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="priceValue">Base Price (IDR)</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-6 text-[10px] px-2"
                onClick={() => setFormData(prev => ({ ...prev, priceValue: "0", price: "Free" }))}
              >
                Set as Free
              </Button>
            </div>
            <Input 
              id="priceValue" 
              type="number"
              placeholder="e.g. 50000" 
              required 
              value={formData.priceValue}
              onChange={e => {
                const val = e.target.value;
                setFormData(prev => ({ 
                  ...prev, 
                  priceValue: val, 
                  price: val === "0" ? "Free" : `Rp ${parseInt(val).toLocaleString('id-ID')}` 
                }));
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Initial Rating (0-5)</Label>
            <Input 
              id="rating" 
              type="number"
              step="0.1"
              min="0"
              max="5"
              placeholder="e.g. 4.7" 
              required 
              value={formData.rating}
              onChange={e => setFormData(prev => ({ ...prev, rating: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ratingSource">Rating Source</Label>
            <Input 
              id="ratingSource" 
              placeholder="e.g. Google Maps" 
              value={formData.ratingSource}
              onChange={e => setFormData(prev => ({ ...prev, ratingSource: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Facility Photos</Label>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {previewImages.map((img, idx) => (
                <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                  <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon-sm" 
                    className="absolute top-1 right-1 rounded-full h-6 w-6"
                    onClick={() => removePreviewImage(idx)}
                  >
                    <Plus className="w-3 h-3 rotate-45" />
                  </Button>
                </div>
              ))}
              <div 
                className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 cursor-pointer hover:bg-muted/80 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus className="w-6 h-6 text-muted-foreground mb-1" />
                <span className="text-[10px] font-medium text-muted-foreground">Add Photo</span>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*" 
              multiple
              capture="environment"
              onChange={handleFileChange}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or provide URLs</span>
              </div>
            </div>

            <div className="space-y-2">
              {formData.photoUrls.map((url, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      className="pl-10"
                      value={url}
                      onChange={e => handleUrlChange(idx, e.target.value)}
                    />
                  </div>
                  {formData.photoUrls.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeUrlField(idx)}
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </Button>
                  )}
                </div>
              ))}
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8"
                onClick={addUrlField}
              >
                <Plus className="w-3 h-3 mr-1" /> Add another URL
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Facilities</Label>
          <div className="grid grid-cols-2 gap-2">
            {facilityOptions.map(opt => (
              <div key={opt} className="flex items-center space-x-2">
                <Checkbox 
                  id={opt} 
                  checked={formData.facilities.includes(opt.toLowerCase())}
                  onCheckedChange={() => toggleFacility(opt.toLowerCase())}
                />
                <label htmlFor={opt} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {opt}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc">Description</Label>
          <Input 
            id="desc" 
            placeholder="Brief description" 
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Location (Drag marker or click map)</Label>
          <div className="h-48 w-full rounded-lg overflow-hidden border">
            <MapContainer
              center={[formData.lat, formData.lng]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <DraggableMarker position={[formData.lat, formData.lng]} setPosition={setPosition} />
              <MapEvents setPosition={setPosition} />
            </MapContainer>
          </div>
          
          {/* Mobile-only Manual Coordinate Input */}
          <div className="grid grid-cols-2 gap-2 mt-2 md:hidden">
            <div className="space-y-1">
              <Label className="text-[10px]">Latitude</Label>
              <Input 
                type="number" 
                step="any"
                className="h-8 text-xs"
                value={formData.lat}
                onChange={e => setFormData(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Longitude</Label>
              <Input 
                type="number" 
                step="any"
                className="h-8 text-xs"
                value={formData.lng}
                onChange={e => setFormData(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
            <span className="hidden md:inline">
              Lat: {typeof formData.lat === 'number' ? formData.lat.toFixed(6) : '0'} | 
              Lng: {typeof formData.lng === 'number' ? formData.lng.toFixed(6) : '0'}
            </span>
            <Button 
              type="button" 
              variant="link" 
              className="h-auto p-0 text-[10px] ml-auto"
              onClick={() => {
                if (userLocation) setPosition(userLocation);
              }}
            >
              Reset to My GPS
            </Button>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Submit Facility
        </Button>
      </form>
    </ScrollArea>
  );
}
