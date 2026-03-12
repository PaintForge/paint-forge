import { useEffect, useRef, useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/browser";
import { X, Scan, CheckCircle2, AlertCircle, Search, Plus, Loader2, Camera, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PaintCatalogItem } from "@shared/schema";

interface BarcodeScannerProps {
  onClose: () => void;
  onPaintAdded?: () => void;
}

type ScanState = "scanning" | "found" | "not_found" | "adding" | "added" | "error" | "no_camera";

interface BarcodeResult {
  paint: PaintCatalogItem;
  source: "catalog" | "community";
  confirmedCount?: number;
}

export default function BarcodeScanner({ onClose, onPaintAdded }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningRef = useRef(true);
  const { toast } = useToast();

  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [scannedCode, setScannedCode] = useState<string>("");
  const [result, setResult] = useState<BarcodeResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatalogPaint, setSelectedCatalogPaint] = useState<PaintCatalogItem | null>(null);

  // Catalog search for manual linking
  const { data: searchResults, isFetching: searchLoading } = useQuery<PaintCatalogItem[]>({
    queryKey: ["/api/catalog/paints", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const res = await fetch(`/api/catalog/paints?search=${encodeURIComponent(searchQuery)}&limit=8`);
      const data = await res.json();
      return data.paints || [];
    },
    enabled: searchQuery.length >= 2,
  });

  // Add to inventory mutation
  const addMutation = useMutation({
    mutationFn: async (catalogPaintId: number) => {
      const response = await apiRequest("POST", "/api/catalog/add-to-inventory", {
        catalogPaintId,
        quantity: 1,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/paints"] });
      setScanState("added");
      onPaintAdded?.();
    },
    onError: (err: any) => {
      toast({ title: "Failed to add paint", description: err.message, variant: "destructive" });
      setScanState("found");
    },
  });

  // Submit barcode → paint link (crowd-source)
  const submitBarcodeMutation = useMutation({
    mutationFn: async ({ barcode, catalogId }: { barcode: string; catalogId: number }) => {
      const response = await apiRequest("POST", "/api/catalog/barcode", { barcode, catalogId });
      return response.data;
    },
    onSuccess: (data) => {
      setResult({ paint: data.paint, source: "community", confirmedCount: data.confirmedCount });
      setScanState("found");
      toast({ title: "Barcode linked!", description: "Thanks for contributing to the database." });
    },
    onError: () => {
      toast({ title: "Couldn't save barcode link", variant: "destructive" });
      setScanState("found");
      if (selectedCatalogPaint) {
        setResult({ paint: selectedCatalogPaint, source: "community" });
      }
    },
  });

  const lookupBarcode = useCallback(async (code: string) => {
    try {
      const res = await fetch(`/api/catalog/barcode/${encodeURIComponent(code)}`);
      if (res.ok) {
        const data: BarcodeResult & { success: boolean } = await res.json();
        setResult(data);
        setScanState("found");
      } else {
        setScanState("not_found");
      }
    } catch {
      setScanState("not_found");
    }
  }, []);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    const startScanning = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (devices.length === 0) {
          setScanState("no_camera");
          return;
        }

        // Prefer rear camera on mobile
        const backCamera = devices.find(d =>
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("rear") ||
          d.label.toLowerCase().includes("environment")
        ) || devices[devices.length - 1];

        await reader.decodeFromVideoDevice(
          backCamera.deviceId,
          videoRef.current!,
          (result, error) => {
            if (!scanningRef.current) return;
            if (result) {
              const code = result.getText();
              scanningRef.current = false;
              setScannedCode(code);
              setScanState("scanning"); // keep as scanning briefly before lookup
              lookupBarcode(code);
            }
          }
        );
      } catch (err: any) {
        if (err?.name === "NotAllowedError") {
          setScanState("no_camera");
        } else {
          setScanState("error");
        }
      }
    };

    startScanning();

    return () => {
      scanningRef.current = false;
      try {
        BrowserMultiFormatReader.releaseAllStreams();
      } catch {}
    };
  }, [lookupBarcode]);

  const handleScanAgain = () => {
    setScannedCode("");
    setResult(null);
    setSelectedCatalogPaint(null);
    setSearchQuery("");
    scanningRef.current = true;
    setScanState("scanning");

    // Re-init scanner
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    const startScanning = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (devices.length === 0) { setScanState("no_camera"); return; }
        const backCamera = devices.find(d =>
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("rear")
        ) || devices[devices.length - 1];
        await reader.decodeFromVideoDevice(backCamera.deviceId, videoRef.current!, (res) => {
          if (!scanningRef.current) return;
          if (res) {
            const code = res.getText();
            scanningRef.current = false;
            setScannedCode(code);
            lookupBarcode(code);
          }
        });
      } catch { setScanState("error"); }
    };
    startScanning();
  };

  const handleAddToInventory = (paint: PaintCatalogItem) => {
    setScanState("adding");
    addMutation.mutate(paint.id);
  };

  const handleLinkAndAdd = (catalogPaint: PaintCatalogItem) => {
    setSelectedCatalogPaint(catalogPaint);
    submitBarcodeMutation.mutate({ barcode: scannedCode, catalogId: catalogPaint.id });
    // Also add to inventory
    addMutation.mutate(catalogPaint.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-orange-500" />
          <span className="text-white font-semibold">Scan Paint Barcode</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Camera view — always mounted so we hold the stream reference */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ display: scanState === "scanning" ? "block" : "none" }}
        />

        {/* Scanning overlay */}
        {scanState === "scanning" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {/* Viewfinder */}
            <div className="relative w-64 h-40">
              <div className="absolute inset-0 border-2 border-orange-500/60 rounded-lg" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500 rounded-br-lg" />
              {/* Scanning line animation */}
              <div className="absolute inset-x-0 h-0.5 bg-orange-500/80 animate-scan-line" />
            </div>
            <p className="mt-6 text-white/70 text-sm bg-black/60 px-4 py-2 rounded-full">
              Point at the barcode on the paint pot
            </p>
          </div>
        )}

        {/* Found state */}
        {scanState === "found" && result && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <h2 className="text-white text-xl font-bold mb-1 text-center">{result.paint.name}</h2>
            <p className="text-gray-400 mb-1">{result.paint.brand} · {result.paint.type}</p>
            <div className="flex items-center gap-2 mb-6">
              <div
                className="w-8 h-8 rounded-md border border-white/20"
                style={{ backgroundColor: result.paint.hexColor }}
              />
              {result.source === "community" && (
                <Badge variant="outline" className="border-orange-500/40 text-orange-400 text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Community {result.confirmedCount ? `(${result.confirmedCount}×)` : ""}
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-black font-semibold w-full"
                onClick={() => handleAddToInventory(result.paint)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Inventory
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full" onClick={handleScanAgain}>
                <Scan className="w-4 h-4 mr-2" />
                Scan Another
              </Button>
            </div>
          </div>
        )}

        {/* Adding state */}
        {scanState === "adding" && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            <p className="text-white">Adding to inventory…</p>
          </div>
        )}

        {/* Successfully added */}
        {scanState === "added" && result && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-white text-xl font-bold mb-1">{result.paint.name}</h2>
            <p className="text-gray-400 mb-6">Added to your inventory!</p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-black font-semibold w-full"
                onClick={handleScanAgain}
              >
                <Scan className="w-4 h-4 mr-2" />
                Scan Another Paint
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 w-full" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}

        {/* Not found — manual link flow */}
        {scanState === "not_found" && (
          <div className="absolute inset-0 bg-black/95 flex flex-col p-6 overflow-y-auto">
            <div className="flex flex-col items-center mb-6">
              <AlertCircle className="w-12 h-12 text-orange-400 mb-3" />
              <h2 className="text-white text-lg font-bold text-center">Paint Not Recognized</h2>
              <p className="text-gray-400 text-sm text-center mt-1">
                Barcode <code className="text-orange-400 text-xs">{scannedCode}</code> isn't in the database yet.
                Search for the paint below to link it — you'll help everyone who scans this paint in future!
              </p>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search paint name or brand…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                autoFocus
              />
            </div>

            {searchLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              </div>
            )}

            {searchResults && searchResults.length > 0 && (
              <div className="space-y-2 mb-4">
                {searchResults.map((paint) => (
                  <button
                    key={paint.id}
                    onClick={() => handleLinkAndAdd(paint)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/40 transition-colors text-left"
                  >
                    <div
                      className="w-8 h-8 rounded-md border border-white/20 flex-shrink-0"
                      style={{ backgroundColor: paint.hexColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{paint.name}</p>
                      <p className="text-xs text-gray-400">{paint.brand} · {paint.type}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-orange-400">Link & Add</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && !searchLoading && searchResults?.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No paints found for "{searchQuery}"</p>
            )}

            <div className="flex gap-2 mt-auto pt-4">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 flex-1" onClick={handleScanAgain}>
                <Scan className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="ghost" className="text-gray-400 hover:text-white flex-1" onClick={onClose}>
                Skip
              </Button>
            </div>
          </div>
        )}

        {/* No camera / permission denied */}
        {scanState === "no_camera" && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-6 text-center">
            <Camera className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-white text-lg font-bold mb-2">Camera Access Required</h2>
            <p className="text-gray-400 text-sm mb-6">
              Please allow camera access in your browser settings to use the barcode scanner. On iOS, go to Settings → Safari → Camera.
            </p>
            <Button variant="outline" className="border-white/20 text-white" onClick={onClose}>
              Close
            </Button>
          </div>
        )}

        {/* Generic error */}
        {scanState === "error" && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500/70 mb-4" />
            <h2 className="text-white text-lg font-bold mb-2">Scanner Error</h2>
            <p className="text-gray-400 text-sm mb-6">
              Could not start the barcode scanner. Try refreshing the page or using a different browser.
            </p>
            <Button variant="outline" className="border-white/20 text-white" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>

      {/* Footer hint — only while scanning */}
      {scanState === "scanning" && (
        <div className="p-4 bg-black/80 border-t border-white/10 flex-shrink-0 text-center">
          <p className="text-xs text-gray-500">
            Supports EAN-13, UPC-A, and QR codes · Works best in good lighting
          </p>
        </div>
      )}
    </div>
  );
}
