import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Package, FolderOpen } from "lucide-react";

export default function BottomNavigation() {
  const [location] = useLocation();

  const navigation = [
    { href: "/inventory", icon: Package, label: "Inventory" },
    { href: "/projects", icon: FolderOpen, label: "Projects" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="glass-morphism border-t border-orange-500/20 fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="flex justify-around py-3">
        {navigation.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 h-auto py-2 px-3 transition-colors ${
                isActive(href) 
                  ? "text-orange-500" 
                  : "text-muted-foreground hover:text-orange-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  );
}
