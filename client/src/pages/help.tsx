import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Palette, 
  FolderOpen, 
  Plus, 
  Search, 
  Download, 
  Upload,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  Book,
  Video,
  Target
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
    description: "Learn the basics of managing your miniature paint collection with our comprehensive database of 1,185+ verified paints.",
    steps: [
      {
        title: "Create Your Account",
        description: "Sign up with email verification to access your personal paint inventory and showcase gallery.",
        tips: [
          "Use a valid email address for account verification",
          "Your data is automatically synced across all devices",
          "Account required to save inventory and showcase your painted miniatures"
        ]
      },
      {
        title: "Explore the Paint Database",
        description: "Browse our comprehensive database featuring 1,185+ authentic paints from 6 major brands.",
        tips: [
          "Search across Army Painter, Vallejo, Citadel, Reaper, Scale75, and Two Thin Coats",
          "Each paint includes verified hex color codes and product information",
          "Filter by brand, type, or use the search bar to find specific colors"
        ]
      },
      {
        title: "Build Your Inventory",
        description: "Add paints from our database to your personal inventory to track what you own.",
        tips: [
          "Click 'Add to Inventory' on any paint from the database",
          "Track which paints you already own to avoid duplicate purchases",
          "Your inventory is your personal collection separate from the full database"
        ]
      }
    ]
  },

  {
    id: "paint-database",
    title: "Paint Database & Inventory",
    icon: <Palette className="w-5 h-5" />,
    description: "Master the comprehensive paint database and manage your personal inventory effectively.",
    steps: [
      {
        title: "Browsing All Paints",
        description: "Explore the complete database of 1,185+ verified paints with authentic color information.",
        tips: [
          "View all paints from the main inventory page",
          "Each paint shows brand, name, type, and accurate hex color",
          "Product codes and descriptions included where available",
          "Colors are verified from manufacturer specifications"
        ]
      },
      {
        title: "Advanced Filtering",
        description: "Use powerful filters to find exactly the paints you need.",
        tips: [
          "Filter by brand: Army Painter (390), Vallejo (271), Citadel (175), Reaper (133), Scale75 (123), Two Thin Coats (93)",
          "Filter by paint type: Base, Layer, Shade, Technical, Metallic, etc.",
          "Combine multiple filters for precise searches",
          "Clear filters instantly to view all paints again"
        ]
      },
      {
        title: "Managing Your Inventory",
        description: "Track your personal paint collection to avoid duplicate purchases.",
        tips: [
          "Switch between 'All Paints' and 'My Inventory' views",
          "Add paints directly from the database to your inventory",
          "Remove paints from your inventory when used up",
          "Your inventory shows only paints you personally own"
        ]
      },
      {
        title: "Search Functionality",
        description: "Quickly find specific paints using the search feature.",
        tips: [
          "Search by paint name, brand, color, or product code",
          "Search works across all 1,185+ paints in real-time",
          "Combine search with filters for precise results",
          "Search remembers your previous queries during your session"
        ]
      }
    ]
  },

  {
    id: "project-showcase",
    title: "Miniature Showcase",
    icon: <FolderOpen className="w-5 h-5" />,
    description: "Document and share your painted miniatures with detailed paint recipes and techniques.",
    steps: [
      {
        title: "Creating Showcase Projects",
        description: "Start documenting your painted miniatures with our comprehensive project system.",
        tips: [
          "Use descriptive names and detailed descriptions",
          "Upload high-quality photos of your finished miniatures",
          "Projects are saved to your personal showcase gallery",
          "Edit and update projects anytime with new photos or details"
        ]
      },
      {
        title: "Adding Paint Details",
        description: "Document exactly which paints you used on specific parts of your miniature.",
        tips: [
          "Add paints from your inventory to the project",
          "Specify which part each paint was used on (skin, armor, weapons, etc.)",
          "Include painting techniques: base coat, wash, drybrush, highlight, edge highlight",
          "Add usage notes for future reference and consistency"
        ]
      },
      {
        title: "Advanced Sharing Features",
        description: "Share your completed miniatures with comprehensive paint breakdowns.",
        tips: [
          "Copy shareable links to your showcase cards",
          "Download high-quality images of your miniatures",
          "Share detailed text descriptions including all paint information",
          "Share complete showcase with full paint recipes and techniques"
        ]
      },
      {
        title: "Photography Best Practices",
        description: "Capture your miniatures in the best possible light.",
        tips: [
          "Use natural daylight or daylight-balanced LED lighting",
          "Avoid direct flash which creates harsh shadows",
          "Use a plain background to make your miniature stand out",
          "Take photos at miniature eye level for dramatic perspective"
        ]
      }
    ]
  },

  {
    id: "advanced-features",
    title: "Advanced Features",
    icon: <Target className="w-5 h-5" />,
    description: "Master the advanced features that make Paint Forge a powerful tool for serious painters.",
    steps: [
      {
        title: "Paint Recipe Documentation",
        description: "Create detailed paint recipes for consistent results across multiple miniatures.",
        tips: [
          "Document each step: basecoat → wash → drybrush → highlight",
          "Include mixing ratios for custom colors",
          "Note application techniques and brush types used",
          "Reference your recipes when painting similar models"
        ]
      },
      {
        title: "Inventory Management Strategies",
        description: "Optimize your paint collection and avoid running out of key colors.",
        tips: [
          "Regularly update your inventory when paints run low",
          "Use the database to identify suitable replacement colors",
          "Track which paints you use most frequently",
          "Plan purchases around upcoming projects"
        ]
      },
      {
        title: "Project Organization",
        description: "Keep your showcase organized for easy reference and sharing.",
        tips: [
          "Use consistent naming conventions (Army/Faction/Unit)",
          "Include project completion dates in descriptions",
          "Group related miniatures in your showcase",
          "Update projects with new photos as your skills improve"
        ]
      },
      {
        title: "Mobile Optimization",
        description: "Use Paint Forge effectively on mobile devices while painting.",
        tips: [
          "Access your paint recipes on mobile while painting",
          "Take progress photos directly through the mobile interface",
          "Check your inventory before shopping for new paints",
          "Share completed projects instantly from your phone"
        ]
      }
    ]
  }
];



