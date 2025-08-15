import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { Download, Database, Globe, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";

interface ScrapedPaint {
  name: string;
  type: string;
  color: string;
  imageUrl?: string;
  description?: string;
}

interface ScrapeResponse {
  success: boolean;
  paints: ScrapedPaint[];
  count: number;
  source: string;
  message?: string;
  error?: string;
}

export default function CitadelImport() {
  const [scrapedData, setScrapedData] = useState<ScrapedPaint[]>([]);
  const [importStats, setImportStats] = useState<{ imported: number; skipped: number; total: number } | null>(null);
  const { toast } = useToast();

  // Load authentic Citadel paint catalog
  const loadMutation = useMutation({
    mutationFn: async (): Promise<ScrapeResponse> => {
      const response = await fetch("/api/citadel/paints");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setScrapedData(data.paints);
        toast({
          title: "Catalog Loaded",
          description: `Found ${data.count} authentic Citadel paints`,
        });
      } else {
        toast({
          title: "Load Failed",
          description: data.message || "Failed to load paint catalog",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Load Error",
        description: error.message || "Failed to load authentic paint catalog",
        variant: "destructive",
      });
    }
  });

  // Import scraped paints to inventory
  const importMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/citadel/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (data) => {
      setImportStats({
        imported: data.imported,
        skipped: data.skipped,
        total: data.total
      });
      queryClient.invalidateQueries({ queryKey: ["/api/paints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/stats"] });
      toast({
        title: "Import Complete",
        description: `Successfully imported ${data.imported} new Citadel paints`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import paint data",
        variant: "destructive",
      });
    }
  });

  const handleLoad = () => {
    setScrapedData([]);
    setImportStats(null);
    loadMutation.mutate();
  };

  const handleImport = () => {
    importMutation.mutate();
  };

  const groupedPaints = scrapedData.reduce((acc, paint) => {
    const type = paint.type || "Unknown";
    if (!acc[type]) acc[type] = [];
    acc[type].push(paint);
    return acc;
  }, {} as Record<string, ScrapedPaint[]>);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-forge-primary">
          Citadel Paint Import
        </h1>
        <p className="text-muted-foreground">
          Import authentic Citadel Colour paint data directly from the official website
        </p>
      </div>

      {/* Action Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Scrape Data Card */}
        <Card className="border-forge-accent/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-forge-accent" />
              Scrape Citadel Data
            </CardTitle>
            <CardDescription>
              Fetch the latest paint information from citadelcolour.com
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleLoad}
              disabled={loadMutation.isPending}
              className="w-full bg-forge-accent hover:bg-forge-accent/80 text-black"
            >
              {loadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Load Catalog
                </>
              )}
            </Button>
            
            {scrapedData.length > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Successfully loaded {scrapedData.length} authentic Citadel paints
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Import Data Card */}
        <Card className="border-forge-accent/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-forge-accent" />
              Import to Inventory
            </CardTitle>
            <CardDescription>
              Add scraped paints to your Paint Forge inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleImport}
              disabled={importMutation.isPending || scrapedData.length === 0}
              className="w-full bg-orange-500 hover:bg-orange-600 text-black"
            >
              {importMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Import {scrapedData.length} Paints
                </>
              )}
            </Button>

            {importStats && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Import complete: {importStats.imported} new, {importStats.skipped} existing
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scraped Data Preview */}
      {scrapedData.length > 0 && (
        <Card className="border-forge-accent/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Scraped Paint Data Preview</CardTitle>
            <CardDescription>
              {scrapedData.length} paints found across {Object.keys(groupedPaints).length} categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(groupedPaints).map(([type, paints]) => (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="bg-forge-accent/20 text-forge-accent">
                      {type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {paints.length} paints
                    </span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {paints.slice(0, 6).map((paint, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded border bg-card/30">
                        <div 
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: paint.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{paint.name}</p>
                          <p className="text-xs text-muted-foreground">{paint.color}</p>
                        </div>
                      </div>
                    ))}
                    {paints.length > 6 && (
                      <div className="flex items-center justify-center p-2 rounded border bg-card/30 text-sm text-muted-foreground">
                        +{paints.length - 6} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Indicator */}
      {(loadMutation.isPending || importMutation.isPending) && (
        <Card className="border-forge-accent/20 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {loadMutation.isPending ? "Loading authentic Citadel catalog..." : "Importing to inventory..."}
                </span>
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}