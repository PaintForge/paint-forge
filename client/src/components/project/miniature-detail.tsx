import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Palette, Edit, Trash2, X } from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "../../hooks/use-toast";
import { apiRequest, queryClient } from "../../lib/queryClient";
import type { Project, Paint } from "@shared/schema";

const addPaintSchema = z.object({
  paintId: z.union([z.number().min(1), z.literal("custom")], {
    errorMap: () => ({ message: "Please select a paint or choose custom" })
  }),
  partName: z.string().min(1, "Part name is required"),
  technique: z.string().optional(),
  usageNotes: z.string().optional(),
  // Custom paint fields
  customPaintName: z.string().optional(),
  customPaintBrand: z.string().optional(),
  customPaintColor: z.string().optional(),
  customPaintType: z.string().optional(),
}).refine((data) => {
  if (data.paintId === "custom") {
    return !!(data.customPaintName && data.customPaintBrand && data.customPaintColor);
  }
  return true;
}, {
  message: "Custom paint name, brand, and color are required",
  path: ["customPaintName"]
});

type AddPaintForm = z.infer<typeof addPaintSchema>;

interface ProjectPaint {
  id: number;
  partName: string;
  technique?: string;
  usageNotes?: string;
  paint: {
    id: number;
    name: string;
    brand: string;
    color: string;
    type: string;
  };
}

interface MiniatureDetailProps {
  project: Project;
  onClose: () => void;
}

const commonParts = [
  "Armor", "Base", "Belt", "Boots", "Cloak", "Cloth", "Eyes", "Gemstones", 
  "Gloves", "Helmet", "Helmet Lenses", "Highlights", "Metal Details", "Pouches", 
  "Shadows", "Shoulder Pads", "Skin", "Trim", "Weapon", "Weapon Barrel", "Weapon Grip"
].sort();

const paintTechniques = [
  "Base Coat", "Dry Brush", "Edge Highlight", "Glazing", "Highlight", 
  "Layering", "Sponge Weathering", "Stippling", "Wash", "Wetblending"
].sort();