export default function Help() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["getting-started"]));

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
          Master our comprehensive database of 1,185+ verified paints and showcase your painted miniatures with detailed paint recipes
        </p>
      </div>

      {/* Quick Start Actions */}
      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 border-orange-500/20"
              onClick={() => window.location.href = "/inventory"}
            >
              <Search className="w-8 h-8 text-orange-500" />
              <div className="text-center">
                <p className="font-semibold">Browse Paint Database</p>
                <p className="text-xs text-muted-foreground">All major brands</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 border-orange-500/20"
              onClick={() => window.location.href = "/projects"}
            >
              <FolderOpen className="w-8 h-8 text-orange-500" />
              <div className="text-center">
                <p className="font-semibold">Miniature Showcase</p>
                <p className="text-xs text-muted-foreground">Your painted projects</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 border-orange-500/20"
              onClick={() => window.location.href = "/inventory"}
            >
              <Palette className="w-8 h-8 text-orange-500" />
              <div className="text-center">
                <p className="font-semibold">My Inventory</p>
                <p className="text-xs text-muted-foreground">Track owned paints</p>
              </div>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2 border-orange-500/20"
              onClick={() => window.location.href = "/projects"}
            >
              <Plus className="w-8 h-8 text-orange-500" />
              <div className="text-center">
                <p className="font-semibold">Create Project</p>
                <p className="text-xs text-muted-foreground">Document miniatures</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Features Overview */}
      <Card className="glass-morphism border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            Key Features You Should Know
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">Complete</Badge>
                <div>
                  <h4 className="font-semibold text-orange-500">Verified Paint Database</h4>
                  <p className="text-sm text-muted-foreground">Comprehensive collection from all major brands with authentic hex codes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">Smart</Badge>
                <div>
                  <h4 className="font-semibold text-orange-500">Inventory Tracking</h4>
                  <p className="text-sm text-muted-foreground">Track owned paints separately from the full database to avoid duplicates</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">Advanced</Badge>
                <div>
                  <h4 className="font-semibold text-orange-500">Search & Filter</h4>
                  <p className="text-sm text-muted-foreground">Find paints by name, brand, type, or color across the entire database</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">Detailed</Badge>
                <div>
                  <h4 className="font-semibold text-orange-500">Paint Recipes</h4>
                  <p className="text-sm text-muted-foreground">Document techniques, parts, and notes for each miniature project</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">Share</Badge>
                <div>
                  <h4 className="font-semibold text-orange-500">Showcase Sharing</h4>
                  <p className="text-sm text-muted-foreground">Share miniatures with complete paint breakdowns and downloadable images</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-1">Mobile</Badge>
                <div>
                  <h4 className="font-semibold text-orange-500">Cross-Device Sync</h4>
                  <p className="text-sm text-muted-foreground">Access your inventory and projects from any device, anywhere</p>
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

      {/* Footer */}
      <Card className="glass-morphism border-orange-500/20">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold mb-2">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-4">
            Paint Forge combines a comprehensive paint database with powerful project documentation tools for serious miniature painters.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" onClick={() => window.location.href = "/inventory"}>
              <Search className="w-4 h-4 mr-2" />
              Explore Paint Database
            </Button>
            <Button onClick={() => window.location.href = "/projects"}>
              <FolderOpen className="w-4 h-4 mr-2" />
              View Showcase Gallery
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