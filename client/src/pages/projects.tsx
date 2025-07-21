import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Upload, Palette, Search, Filter, Camera, Image, X, Share2, Copy, Link, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getAuthToken } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";

import MiniatureDetail from "@/components/project/miniature-detail";
import type { Project, InsertProject } from "@shared/schema";

const createProjectSchema = z.object({
  name: z.string().min(1, "Miniature name is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

interface ProjectWithPaints extends Project {
  paints?: Array<{
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
  }>;
}

export default function Projects() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  // Check authentication by trying to validate the token
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });
  
  const isAuthenticated = !!user && !isUserLoading;
  
  console.log('PROJECTS: User data:', user);
  console.log('PROJECTS: isAuthenticated:', isAuthenticated);
  
  // Prevent dialog from opening for unauthenticated users
  const safeSetIsDialogOpen = (open: boolean) => {
    console.log('PROJECTS: safeSetIsDialogOpen called with:', open, 'isAuthenticated:', isAuthenticated);
    if (!isAuthenticated && open) {
      console.log('PROJECTS: Dialog open blocked for unauthenticated user');
      return; // Prevent dialog from opening
    }
    console.log('PROJECTS: Dialog state changed to:', open);
    setIsDialogOpen(open);
  };
  
  // Track dialog state changes
  useEffect(() => {
    console.log('Dialog state changed to:', isDialogOpen);
  }, [isDialogOpen]);

  // Set video source when camera stream is available
  useEffect(() => {
    if (videoRef.current && cameraStream && isCameraOpen) {
      console.log('Setting video source:', cameraStream);
      videoRef.current.srcObject = cameraStream;
      
      // Ensure video plays
      videoRef.current.play().catch(err => {
        console.error('Video play failed:', err);
      });
    }
  }, [cameraStream, isCameraOpen]);



  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
    },
  });

  const { data: projects = [], isLoading } = useQuery<ProjectWithPaints[]>({
    queryKey: ["/api/projects"],
    enabled: isAuthenticated,
  });
  
  // Ensure projects is always an array
  const displayProjects = isAuthenticated ? (projects || []) : [];

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectForm) => {
      // Absolutely prevent any API calls for unauthenticated users
      if (!isAuthenticated) {
        throw new Error("Authentication required");
      }
      const response = await apiRequest("POST", "/api/projects", data);
      return response;
    },
    // Only enable mutation if user is authenticated
    mutationKey: isAuthenticated ? ["createProject"] : undefined,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      safeSetIsDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Painted miniature showcase created successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create miniature showcase",
        variant: "destructive",
      });
    },
  });

  const handleImageCapture = async () => {
    try {
      console.log('Requesting camera access...');
      
      // First check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      
      console.log('Camera stream obtained:', stream);
      console.log('Video tracks:', stream.getVideoTracks());
      
      // Set stream first, then open modal
      setCameraStream(stream);
      setIsCameraOpen(true);
      
      // Ensure video element gets the stream after modal opens
      setTimeout(() => {
        if (videoRef.current && stream) {
          console.log('Assigning stream to video element');
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(console.error);
        }
      }, 100);
      
    } catch (error: any) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Error",
        description: `Unable to access camera: ${error.message || 'Unknown error'}. Please try uploading an image instead.`,
        variant: "destructive",
      });
    }
  };

  const handleCapturePhoto = () => {
    console.log('Capture photo clicked');
    if (!videoRef.current || !cameraStream) {
      console.log('Missing video ref or camera stream');
      return;
    }

    try {
      const video = videoRef.current;
      console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight);
      console.log('Video ready state:', video.readyState);
      
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        toast({
          title: "Camera Not Ready",
          description: "Please wait for the camera to load completely.",
          variant: "destructive",
        });
        return;
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        toast({
          title: "Capture Error",
          description: "Unable to create image canvas.",
          variant: "destructive",
        });
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Image captured, data URL length:', imageDataUrl.length);
      
      console.log('Setting captured image and form value...');
      setCapturedImage(imageDataUrl);
      form.setValue('imageUrl', imageDataUrl);
      
      console.log('Dialog open state before camera close:', isDialogOpen);
      
      // Close camera but keep the main dialog open
      if (cameraStream) {
        console.log('Stopping camera stream...');
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setIsCameraOpen(false);
      console.log('Camera closed, dialog should still be open');
      
      // Check dialog state after a small delay
      setTimeout(() => {
        console.log('Dialog open state after camera close:', isDialogOpen);
      }, 100);
      
      toast({
        title: "Photo Captured",
        description: "Your miniature photo has been captured successfully!",
      });
    } catch (error) {
      console.error('Capture error:', error);
      toast({
        title: "Capture Failed",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCloseCamera = () => {
    console.log('Close camera clicked');
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      const img = document.createElement('img');
      
      img.onload = () => {
        try {
          // Calculate new dimensions (max 600x400 for very aggressive compression)
          const maxWidth = 600;
          const maxHeight = 400;
          let { width, height } = img;
          
          console.log(`Original image dimensions: ${width}x${height}`);
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }
          
          console.log(`Resized dimensions: ${width}x${height}`);
          
          canvas.width = width;
          canvas.height = height;
          
          // Clear canvas and draw image
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          
          // Start with very low quality for miniature photos
          let quality = 0.4;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // Calculate base64 size in MB
          const sizeInMB = dataUrl.length / 1024 / 1024;
          console.log(`Initial compressed size: ${sizeInMB.toFixed(2)}MB`);
          
          // Reduce quality aggressively if still too large (aim for under 5MB base64)
          while (dataUrl.length > 5 * 1024 * 1024 && quality > 0.1) {
            quality -= 0.05;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            const newSizeMB = dataUrl.length / 1024 / 1024;
            console.log(`Reduced quality to ${quality.toFixed(2)}, size: ${newSizeMB.toFixed(2)}MB`);
          }
          
          // Final size check
          const finalSizeMB = dataUrl.length / 1024 / 1024;
          console.log(`Final compressed size: ${finalSizeMB.toFixed(2)}MB`);
          
          // Clean up object URL
          URL.revokeObjectURL(img.src);
          
          resolve(dataUrl);
        } catch (error: any) {
          URL.revokeObjectURL(img.src);
          reject(new Error(`Image processing failed: ${error?.message || 'Unknown error'}`));
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image file'));
      };
      
      // Create object URL and load image
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.).",
        variant: "destructive",
      });
      return;
    }
    
    // Check original file size (20MB limit before compression)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 20MB.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      const compressedDataUrl = await compressImage(file);
      
      // Log final base64 string size
      const base64Size = compressedDataUrl.length;
      const estimatedMB = (base64Size / 1024 / 1024).toFixed(2);
      console.log(`Compressed base64 size: ${estimatedMB}MB (${base64Size} characters)`);
      
      setCapturedImage(compressedDataUrl);
      form.setValue('imageUrl', compressedDataUrl);
      
      toast({
        title: "Image uploaded",
        description: `Photo optimized to ${estimatedMB}MB and ready to upload!`,
      });
    } catch (error: any) {
      console.error('Image compression error:', error);
      toast({
        title: "Upload failed",
        description: `Failed to process the image: ${error?.message || 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const removeImage = () => {
    setCapturedImage(null);
    form.setValue('imageUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    console.log('resetForm called - this might be closing the dialog');
    form.reset();
    setCapturedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: CreateProjectForm) => {
    // Immediate authentication check - prevent any form submission
    if (!isAuthenticated) {
      toast({
        title: "Account Required",
        description: "Beware: Without an account created, any saved work will be lost when you add painted miniatures. Click here to sign up for free.",
        variant: "destructive",
        action: (
          <Button 
            size="sm"
            onClick={() => window.location.href = "/register"}
            className="bg-orange-500 hover:bg-orange-600 text-black"
          >
            Sign up for free
          </Button>
        ),
      });
      // Force close dialog
      safeSetIsDialogOpen(false);
      return;
    }
    
    if (!data.name || data.name.trim() === '') {
      toast({
        title: "Missing Information",
        description: "Please include a name for your miniature.",
        variant: "destructive",
      });
      return;
    }
    createProjectMutation.mutate(data);
  };



  // Share functionality handlers
  const handleCopyLink = async (project: ProjectWithPaints) => {
    try {
      const shareUrl = `${window.location.origin}/showcase/${project.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied",
        description: "Showcase link copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareImage = async (project: ProjectWithPaints) => {
    if (!project.imageUrl) {
      toast({
        title: "No Image",
        description: "This miniature doesn't have an image to download.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert base64 to blob for download
      const response = await fetch(project.imageUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_miniature.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Image Downloaded",
        description: "Miniature image saved to your device!",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareComplete = async (project: ProjectWithPaints) => {
    // Create comprehensive showcase content
    const paintDetails = project.paints?.map(p => {
      let paintInfo = `• ${p.partName}: ${p.paint.brand} ${p.paint.name}`;
      
      // Add paint type and color
      paintInfo += ` (${p.paint.type})`;
      if (p.paint.color) {
        paintInfo += ` - ${p.paint.color}`;
      }
      
      // Add technique if specified
      if (p.technique && p.technique.trim()) {
        paintInfo += `\n  → Technique: ${p.technique}`;
      }
      
      // Add usage notes if specified
      if (p.usageNotes && p.usageNotes.trim()) {
        paintInfo += `\n  → Notes: ${p.usageNotes}`;
      }
      
      return paintInfo;
    }).join('\n\n') || 'No paints recorded';

    const showcaseText = `🎨 ${project.name} - Complete Showcase
${project.description ? `\n${project.description}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 COMPLETE PAINT BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${paintDetails}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SHOWCASE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total paints used: ${project.paints?.length || 0}
Brands represented: ${Array.from(new Set(project.paints?.map(p => p.paint.brand) || [])).join(', ') || 'None'}

🔗 View full showcase: ${window.location.origin}/showcase/${project.id}

Shared from The Paint Forge - Track your painting journey!`;

    try {
      // If there's an image, download it along with the text
      if (project.imageUrl) {
        // Download image
        const response = await fetch(project.imageUrl);
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        const imageLink = document.createElement('a');
        imageLink.href = imageUrl;
        imageLink.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_showcase.jpg`;
        document.body.appendChild(imageLink);
        imageLink.click();
        document.body.removeChild(imageLink);
        URL.revokeObjectURL(imageUrl);
      }

      // Share or copy the complete text
      if (navigator.share) {
        await navigator.share({
          title: `${project.name} - Complete Miniature Showcase`,
          text: showcaseText,
          url: `${window.location.origin}/showcase/${project.id}`,
        });
      } else {
        await navigator.clipboard.writeText(showcaseText);
      }

      toast({
        title: "Complete Showcase Shared",
        description: project.imageUrl 
          ? "Image downloaded and details copied to clipboard!"
          : "Complete showcase details copied to clipboard!",
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Unable to share complete showcase. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareText = async (project: ProjectWithPaints) => {
    // Create comprehensive paint breakdown with all details
    const paintDetails = project.paints?.map(p => {
      let paintInfo = `• ${p.partName}: ${p.paint.brand} ${p.paint.name}`;
      
      // Add paint type and color
      paintInfo += ` (${p.paint.type})`;
      if (p.paint.color) {
        paintInfo += ` - ${p.paint.color}`;
      }
      
      // Add technique if specified
      if (p.technique && p.technique.trim()) {
        paintInfo += `\n  → Technique: ${p.technique}`;
      }
      
      // Add usage notes if specified
      if (p.usageNotes && p.usageNotes.trim()) {
        paintInfo += `\n  → Notes: ${p.usageNotes}`;
      }
      
      return paintInfo;
    }).join('\n\n') || 'No paints recorded';

    // Build comprehensive share text
    const shareText = `🎨 ${project.name}
${project.description ? `\n${project.description}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 PAINT BREAKDOWN & TECHNIQUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${paintDetails}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 View full showcase: ${window.location.origin}/showcase/${project.id}

Shared from The Paint Forge - Never forget what paints you used!`;

    try {
      if (navigator.share) {
        // Use native share API if available (mobile)
        await navigator.share({
          title: `${project.name} - Painted Miniature Showcase`,
          text: shareText,
          url: `${window.location.origin}/showcase/${project.id}`,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Complete Details Copied",
          description: "Full miniature showcase details copied to clipboard!",
        });
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Unable to share details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredProjects = displayProjects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-white white-text-shadow">Loading your painted miniatures...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-cinzel font-bold text-orange-500 gothic-shadow mb-2">
            Painted Miniatures Gallery
          </h1>
          <p className="text-white white-text-shadow">
            Keep track of your painted miniatures and the paints you used, never forget again
          </p>
        </div>
        <Button 
          className="bg-orange-500 hover:bg-orange-600"
          onClick={() => {
            if (!isAuthenticated) {
              // Instant client-side navigation without white screen
              setLocation("/register");
              return;
            }
            safeSetIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Painted Miniature
        </Button>
        
        {/* Dialog completely blocked for unauthenticated users */}
        {isAuthenticated && isDialogOpen && (
          <Dialog 
            open={true} 
            onOpenChange={(open) => {
              // Prevent dialog from closing when camera is open
              if (!open && isCameraOpen) {
                console.log('Preventing dialog close because camera is open');
                return;
              }
              console.log('Dialog onOpenChange called:', open);
              safeSetIsDialogOpen(open);
            }}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-cinzel text-orange-500">Add Painted Miniature</DialogTitle>
                <DialogDescription>
                  Upload a photo of your painted miniature and add details about the paints used.
                </DialogDescription>
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Miniature Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Ultramarines Captain, Bloodthirster, Rhino Tank"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Miniature Photo</FormLabel>
                      
                      {/* Image Preview */}
                      {capturedImage && (
                        <div className="relative">
                          <img
                            src={capturedImage}
                            alt="Captured miniature"
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeImage}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Image Capture/Upload Options */}
                      {!capturedImage && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleImageCapture}
                              className="h-24 flex flex-col items-center justify-center gap-2"
                            >
                              <Camera className="w-6 h-6" />
                              <span className="text-sm">Take Photo</span>
                            </Button>
                            
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="h-24 flex flex-col items-center justify-center gap-2"
                            >
                              <Image className="w-6 h-6" />
                              <span className="text-sm">Upload Image</span>
                            </Button>
                          </div>
                          
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          
                          <FormControl>
                            <Input
                              placeholder="Or paste image URL here..."
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                if (e.target.value) {
                                  setCapturedImage(e.target.value);
                                }
                              }}
                            />
                          </FormControl>
                        </div>
                      )}
                      
                      <FormMessage />
                      <p className="text-xs text-white white-text-shadow">
                        Take a photo with your camera, upload from device, or paste an image URL
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notes about this miniature, painting techniques used, or inspiration"
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
                    onClick={() => {
                      safeSetIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createProjectMutation.isPending || !isAuthenticated}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {!isAuthenticated ? "Sign up to save" : createProjectMutation.isPending ? "Creating..." : "Create Showcase"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        )}
      </div>



      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search painted miniatures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && !searchTerm && (
        <div className="text-center py-12">
          <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {isAuthenticated ? "No painted miniatures yet" : "Your Personal Gallery Awaits"}
          </h3>
          <p className="text-white white-text-shadow mb-6">
            {isAuthenticated 
              ? "Start building your gallery by uploading photos of your painted miniatures"
              : "Log in to upload photos of your painted miniatures and track the paints you used"
            }
          </p>
          {isAuthenticated ? (
            <Button 
              onClick={() => safeSetIsDialogOpen(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Miniature
            </Button>
          ) : (
            <Button 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => setLocation('/login')}
            >
              Log In to Start Your Gallery
            </Button>
          )}
        </div>
      )}

      {/* Search Results */}
      {filteredProjects.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No miniatures found</h3>
          <p className="text-white white-text-shadow">
            No painted miniatures match "{searchTerm}". Try a different search term.
          </p>
        </div>
      )}

      {/* Projects Grid */}
      {filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="glass-morphism hover:forge-glow transition-all group cursor-pointer" onClick={() => setSelectedProject(project)}>
              <CardHeader className="p-0">
                {project.imageUrl ? (
                  <div className="aspect-square rounded-t-lg overflow-hidden bg-muted">
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-square rounded-t-lg bg-muted flex items-center justify-center">
                    <Upload className="w-12 h-12 text-muted-foreground" />
                    <span className="sr-only">No image uploaded</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <h3 className="font-cinzel text-lg font-semibold mb-2 text-orange-500">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-white white-text-shadow mb-3 line-clamp-2">
                    {project.description}
                  </p>
                )}
                
                {/* Paint Count Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-white white-text-shadow">
                      {project.paints?.length || 0} paint{(project.paints?.length || 0) !== 1 ? 's' : ''} used
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-500/30 hover:bg-orange-500/10"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(project);
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareImage(project);
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Image
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareComplete(project);
                          }}
                        >
                          <Palette className="w-4 h-4 mr-2" />
                          Share Complete Showcase
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareText(project);
                          }}
                        >
                          <Link className="w-4 h-4 mr-2" />
                          Share as Text
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-500/30 hover:bg-orange-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>


              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Miniature Detail Modal */}
      {selectedProject && (
        <MiniatureDetail
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {/* Camera Modal - Moved outside dialog structure */}
      {isCameraOpen && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70]"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              console.log('Background clicked, closing camera');
              handleCloseCamera();
            }
          }}
        >
          <div 
            className="bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 relative"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h3 className="text-lg font-semibold mb-4 text-center text-white">Take Photo</h3>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg mb-4 bg-black"
              style={{ aspectRatio: '4/3' }}
            />
            <div className="flex gap-3 justify-center">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Capture button clicked with Button component');
                  handleCapturePhoto();
                }}
                onMouseDown={() => console.log('Capture button mouse down')}
                onMouseUp={() => console.log('Capture button mouse up')}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                type="button"
              >
                📸 Capture Photo
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Cancel button clicked with Button component');
                  handleCloseCamera();
                }}
                onMouseDown={() => console.log('Cancel button mouse down')}
                onMouseUp={() => console.log('Cancel button mouse up')}
                variant="secondary"
                className="bg-gray-500 hover:bg-gray-600 text-white"
                type="button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}