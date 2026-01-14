import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../components/ui/collapsible";
import { useToast } from "../hooks/use-toast";
import { 
  Palette, 
  FolderOpen, 
  Plus, 
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Book,
  Camera,
  Target,
  Mail,
  Send,
  Loader2
} from "lucide-react";

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  steps: Array<{
    title: string;
    description: string;
    tips?: string[];
  }>;
}

const helpSections: HelpSection[] = [
  {
    id: "getting-started",
    title: "Getting Started with Paint Forge",
    icon: <Lightbulb className="w-5 h-5" />,
    description: "Learn the basics of managing your miniature paint collection and documenting your painted miniatures.",
    steps: [
      {
        title: "Create Your Free Account",
        description: "Sign up with your email to get started. You'll receive a verification email to confirm your account.",
        tips: [
          "Use a valid email address - you'll need to verify it before logging in",
          "Choose an Account Name that identifies you in your profile",
          "Your account syncs across all your devices automatically"
        ]
      },
      {
        title: "Understand the Two Main Sections",
        description: "Paint Forge has two primary areas: your Paint Inventory (where you track paints you own) and your Projects Showcase (where you document your painted miniatures).",
        tips: [
          "Inventory = Your personal collection of paints you own",
          "Projects = Photos and paint recipes for miniatures you've painted",
          "Both sections are private to your account until you choose to share"
        ]
      },
      {
        title: "Start Building Your Inventory",
        description: "Add the paints you own to your inventory one at a time. You'll enter the paint name, brand, type, and color.",
        tips: [
          "Click the '+' button or 'Add Paint' to add a new paint",
          "Enter the paint name exactly as it appears on the bottle",
          "Select the brand from the dropdown (Citadel, Vallejo, Army Painter, etc.)",
          "Use the color picker to match the paint color as closely as possible"
        ]
      }
    ]
  },

  {
    id: "paint-inventory",
    title: "Managing Your Paint Inventory",
    icon: <Palette className="w-5 h-5" />,
    description: "Build and organize your personal paint collection by adding paints you own.",
    steps: [
      {
        title: "Adding Paints Manually",
        description: "Add each paint in your collection by clicking the Add Paint button and filling in the details.",
        tips: [
          "Paint Name: Enter the exact name from the bottle (e.g., 'Macragge Blue', 'Agrax Earthshade')",
          "Brand: Select from Citadel, Vallejo, Army Painter, Reaper, Scale75, Two Thin Coats, or Other",
          "Type: Choose Base, Layer, Shade/Wash, Contrast, Technical, Metallic, or other types",
          "Color: Use the color picker to select a hex color that matches the paint"
        ]
      },
      {
        title: "Using the Citadel Import Shortcut",
        description: "Speed up adding Citadel paints by using our import feature. Navigate to Citadel Import from the Inventory page to quickly add multiple Citadel paints at once.",
        tips: [
          "Access Citadel Import from the button on the Inventory page",
          "Browse through categorized Citadel paints (Base, Layer, Shade, etc.)",
          "Click to add paints directly to your inventory",
          "This saves time compared to entering each Citadel paint manually"
        ]
      },
      {
        title: "Organizing Your Collection",
        description: "Use the filter and search features to find paints quickly in your growing collection.",
        tips: [
          "Filter by brand to see only paints from one manufacturer",
          "Filter by paint type (Base, Layer, Shade, etc.) for easier browsing",
          "Use the search bar to find specific paints by name",
          "Toggle between viewing 'All Paints' or just 'My Inventory'"
        ]
      },
      {
        title: "Editing and Removing Paints",
        description: "Keep your inventory accurate by updating paint details or removing paints you've used up.",
        tips: [
          "Click on any paint to view its details",
          "Use the edit option to correct names, colors, or other information",
          "Remove paints when they're empty or no longer in your collection",
          "Your changes sync automatically across all your devices"
        ]
      }
    ]
  },

  {
    id: "project-showcase",
    title: "Documenting Your Painted Miniatures",
    icon: <FolderOpen className="w-5 h-5" />,
    description: "Create project showcases to document your painted miniatures with photos and paint recipes.",
    steps: [
      {
        title: "Creating a New Project",
        description: "Start a project to document a miniature you've painted or are currently painting.",
        tips: [
          "Give your project a descriptive name (e.g., 'Ultramarines Intercessor Squad', 'Necron Overlord')",
          "Add a description with any notes about the model or painting approach",
          "You can create projects for single miniatures or entire units"
        ]
      },
      {
        title: "Adding Photos",
        description: "Upload photos of your painted miniatures to showcase your work.",
        tips: [
          "Take photos in good lighting - natural daylight works best",
          "Use a plain background to make your miniature stand out",
          "On mobile, you can take photos directly using the rear camera",
          "Upload multiple angles to show off different details"
        ]
      },
      {
        title: "Recording Your Paint Recipe",
        description: "Document which paints you used on different parts of the miniature.",
        tips: [
          "Add paints from your inventory to the project",
          "Specify which part each paint was used on (armor, skin, weapons, base, etc.)",
          "Note the technique used: basecoat, wash, drybrush, layer, highlight, edge highlight",
          "Add usage notes for future reference (e.g., 'thin 50/50 with water')"
        ]
      },
      {
        title: "Sharing Your Work",
        description: "Share your completed miniatures with other painters or save for your own reference.",
        tips: [
          "Copy shareable links to send to friends or post online",
          "Download images to share on social media",
          "Export text descriptions with your full paint recipe",
          "Use your projects as reference when painting similar models later"
        ]
      }
    ]
  },

  {
    id: "tips-best-practices",
    title: "Tips & Best Practices",
    icon: <Target className="w-5 h-5" />,
    description: "Get the most out of Paint Forge with these helpful tips.",
    steps: [
      {
        title: "Building Your Inventory Efficiently",
        description: "Start with the paints you use most often rather than trying to add everything at once.",
        tips: [
          "Begin with your most-used paints - you can always add more later",
          "Use the Citadel Import feature if you have many Citadel paints",
          "Add paints as you buy them to keep your inventory current",
          "Take a photo of your paint rack to reference while adding paints"
        ]
      },
      {
        title: "Taking Great Miniature Photos",
        description: "Capture your painted miniatures in the best possible light.",
        tips: [
          "Use diffused natural light or a daylight LED lamp",
          "Avoid direct flash - it creates harsh shadows and washes out colors",
          "Use a plain background (white, grey, or black paper works well)",
          "Photograph at the miniature's eye level for a dramatic perspective",
          "Take multiple shots and choose the best one"
        ]
      },
      {
        title: "Documenting Paint Recipes",
        description: "Create useful paint recipes you can reference for future models.",
        tips: [
          "Be specific about techniques: 'basecoat' vs 'thin layer' vs 'edge highlight'",
          "Note any mixing or thinning ratios you used",
          "Include the order of application (e.g., '1. Base, 2. Wash, 3. Drybrush')",
          "Reference your recipes when painting units for consistency"
        ]
      },
      {
        title: "Using Paint Forge on Mobile",
        description: "Access your inventory and projects while at the painting table or hobby store.",
        tips: [
          "Check your inventory before buying paints to avoid duplicates",
          "Reference your paint recipes on your phone while painting",
          "Take progress photos directly from the Projects section",
          "The site works on any smartphone or tablet"
        ]
      }
    ]
  }
];



