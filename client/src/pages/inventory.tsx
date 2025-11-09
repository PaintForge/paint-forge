import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Label } from "../components/ui/label";
import { Search, Filter, Plus, Package, Palette, Grid3X3, List, CheckCircle, Download, BarChart3, Heart, Star, ShoppingCart } from "lucide-react";
import PaintCard from "../components/paint/paint-card";
import { queryClient, apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPaintSchema, type Paint } from "@shared/schema";
import { getAuthToken } from "../hooks/useAuth";
import type { z } from "zod";

const addPaintSchema = insertPaintSchema.extend({
  name: insertPaintSchema.shape.name.min(1, "Paint name is required"),
  brand: insertPaintSchema.shape.brand.min(1, "Brand is required"),
  color: insertPaintSchema.shape.color.min(1, "Color is required"),
});

type AddPaintForm = z.infer<typeof addPaintSchema>;

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPaints, setSelectedPaints] = useState<Set<number>>(new Set());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<Paint[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<"inventory" | "wishlist">("inventory");
  const [selectionMode, setSelectionMode] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  // Check authentication by trying to validate the token
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });
  
  const isAuthenticated = !!user && !isUserLoading;
  
  console.log('INVENTORY: User data:', user);
  console.log('INVENTORY: isAuthenticated:', isAuthenticated);
  
  // Prevent dialog from opening for unauthenticated users
  const safeSetIsAddDialogOpen = (open: boolean) => {
    console.log('INVENTORY: safeSetIsAddDialogOpen called with:', open, 'isAuthenticated:', isAuthenticated);
    if (!isAuthenticated && open) {
      console.log('INVENTORY: Dialog open blocked for unauthenticated user');
      return; // Prevent dialog from opening
    }
    console.log('INVENTORY: Dialog state changed to:', open);
    setIsAddDialogOpen(open);
  };

  const { data: paints = [], isLoading } = useQuery<Paint[]>({
    queryKey: ["/api/paints"],
    enabled: isAuthenticated, // Only run query if user is authenticated
  });

  // Show empty state for unauthenticated users but allow them to see the interface
  const displayPaints = isAuthenticated ? (paints || []) : [];

  // Add paint form
  const form = useForm<AddPaintForm>({
    resolver: zodResolver(addPaintSchema),
    defaultValues: {
      name: "",
      brand: "",
      color: "#000000",
      type: "base",
      quantity: activeTab === "wishlist" ? 0 : 1,
      priority: "medium",
      notes: "",
    },
  });

  // Paint suggestions search
  const searchPaintSuggestions = async (query: string, brand?: string) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!isAuthenticated) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiRequest("GET", `/api/paints/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      let suggestions = data.filter((paint: Paint) => !paint.userId); // Only master catalog paints
      
      // Filter by brand if provided
      if (brand) {
        suggestions = suggestions.filter((paint: Paint) => paint.brand === brand);
      }
      
      setSearchSuggestions(suggestions.slice(0, 10)); // Limit to 10 suggestions
      setShowSuggestions(true);
    } catch (error) {
      console.error("Failed to search paints:", error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
    setIsSearching(false);
  };

  const selectPaintSuggestion = (paint: Paint) => {
    form.setValue("name", paint.name);
    form.setValue("brand", paint.brand);
    form.setValue("color", paint.color);
    form.setValue("type", paint.type);
    setShowSuggestions(false);
    setSearchSuggestions([]);
  };

  const addPaintMutation = useMutation({
    mutationFn: async (data: AddPaintForm) => {
      // Absolutely prevent any API calls for unauthenticated users
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }
      const paintData = {
        ...data,
        isWishlist: activeTab === "wishlist",
        status: activeTab === "wishlist" ? "wishlist" : "in_stock",
        quantity: activeTab === "wishlist" ? 0 : data.quantity,
      };
      return apiRequest("POST", "/api/paints", paintData);
    },
    // Only enable mutation if user is authenticated
    mutationKey: isAuthenticated ? ["addPaint"] : undefined,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/paints"] });
      toast({
        title: "Paint added successfully",
        description: "The paint has been added to your inventory.",
      });
      clearForm();
      safeSetIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      if (error.message === "Authentication required") {
        toast({
          title: "Account Required",
          description: "Please sign up for a free account to save your paint inventory.",
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation("/register");
        }, 2000);
        return;
      }
      toast({
        title: "Failed to add paint",
        description: error.message || "An error occurred while adding the paint.",
        variant: "destructive",
      });
    },
  });

  const clearForm = () => {
    form.reset({
      name: "",
      brand: "",
      color: "#000000",
      type: "base",
      quantity: 1,
    });
    setSearchSuggestions([]);
    setShowSuggestions(false);
  };

  const onSubmit = (data: AddPaintForm) => {
    // Immediate authentication check - prevent any form submission
    if (!isAuthenticated) {
      toast({
        title: "Account Required",
        description: "Beware: Without an account created, any saved work will be lost when you add paints. Click here to sign up for free.",
        variant: "destructive",
        action: (
          <Button 
            size="sm"
            onClick={() => setLocation("/register")}
            className="bg-orange-500 hover:bg-orange-600 text-black"
          >
            Sign up for free
          </Button>
        ),
      });
      // Force close dialog
      safeSetIsAddDialogOpen(false);
      return;
    }
    addPaintMutation.mutate(data);
  };

  // Filter and sort paints
  const filteredPaints = displayPaints
    .filter((paint) => {
      const matchesSearch = paint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           paint.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           paint.color.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = brandFilter === "all" || paint.brand === brandFilter;
      const matchesType = typeFilter === "all" || paint.type === typeFilter;
      const matchesTab = activeTab === "inventory" ? !paint.isWishlist : paint.isWishlist;
      
      return matchesSearch && matchesBrand && matchesType && matchesTab;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "brand":
          return a.brand.localeCompare(b.brand);
        case "type":
          return a.type.localeCompare(b.type);
        case "quantity":
          return (b.quantity || 0) - (a.quantity || 0);
        default:
          return 0;
      }
    });

  // Get unique brands and types for filters
  const brands = Array.from(new Set(displayPaints.map(p => p.brand))).sort();
  const types = Array.from(new Set(displayPaints.map(p => p.type))).sort();

  // Tab counts
  const inventoryPaints = displayPaints.filter(p => !p.isWishlist);
  const wishlistPaints = displayPaints.filter(p => p.isWishlist);
  
  const totalPaints = inventoryPaints.length;
  const totalWishlist = wishlistPaints.length;

  // Bulk selection handlers
  const togglePaintSelection = (paintId: number) => {
    const newSelection = new Set(selectedPaints);
    if (newSelection.has(paintId)) {
      newSelection.delete(paintId);
    } else {
      newSelection.add(paintId);
    }
    setSelectedPaints(newSelection);
  };

  const selectAllPaints = () => {
    setSelectedPaints(new Set(filteredPaints.map(p => p.id)));
  };

  const clearSelection = () => {
    setSelectedPaints(new Set());
  };

  const exportSelected = () => {
    const selectedPaintData = filteredPaints.filter(p => selectedPaints.has(p.id));
    const csvContent = [
      "Name,Brand,Type,Color,Quantity",
      ...selectedPaintData.map(p => 
        `"${p.name}","${p.brand}","${p.type}","${p.color}",${p.quantity || 0}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "paint-inventory.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportWishlistAsText = () => {
    const wishlistItems = activeTab === "wishlist" ? filteredPaints : wishlistPaints;
    
    if (wishlistItems.length === 0) {
      toast({
        title: "Empty Wishlist",
        description: "Add some paints to your wishlist first.",
        variant: "destructive",
      });
      return;
    }

    // Group by brand for better organization
    const groupedByBrand = wishlistItems.reduce((acc, paint) => {
      if (!acc[paint.brand]) {
        acc[paint.brand] = [];
      }
      acc[paint.brand].push(paint);
      return acc;
    }, {} as Record<string, Paint[]>);

    // Create a formatted shopping list
    const shopListContent = [
      "🎨 PAINT WISHLIST - " + new Date().toLocaleDateString(),
      "=" .repeat(40),
      "",
      ...Object.entries(groupedByBrand).flatMap(([brand, paints]) => [
        `📦 ${brand.toUpperCase()} (${paints.length} items)`,
        ...paints.map(paint => `  • ${paint.name} (${paint.type})`),
        ""
      ]),
      `Total items: ${wishlistItems.length}`,
      "",
      "Generated by The Paint Forge"
    ].join("\n");

    // Copy to clipboard
    navigator.clipboard.writeText(shopListContent).then(() => {
      toast({
        title: "Wishlist Copied!",
        description: "Your shopping list has been copied to clipboard. Paste it in your notes app.",
      });
    }).catch(() => {
      // Fallback: download as text file
      const blob = new Blob([shopListContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "paint-wishlist.txt";
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Wishlist Downloaded",
        description: "Your shopping list has been downloaded as a text file.",
      });
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-cinzel text-3xl font-bold text-orange-500 gothic-shadow">
            Paint Management
          </h1>
          <p className="text-muted-foreground">
            {activeTab === "inventory" ? "Manage your miniature paint collection" : "Track paints you want to buy"}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {activeTab === "wishlist" && isAuthenticated && (
            <Button 
              onClick={exportWishlistAsText}
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Export Shopping List
            </Button>
          )}
          <Button 
            onClick={() => {
              if (!isAuthenticated) {
                // Instant client-side navigation without white screen
                setLocation("/register");
                return;
              }
              safeSetIsAddDialogOpen(true);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === "inventory" ? "Add Paint" : "Add to Wishlist"}
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-secondary/20 p-1 rounded-lg">
        <Button
          variant={activeTab === "inventory" ? "default" : "ghost"}
          onClick={() => setActiveTab("inventory")}
          className={`flex-1 ${activeTab === "inventory" ? "bg-orange-500 hover:bg-orange-600 text-black" : "bg-black hover:bg-gray-800 text-white"}`}
        >
          <Package className="w-4 h-4 mr-2" />
          Inventory ({totalPaints})
        </Button>
        <Button
          variant={activeTab === "wishlist" ? "default" : "ghost"}
          onClick={() => setActiveTab("wishlist")}
          className={`flex-1 ${activeTab === "wishlist" ? "bg-orange-500 hover:bg-orange-600 text-black" : "bg-black hover:bg-gray-800 text-white"}`}
        >
          <Heart className="w-4 h-4 mr-2" />
          Wishlist ({totalWishlist})
        </Button>
      </div>



      {/* Search and Filters */}
      <Card className="glass-morphism border-orange-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search Paints</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, brand, or color..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-2">
                <Select value={brandFilter} onValueChange={setBrandFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.filter(brand => brand && brand.trim() !== "").map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {types.filter(type => type && type.trim() !== "").map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="brand">Brand</SelectItem>
                    <SelectItem value="type">Type</SelectItem>
                    <SelectItem value="quantity">Quantity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newSelectionMode = !selectionMode;
                    setSelectionMode(newSelectionMode);
                    if (!newSelectionMode) {
                      // Clear selections when exiting selection mode
                      setSelectedPaints(new Set());
                    }
                  }}
                  className={selectionMode ? "bg-orange-500/20 border-orange-500" : ""}
                  title={selectionMode ? "Exit selection mode" : "Enable selection mode"}
                >
                  <CheckCircle className={`w-4 h-4 mr-1 ${selectionMode ? "text-orange-500" : ""}`} />
                  {selectionMode ? "Exit Select" : "Select"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                >
                  {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectionMode && (
        <Card className="glass-morphism border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {selectedPaints.size} paint{selectedPaints.size === 1 ? '' : 's'} selected
                </span>
                {filteredPaints.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={selectAllPaints}
                    disabled={filteredPaints.length === 0}
                  >
                    Select All ({filteredPaints.length})
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearSelection}
                  disabled={selectedPaints.size === 0}
                >
                  Clear Selection
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportSelected}
                  disabled={selectedPaints.size === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paint Grid/List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading paints...</p>
        </div>
      ) : filteredPaints.length === 0 ? (
        <Card className="glass-morphism border-orange-500/20">
          <CardContent className="p-8 text-center">
            <Palette className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {!isAuthenticated ? "Sign Up to Start Building Your Collection" : "No paints found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {!isAuthenticated 
                ? "Create a free account to track your paint inventory and never forget what colors you have."
                : displayPaints.length === 0 
                  ? "Get started by adding your first paint to the inventory."
                  : "Try adjusting your search or filter criteria."
              }
            </p>
            {!isAuthenticated ? (
              <Button 
                onClick={() => setLocation("/register")}
                className="bg-orange-500 hover:bg-orange-600 text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Sign Up for Free
              </Button>
            ) : (
              <Button onClick={() => safeSetIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Paint
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-2"
        }>
          {filteredPaints.map((paint) => (
            <PaintCard
              key={paint.id}
              paint={paint}
              isSelected={selectedPaints.has(paint.id)}
              onSelect={togglePaintSelection}
              showSelection={selectionMode}
            />
          ))}
        </div>
      )}



      {/* Add Paint Dialog - Completely prevent for unauthenticated users */}
      {isAuthenticated && isAddDialogOpen && (
        <Dialog open={true} onOpenChange={safeSetIsAddDialogOpen}>
          <DialogContent className="glass-morphism border-orange-500/20 max-w-md" aria-describedby="add-paint-description">
            <DialogHeader>
              <DialogTitle className="text-orange-500">Add New Paint</DialogTitle>
              <p id="add-paint-description" className="text-sm text-muted-foreground">
                Add a new paint to your {activeTab === "wishlist" ? "wishlist" : "inventory"}.
              </p>
            </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={isAuthenticated ? form.handleSubmit(onSubmit) : (e) => { 
              e.preventDefault(); 
              toast({
                title: "Account Required",
                description: "Beware: Without an account created, any saved work will be lost. Click here to sign up for free.",
                variant: "destructive",
              });
            }} className="space-y-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      // Clear name field and suggestions when brand changes
                      form.setValue("name", "");
                      setSearchSuggestions([]);
                      setShowSuggestions(false);
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand first" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="max-h-[200px]">
                        <SelectItem value="AK Interactive">AK Interactive</SelectItem>
                        <SelectItem value="Army Painter">Army Painter</SelectItem>
                        <SelectItem value="Citadel">Citadel</SelectItem>
                        <SelectItem value="Mr. Color">Mr. Color</SelectItem>
                        <SelectItem value="Privateer Press">Privateer Press</SelectItem>
                        <SelectItem value="Reaper">Reaper</SelectItem>
                        <SelectItem value="Scale75">Scale75</SelectItem>
                        <SelectItem value="Tamiya">Tamiya</SelectItem>
                        <SelectItem value="Testors">Testors</SelectItem>
                        <SelectItem value="Two Thin Coats">Two Thin Coats</SelectItem>
                        <SelectItem value="Vallejo">Vallejo</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paint Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder={form.watch("brand") ? `Enter ${form.watch("brand")} paint name...` : "Select brand first"}
                          disabled={!form.watch("brand")}
                          onChange={(e) => {
                            field.onChange(e);
                            const selectedBrand = form.watch("brand");
                            if (selectedBrand && isAuthenticated) {
                              searchPaintSuggestions(e.target.value, selectedBrand);
                            }
                          }}
                        />
                        {isSearching && (
                          <div className="absolute right-3 top-3">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Paint suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <Card className="border-orange-500/20">
                  <CardHeader className="pb-2">
                    <h4 className="text-sm font-medium">Suggestions from {form.watch("brand")} paints:</h4>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {searchSuggestions.map((paint) => (
                        <div
                          key={paint.id}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-orange-500/10 cursor-pointer text-sm"
                          onClick={() => selectPaintSuggestion(paint)}
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border border-orange-500/20" 
                              style={{ backgroundColor: paint.color }}
                            />
                            <span className="font-medium">{paint.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {paint.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select paint type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Base">Base</SelectItem>
                        <SelectItem value="Contrast">Contrast</SelectItem>
                        <SelectItem value="Core">Core</SelectItem>
                        <SelectItem value="Dark">Dark</SelectItem>
                        <SelectItem value="Drop & Paint">Drop & Paint</SelectItem>
                        <SelectItem value="Dry">Dry</SelectItem>
                        <SelectItem value="Effect">Effect</SelectItem>
                        <SelectItem value="Fantasy & Games">Fantasy & Games</SelectItem>
                        <SelectItem value="Fluorescent">Fluorescent</SelectItem>
                        <SelectItem value="Game Color">Game Color</SelectItem>
                        <SelectItem value="Layer">Layer</SelectItem>
                        <SelectItem value="Metal Color">Metal Color</SelectItem>
                        <SelectItem value="Metallic">Metallic</SelectItem>
                        <SelectItem value="Model Air">Model Air</SelectItem>
                        <SelectItem value="Model Color">Model Color</SelectItem>
                        <SelectItem value="Panzer Aces">Panzer Aces</SelectItem>
                        <SelectItem value="Pastel">Pastel</SelectItem>
                        <SelectItem value="Primer">Primer</SelectItem>
                        <SelectItem value="ScaleColor">ScaleColor</SelectItem>
                        <SelectItem value="Shade">Shade</SelectItem>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Warfront">Warfront</SelectItem>
                        <SelectItem value="Wash">Wash</SelectItem>
                        <SelectItem value="Xpress Color">Xpress Color</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={field.value}
                            onChange={field.onChange}
                            className="w-12 h-10 rounded border border-orange-500/20 cursor-pointer"
                          />
                          <Input
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="#000000"
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {activeTab === "inventory" ? (
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue="medium">
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="high">High Priority</SelectItem>
                                <SelectItem value="medium">Medium Priority</SelectItem>
                                <SelectItem value="low">Low Priority</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              placeholder="Why do you want this paint?"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => safeSetIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type={!isAuthenticated ? "button" : "submit"}
                  onClick={!isAuthenticated ? () => {
                    toast({
                      title: "Account Required",
                      description: "Please sign up for a free account to save your paint inventory.",
                      variant: "destructive",
                    });
                    setTimeout(() => {
                      setLocation("/register");
                    }, 2000);
                  } : undefined}
                  disabled={addPaintMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!isAuthenticated ? "Sign up to save" : addPaintMutation.isPending ? "Adding..." : "Add Paint"}
                </Button>
              </div>
            </form>
          </Form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
