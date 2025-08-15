import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { MoreHorizontal, Edit, Trash2, Package, AlertTriangle, CheckCircle, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPaintSchema, type Paint } from "../../../../shared/schema";
import { apiRequest } from "../../lib/queryClient";
import { queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import type { z } from "zod";

const updatePaintSchema = insertPaintSchema.extend({
  name: insertPaintSchema.shape.name.min(1, "Paint name is required"),
  brand: insertPaintSchema.shape.brand.min(1, "Brand is required"),
  color: insertPaintSchema.shape.color.min(1, "Color is required"),
});

type UpdatePaintForm = z.infer<typeof updatePaintSchema>;

interface PaintCardProps {
  paint: Paint;
  isSelected?: boolean;
  onSelect?: (paintId: number) => void;
  showSelection?: boolean;
}

export default function PaintCard({ paint, isSelected = false, onSelect, showSelection = false }: PaintCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const updatePaintMutation = useMutation({
    mutationFn: async (data: UpdatePaintForm) => {
      const response = await apiRequest("PUT", `/api/paints/${paint.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/paints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      setIsEditDialogOpen(false);
      toast({
        title: "Paint updated",
        description: "Paint information has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update paint. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deletePaintMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/paints/${paint.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/paints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      toast({
        title: "Paint deleted",
        description: "Paint has been removed from your inventory.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete paint. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async (newQuantity: number) => {
      const response = await apiRequest("PUT", `/api/paints/${paint.id}`, { quantity: newQuantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/paints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update paint quantity.",
        variant: "destructive",
      });
    },
  });

  const incrementQuantity = () => {
    const newQuantity = (paint.quantity || 0) + 1;
    updateQuantityMutation.mutate(newQuantity);
  };

  const decrementQuantity = () => {
    const currentQuantity = paint.quantity || 0;
    if (currentQuantity > 0) {
      updateQuantityMutation.mutate(currentQuantity - 1);
    }
  };

  const form = useForm<UpdatePaintForm>({
    resolver: zodResolver(updatePaintSchema),
    defaultValues: {
      name: paint.name,
      brand: paint.brand,
      color: paint.color,
      type: paint.type,
      quantity: paint.quantity || 100,
      status: paint.status,
      userId: paint.userId || 1,
    },
  });

  const onSubmit = (data: UpdatePaintForm) => {
    updatePaintMutation.mutate(data);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this paint?")) {
      deletePaintMutation.mutate();
    }
  };



  return (
    <>
      <Card className="glass-morphism group hover:forge-glow transition-all cursor-pointer" onClick={() => setIsEditDialogOpen(true)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            {showSelection && (
              <div className="flex items-center mr-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <Checkbox 
                  checked={isSelected}
                  onCheckedChange={() => onSelect?.(paint.id)}
                  className="w-5 h-5 border-2 border-orange-500/50 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 data-[state=checked]:text-white"
                />
              </div>
            )}
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div 
                className="w-12 h-12 rounded-lg border-2 border-orange-500/20 shadow-inner flex-shrink-0"
                style={{ backgroundColor: paint.color }}
                title={`Color: ${paint.color}`}
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate mb-1" title={paint.name}>
                  {paint.name}
                </h3>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    {paint.brand}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="text-xs px-2 py-0 capitalize border-orange-500/30"
                  >
                    {paint.type}
                  </Badge>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="opacity-100 transition-opacity flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditDialogOpen(true);
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-orange-500/20 hover:bg-orange-500/10"
                  onClick={decrementQuantity}
                  disabled={updateQuantityMutation.isPending || (paint.quantity || 0) <= 0}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-lg font-semibold min-w-[2rem] text-center">
                  {paint.quantity || 0}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-orange-500/20 hover:bg-orange-500/10"
                  onClick={incrementQuantity}
                  disabled={updateQuantityMutation.isPending}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass-morphism border-orange-500/20">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-xl text-orange-500">Edit Paint</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
              <FormField
                control={form.control as any}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paint Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Army Painter">Army Painter</SelectItem>
                          <SelectItem value="Citadel">Citadel</SelectItem>
                          <SelectItem value="P3">P3</SelectItem>
                          <SelectItem value="Reaper">Reaper</SelectItem>
                          <SelectItem value="Scale75">Scale75</SelectItem>
                          <SelectItem value="Vallejo">Vallejo</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paint Type</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Base">Base</SelectItem>
                          <SelectItem value="Layer">Layer</SelectItem>
                          <SelectItem value="Shade">Shade</SelectItem>
                          <SelectItem value="Dry">Dry</SelectItem>
                          <SelectItem value="Technical">Technical</SelectItem>
                          <SelectItem value="Contrast">Contrast</SelectItem>
                          <SelectItem value="Air">Air</SelectItem>
                          <SelectItem value="Spray">Spray</SelectItem>
                          <SelectItem value="Glaze">Glaze</SelectItem>
                          <SelectItem value="Gemstone">Gemstone</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input type="color" {...field} className="w-16 h-10" />
                        <Input {...field} className="flex-1 font-mono" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="1"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />



              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deletePaintMutation.isPending}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deletePaintMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-500 hover:bg-orange-600 text-black flex-1"
                  disabled={updatePaintMutation.isPending}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {updatePaintMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
