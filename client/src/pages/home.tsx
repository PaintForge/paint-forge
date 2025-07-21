import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Package,
  Plus,
  Search,
  FolderOpen
} from "lucide-react";

interface InventoryStats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export default function Home() {
  const { data: inventoryStats } = useQuery<InventoryStats>({
    queryKey: ["/api/inventory/stats"],
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="font-cinzel text-4xl font-bold text-orange-500 gothic-shadow">
          The Paint Forge
        </h1>
        <p className="text-white white-text-shadow text-lg">
          Your complete miniature paint inventory management system
        </p>
      </div>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-4">
        <Link href="/inventory">
          <Card className="glass-morphism cursor-pointer hover:forge-glow transition-all">
            <CardContent className="p-6 text-center">
              <Package className="text-orange-500 w-8 h-8 mx-auto mb-3" />
              <h3 className="font-cinzel text-lg font-semibold mb-2">Paint Inventory</h3>
              <p className="text-white white-text-shadow text-sm">Manage your paint collection</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/projects">
          <Card className="glass-morphism cursor-pointer hover:forge-glow transition-all">
            <CardContent className="p-6 text-center">
              <FolderOpen className="text-orange-500 w-8 h-8 mx-auto mb-3" />
              <h3 className="font-cinzel text-lg font-semibold mb-2">Projects</h3>
              <p className="text-white white-text-shadow text-sm">Showcase your painted miniatures</p>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* Paint Inventory Overview */}
      <Card className="glass-morphism">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-cinzel text-2xl font-bold text-orange-500 gothic-shadow">
            Paint Inventory Overview
          </CardTitle>
          <Link href="/inventory">
            <Button className="bg-orange-500 hover:bg-orange-600 text-black">
              <Search className="w-4 h-4 mr-2" />
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-green-500 text-2xl font-bold">{inventoryStats?.inStock || 0}</div>
              <div className="text-white white-text-shadow text-sm">In Stock</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-orange-500 text-2xl font-bold">{inventoryStats?.lowStock || 0}</div>
              <div className="text-white white-text-shadow text-sm">Low Stock</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-red-500 text-2xl font-bold">{inventoryStats?.outOfStock || 0}</div>
              <div className="text-white white-text-shadow text-sm">Out of Stock</div>
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="font-cinzel text-lg font-semibold mb-2">Total Paints in Collection</h3>
            <div className="text-3xl font-bold text-orange-500">{inventoryStats?.total || 0}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}