export default function MiniatureDetail({ project, onClose }: MiniatureDetailProps) {
  const [isAddPaintOpen, setIsAddPaintOpen] = useState(false);
  const [isCustomPaint, setIsCustomPaint] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddPaintForm>({
    resolver: zodResolver(addPaintSchema),
    defaultValues: {
      paintId: 0,
      partName: "",
      technique: "",
      usageNotes: "",
      customPaintName: "",
      customPaintBrand: "",
      customPaintColor: "#000000",
      customPaintType: "",
    },
  });

  const { data: projectPaints = [], isLoading: isPaintsLoading } = useQuery<ProjectPaint[]>({
    queryKey: [`/api/projects/${project.id}/paints`],
  });

  const { data: allPaints = [] } = useQuery<Paint[]>({
    queryKey: ["/api/paints/all"],
  });

  const addPaintMutation = useMutation({
    mutationFn: async (data: AddPaintForm) => {
      if (data.paintId === "custom") {
        // First create the custom paint
        const customPaintData = {
          name: data.customPaintName!,
          brand: data.customPaintBrand!,
          color: data.customPaintColor!,
          type: data.customPaintType!,
          status: "custom",
          quantity: 1
        };
        
        const paintResponse = await apiRequest("POST", "/api/paints", customPaintData);
        const paintResult = await paintResponse.json();
        
        // Then add it to the project
        const projectPaintData = {
          paintId: paintResult.id,
          partName: data.partName,
          technique: data.technique,
          usageNotes: data.usageNotes
        };
        
        const response = await apiRequest("POST", `/api/projects/${project.id}/paints`, projectPaintData);
        return response;
      } else {
        // Use existing paint from database
        const projectPaintData = {
          paintId: data.paintId as number,
          partName: data.partName,
          technique: data.technique,
          usageNotes: data.usageNotes
        };
        
        const response = await apiRequest("POST", `/api/projects/${project.id}/paints`, projectPaintData);
        return response;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/paints`] });
      setIsAddPaintOpen(false);
      setIsCustomPaint(false);
      form.reset();
      toast({
        title: "Success",
        description: "Paint added to miniature part successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add paint",
        variant: "destructive",
      });
    },
  });

  const removePaintMutation = useMutation({
    mutationFn: async (paintId: number) => {
      await apiRequest("DELETE", `/api/projects/${project.id}/paints/${paintId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/paints`] });
      toast({
        title: "Success",
        description: "Paint removed from miniature",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove paint",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddPaintForm) => {
    addPaintMutation.mutate(data);
  };

  const groupedPaints = projectPaints
    .filter(projectPaint => projectPaint.partName && projectPaint.partName.trim() !== '')
    .reduce((acc, projectPaint) => {
      const partName = projectPaint.partName;
      if (!acc[partName]) {
        acc[partName] = [];
      }
      acc[partName].push(projectPaint);
      return acc;
    }, {} as Record<string, ProjectPaint[]>);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-cinzel font-bold text-orange-500">{project.name}</h2>
            {project.description && (
              <p className="text-white white-text-shadow mt-1">{project.description}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row h-full max-h-[calc(90vh-80px)]">
          {/* Image Section */}
          <div className="lg:w-1/2 p-6">
            {project.imageUrl ? (
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                <Palette className="w-16 h-16 text-muted-foreground" />
                <span className="sr-only">No image uploaded</span>
              </div>
            )}
          </div>

          {/* Paint Details Section */}
          <div className="lg:w-1/2 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Paint Recipe</h3>
              <Dialog open={isAddPaintOpen} onOpenChange={setIsAddPaintOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Paint
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-cinzel text-orange-500">Add Paint to Part</DialogTitle>
                    <DialogDescription>
                      Specify which paint was used on which part of the miniature.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="partName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Miniature Part</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a part" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {commonParts.map((part) => (
                                  <SelectItem key={part} value={part}>
                                    {part}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="paintId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Paint</FormLabel>
                            <Select onValueChange={(value) => {
                              if (value === "custom") {
                                setIsCustomPaint(true);
                                field.onChange("custom");
                              } else {
                                setIsCustomPaint(false);
                                field.onChange(Number(value));
                              }
                            }}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a paint" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="custom" className="font-semibold text-orange-500">
                                  🎨 Add Custom Paint
                                </SelectItem>
                                {allPaints.map((paint) => (
                                  <SelectItem key={paint.id} value={paint.id.toString()}>
                                    {paint.brand} - {paint.name}
                                    <span 
                                      className="inline-block w-3 h-3 rounded ml-2 border border-gray-300" 
                                      style={{ backgroundColor: paint.color }}
                                      title={paint.color}
                                    />
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Custom Paint Fields */}
                      {isCustomPaint && (
                        <div className="space-y-4 p-4 border border-orange-500/20 rounded-lg bg-orange-500/5">
                          <h4 className="font-semibold text-orange-500">Custom Paint Details</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="customPaintName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Paint Name *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Dragon Red" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="customPaintBrand"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Brand *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Custom Brand" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="customPaintColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Color</FormLabel>
                                  <FormControl>
                                    <div className="flex gap-2">
                                      <Input type="color" {...field} className="w-16 h-10" />
                                      <Input {...field} className="flex-1 font-mono" placeholder="#FF0000" />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="customPaintType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Base">Base</SelectItem>
                                      <SelectItem value="Highlight">Highlight</SelectItem>
                                      <SelectItem value="Layer">Layer</SelectItem>
                                      <SelectItem value="Metallic">Metallic</SelectItem>
                                      <SelectItem value="Shade">Shade</SelectItem>
                                      <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="technique"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Technique (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select technique used" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {paintTechniques.map((technique) => (
                                  <SelectItem key={technique} value={technique}>
                                    {technique}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="usageNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any special notes about how this paint was applied..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddPaintOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={addPaintMutation.isPending}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          {addPaintMutation.isPending ? "Adding..." : "Add Paint"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {isPaintsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading paint details...</p>
              </div>
            ) : Object.keys(groupedPaints).length === 0 ? (
              <div className="text-center py-8">
                <Palette className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">No paints added yet</h4>
                <p className="text-muted-foreground mb-4">
                  Start adding paints to document what colors you used on each part
                </p>
                <Button
                  onClick={() => setIsAddPaintOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Paint
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedPaints).map(([partName, paints]) => (
                  <Card key={partName} className="glass-morphism">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-orange-500">{partName}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {paints.map((projectPaint) => (
                          <div
                            key={projectPaint.id}
                            className="flex items-center justify-between p-3 bg-background/20 rounded-lg"
                          >
                            <div className="flex-1">
                              {projectPaint.paint && (
                                <div className="flex items-center gap-2 mb-1">
                                  <div
                                    className="w-4 h-4 rounded-full border border-muted"
                                    style={{ backgroundColor: projectPaint.paint.color || '#666666' }}
                                  />
                                  <span className="font-medium">
                                    {projectPaint.paint.brand} - {projectPaint.paint.name}
                                  </span>
                                </div>
                              )}
                              {projectPaint.technique && (
                                <Badge variant="secondary" className="text-xs mr-2">
                                  {projectPaint.technique}
                                </Badge>
                              )}
                              {projectPaint.usageNotes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {projectPaint.usageNotes}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => projectPaint.paint?.id && removePaintMutation.mutate(projectPaint.paint.id)}
                              disabled={removePaintMutation.isPending || !projectPaint.paint?.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}