export default function Help() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["getting-started"]));
  const [supportForm, setSupportForm] = useState({
    category: "",
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Handle hash navigation (e.g., #contact-support) after page loads
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      // Small delay to ensure the page has rendered
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supportForm.category || !supportForm.name || !supportForm.email || !supportForm.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (supportForm.message.length < 10) {
      toast({
        title: "Message Too Short",
        description: "Please provide more details about your issue.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supportForm),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to send support request');
      }
      
      // Try to parse response, but don't fail if it doesn't work
      await response.json().catch(() => ({}));
      
      toast({
        title: "Request Sent",
        description: "We've received your support request and will respond soon.",
      });
      
      setSupportForm({ category: "", name: "", email: "", message: "" });
    } catch (error: any) {
      // Check if it was an abort/timeout error
      if (error.name === 'AbortError') {
        toast({
          title: "Request Timeout",
          description: "The request took too long. Your message may have been sent - please check your email before trying again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to send support request. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionId)) {
      newOpenSections.delete(sectionId);
    } else {
      newOpenSections.add(sectionId);
    }
    setOpenSections(newOpenSections);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-cinzel text-3xl font-bold text-orange-500 gothic-shadow mb-2">
          Paint Forge Help Center
        </h1>
        <p className="text-muted-foreground">
          Learn how to track your paint collection and document your painted miniatures
        </p>
      </div>

      {/* What is Paint Forge */}
      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            What is Paint Forge?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Paint Forge is a personal inventory and project tracking tool for miniature painters. It helps you:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Inventory</Badge>
                  <div>
                    <h4 className="font-semibold text-orange-500">Track Your Paint Collection</h4>
                    <p className="text-sm text-muted-foreground">Add the paints you own to your personal inventory. Know what you have before you buy more.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Organize</Badge>
                  <div>
                    <h4 className="font-semibold text-orange-500">Filter & Search</h4>
                    <p className="text-sm text-muted-foreground">Find paints quickly by brand, type, or name. Perfect for large collections.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Shortcut</Badge>
                  <div>
                    <h4 className="font-semibold text-orange-500">Citadel Import</h4>
                    <p className="text-sm text-muted-foreground">Quickly add Citadel paints from a pre-built list instead of typing each one manually.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Projects</Badge>
                  <div>
                    <h4 className="font-semibold text-orange-500">Document Your Work</h4>
                    <p className="text-sm text-muted-foreground">Create projects with photos and notes for each miniature you paint.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Recipes</Badge>
                  <div>
                    <h4 className="font-semibold text-orange-500">Save Paint Recipes</h4>
                    <p className="text-sm text-muted-foreground">Record which paints you used on each part of your miniature for future reference.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">Share</Badge>
                  <div>
                    <h4 className="font-semibold text-orange-500">Share Your Miniatures</h4>
                    <p className="text-sm text-muted-foreground">Generate shareable links and download images to show off your painted models.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Sections */}
      <div className="space-y-4">
        {helpSections.map((section) => (
          <Card key={section.id} className="glass-morphism border-orange-500/20">
            <Collapsible 
              open={openSections.has(section.id)}
              onOpenChange={() => toggleSection(section.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-orange-500/5 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {section.icon}
                      <div>
                        <h3 className="text-lg">{section.title}</h3>
                        <p className="text-sm text-muted-foreground font-normal">
                          {section.description}
                        </p>
                      </div>
                    </div>
                    {openSections.has(section.id) ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    {section.steps.map((step, index) => (
                      <div key={index} className="border-l-2 border-orange-500/20 pl-4">
                        <h4 className="font-semibold text-orange-500 mb-2">
                          {index + 1}. {step.title}
                        </h4>
                        <p className="text-muted-foreground mb-3">{step.description}</p>
                        {step.tips && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Tips:</p>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {step.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="flex items-start gap-2">
                                  <span className="text-orange-500 mt-1">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Contact Support Form */}
      <Card id="contact-support" className="glass-morphism border-orange-500/20 scroll-mt-20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact Support
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Having trouble with your account, want to suggest a feature, or need to report an issue? Fill out the form below and we'll get back to you as soon as possible.
          </p>
          
          <form onSubmit={handleSupportSubmit} className="space-y-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="support-category">What do you need help with?</Label>
              <Select
                value={supportForm.category}
                onValueChange={(value) => setSupportForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger 
                  id="support-category" 
                  className="bg-[rgba(15,15,15,0.98)] border-orange-500/20"
                  data-testid="select-support-category"
                >
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent className="bg-[rgba(15,15,15,0.98)] border-orange-500/20">
                  <SelectItem value="account-login" data-testid="option-account-login">
                    Account / Login Issues
                  </SelectItem>
                  <SelectItem value="feature-suggestion" data-testid="option-feature-suggestion">
                    Feature Request / Suggestion
                  </SelectItem>
                  <SelectItem value="bug-report" data-testid="option-bug-report">
                    Bug Report / Something's Not Working
                  </SelectItem>
                  <SelectItem value="inappropriate-content" data-testid="option-inappropriate-content">
                    Report Inappropriate Content
                  </SelectItem>
                  <SelectItem value="other" data-testid="option-other">
                    Other / General Question
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Name and Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="support-name">Your Name</Label>
                <Input
                  id="support-name"
                  placeholder="Enter your name"
                  value={supportForm.name}
                  onChange={(e) => setSupportForm(prev => ({ ...prev, name: e.target.value }))}
                  className="dark-input bg-[rgba(15,15,15,0.98)] border-orange-500/20 text-white placeholder:text-gray-400"
                  data-testid="input-support-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Your Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  placeholder="you@example.com"
                  value={supportForm.email}
                  onChange={(e) => setSupportForm(prev => ({ ...prev, email: e.target.value }))}
                  className="dark-input bg-[rgba(15,15,15,0.98)] border-orange-500/20 text-white placeholder:text-gray-400"
                  data-testid="input-support-email"
                />
              </div>
            </div>
            
            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="support-message">Message</Label>
              <Textarea
                id="support-message"
                placeholder="Describe your issue or question in detail..."
                value={supportForm.message}
                onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                className="bg-[rgba(15,15,15,0.98)] border-orange-500/20 min-h-[120px]"
                data-testid="textarea-support-message"
              />
              <p className="text-xs text-muted-foreground">
                {supportForm.message.length}/2000 characters
              </p>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
              data-testid="button-submit-support"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Support Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="glass-morphism border-orange-500/20">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold mb-2">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-4">
            Start by adding a few paints to your inventory, then create your first project to document a painted miniature.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => window.location.href = "/inventory"}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Paint
            </Button>
            <Button onClick={() => window.location.href = "/projects"}>
              <Camera className="w-4 h-4 mr-2" />
              Create a Project
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/"}>
              <Book className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
