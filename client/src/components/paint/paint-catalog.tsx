import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { Search, Plus, Database, Loader2, Check, BookOpen, Filter } from "lucide-react";
import { queryClient, apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";

interface CatalogPaint {
  id: number;
  name: string;
  brand: string;
  type: string;
  hexColor: string;
  r: number;
  g: number;
  b: number;
  isDiscontinued: boolean;
}

interface BrandInfo {
  name: string;
  count: number;
}

interface TypeInfo {
  name: string;
  count: number;
}

interface PaintCatalogProps {
  onPaintAdded?: () => void;
  userPaintNames?: string[];
}

export default function PaintCatalog({ onPaintAdded, userPaintNames = [] }: PaintCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [addingPaintId, setAddingPaintId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: brandsData, isLoading: brandsLoading } = useQuery<{ success: boolean; brands: BrandInfo[]; totalPaints: number }>({
    queryKey: ["/api/catalog/brands"],
  });

  const { data: typesData } = useQuery<{ success: boolean; types: TypeInfo[] }>({
    queryKey: ["/api/catalog/types", selectedBrand],
    queryFn: async () => {
      const url = selectedBrand !== "all" 
        ? `/api/catalog/types?brand=${encodeURIComponent(selectedBrand)}`
        : "/api/catalog/types";
      const response = await fetch(url);
      return response.json();
    },
  });

  const { data: paintsData, isLoading: paintsLoading } = useQuery<{ success: boolean; paints: CatalogPaint[]; total: number }>({
    queryKey: ["/api/catalog/paints", selectedBrand, selectedType, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedBrand !== "all") params.append("brand", selectedBrand);
      if (selectedType !== "all") params.append("type", selectedType);
      if (searchTerm) params.append("search", searchTerm);
      params.append("limit", "200");
      
      const response = await fetch(`/api/catalog/paints?${params.toString()}`);
      return response.json();
    },
  });

  const addToInventoryMutation = useMutation({
    mutationFn: async (catalogPaintId: number) => {
      return apiRequest("POST", "/api/catalog/add-to-inventory", { catalogPaintId, quantity: 100 });
    },
    onSuccess: (response: any) => {
      toast({
        title: "Paint Added!",
        description: response?.data?.message || "Paint added to your inventory",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/paints"] });
      onPaintAdded?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add paint to inventory",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setAddingPaintId(null);
    },
  });

  const handleAddToInventory = (paint: CatalogPaint) => {
    setAddingPaintId(paint.id);
    addToInventoryMutation.mutate(paint.id);
  };

  const isPaintOwned = (paintName: string, paintBrand: string) => {
    const normalizedName = `${paintBrand}-${paintName}`.toLowerCase();
    return userPaintNames.some(owned => owned.toLowerCase() === normalizedName);
  };

  const brands = brandsData?.brands || [];
  const types = typesData?.types || [];
  const paints = paintsData?.paints || [];
  const totalPaints = brandsData?.totalPaints || 0;

  if (brandsLoading) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-orange-900/30">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="ml-3 text-gray-400">Loading paint catalog...</span>
        </CardContent>
      </Card>
    );
  }

  if (totalPaints === 0) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-orange-900/30">
        <CardContent className="py-12 text-center">
          <Database className="w-16 h-16 mx-auto text-orange-500/50 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Paint Catalog Empty</h3>
          <p className="text-gray-400 mb-4">
            The paint catalog hasn't been imported yet. Ask an admin to import the paint database.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-black/40 backdrop-blur-sm border-orange-900/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-cinzel text-orange-400 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Paint Catalog
            </CardTitle>
            <Badge variant="outline" className="border-orange-500/50 text-orange-400">
              {totalPaints.toLocaleString()} paints available
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search paints by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/60 border-orange-900/30 text-white placeholder:text-gray-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-gray-400 mb-1 block">Brand</label>
              <Select value={selectedBrand} onValueChange={(value) => { setSelectedBrand(value); setSelectedType("all"); }}>
                <SelectTrigger className="bg-black/60 border-orange-900/30 text-white">
                  <SelectValue placeholder="All Brands" />
                </SelectTrigger>
                <SelectContent className="bg-[rgba(15,15,15,0.98)] border-orange-900/30">
                  <SelectItem value="all" className="text-white hover:bg-orange-900/20">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.name} value={brand.name} className="text-white hover:bg-orange-900/20">
                      {brand.name} ({brand.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <label className="text-xs text-gray-400 mb-1 block">Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-black/60 border-orange-900/30 text-white">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-[rgba(15,15,15,0.98)] border-orange-900/30">
                  <SelectItem value="all" className="text-white hover:bg-orange-900/20">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type.name} value={type.name} className="text-white hover:bg-orange-900/20">
                      {type.name} ({type.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/40 backdrop-blur-sm border-orange-900/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {paintsLoading ? "Loading..." : `${paints.length} paints found`}
            </span>
            {selectedBrand !== "all" && (
              <Badge className="bg-orange-600/20 text-orange-400 border-orange-500/30">
                {selectedBrand}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {paintsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : paints.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No paints match your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                {paints.map((paint) => {
                  const isOwned = isPaintOwned(paint.name, paint.brand);
                  const isAdding = addingPaintId === paint.id;
                  
                  return (
                    <div
                      key={paint.id}
                      className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isOwned
                          ? "bg-green-900/20 border-green-500/30"
                          : "bg-black/40 border-orange-900/20 hover:border-orange-500/40"
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg border border-white/20 shadow-inner flex-shrink-0"
                        style={{ backgroundColor: paint.hexColor }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white truncate">
                            {paint.name}
                          </h4>
                          {paint.isDiscontinued && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 border-red-500/50 text-red-400">
                              Disc.
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {paint.type}
                        </p>
                      </div>
                      
                      {isOwned ? (
                        <div className="flex-shrink-0">
                          <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                            <Check className="w-3 h-3 mr-1" />
                            Owned
                          </Badge>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddToInventory(paint)}
                          disabled={isAdding}
                          className="flex-shrink-0 text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
                        >
                          {isAdding ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
