import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  FolderOpen, 
  Package, 
  CheckCircle, 
  Star,
  Users,
  Zap,
  Shield,
  ArrowRight,
  HelpCircle,
  Heart
} from "lucide-react";
import logoImage from "@assets/ChatGPT Image Jun 9, 2025, 11_03_05 AM_1749502486436.png";

export default function Landing() {
  const features = [
    {
      icon: Palette,
      title: "Comprehensive Paint Database",
      description: "Browse verified paints from all major brands including Army Painter, Vallejo, Citadel, Reaper, Scale75, and Two Thin Coats with authentic hex codes"
    },
    {
      icon: Package,
      title: "Personal Inventory Tracking",
      description: "Track which paints you actually own separately from the full database to avoid duplicate purchases"
    },
    {
      icon: FolderOpen,
      title: "Miniature Showcase",
      description: "Document painted miniatures with photos, detailed paint recipes, techniques, and sharing capabilities"
    }
  ];

  const benefits = [
    "Access verified paints from all major brands with authentic hex codes",
    "Track your personal inventory separately from the comprehensive database",
    "Document miniatures with detailed paint recipes and techniques", 
    "Share completed projects with full paint breakdowns and images",
    "Search and filter across all paint brands instantly",
    "Avoid duplicate purchases by knowing exactly what you own"
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="flex justify-center mb-8">
            <img 
              src={logoImage} 
              alt="The Paint Forge" 
              className="h-96 w-96 object-contain filter brightness-110"
            />
          </div>
          
          <p className="text-xl md:text-2xl text-white white-text-shadow mb-8 leading-relaxed">
            Mange your paint collection and minature painting projects.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-3">
            <Link href="/register">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6">
                Start Tracking for FREE
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-orange-500/30 hover:bg-orange-500/10">
                Already Have an Account?
              </Button>
            </Link>
          </div>
          
          <p className="text-lg text-white white-text-shadow italic">
            Because we already spend enough on our grey pile of shame.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-cinzel text-3xl font-bold mb-4 text-white gothic-shadow">
              Everything You Need to Master Your Paint Collection
            </h2>
            <p className="text-white white-text-shadow text-lg">
              Built by painters, for painters. Every feature designed to solve real problems.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="glass-morphism hover:forge-glow transition-all">
                <CardHeader className="text-center pb-4">
                  <feature.icon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <CardTitle className="font-cinzel text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-white white-text-shadow text-sm text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-background/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-cinzel text-3xl font-bold mb-4 text-white gothic-shadow">
              Why Painters Love The Paint Forge
            </h2>
            <p className="text-white white-text-shadow text-lg">
              The most comprehensive paint database and showcase platform for serious painters
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-background/20">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 green-icon-glow" />
                <span className="text-white white-text-shadow">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-500/10 to-red-500/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-cinzel text-4xl font-bold mb-6 text-white gothic-shadow">
            Ready to Organize Your Paint Collection?
          </h2>
          
          <p className="text-xl text-white white-text-shadow mb-8">
            Join the painting revolution. Start tracking your paints for free today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/register">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6">
                Create Your Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <Link href="/help">
              <Button variant="outline" className="border-orange-500/30 hover:bg-orange-500/10">
                <HelpCircle className="w-4 h-4 mr-2" />
                View Complete Guide & Tutorial
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}