import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import NotFound from "./pages/not-found";
import Landing from "./pages/landing";
import Inventory from "./pages/inventory";
import Projects from "./pages/projects";

import Login from "./pages/login";
import Register from "./pages/register";
import Profile from "./pages/profile";
import Help from "./pages/help";
import PrivacyPolicy from "./pages/privacy-policy";
import TermsOfService from "./pages/terms-of-service";
import AdminDashboard from "./pages/admin";
import FeedbackPage from "./pages/feedback";

import Header from "./components/layout/header";
import BottomNavigation from "./components/layout/bottom-navigation";
import { Footer } from "./components/Footer";
import metallicBackground from "/metallic-background.jpg";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";

function Router() {
  // Track page views when routes change
  useAnalytics();
  
  return (
    <div 
      className="min-h-screen bg-forge-dark text-forge-text flex flex-col"
      style={{
        backgroundImage: `url(${metallicBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <Header />
      <main className="flex-1 pb-20 md:pb-6">
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/projects" component={Projects} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/profile" component={Profile} />
          <Route path="/help" component={Help} />
          <Route path="/feedback" component={FeedbackPage} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/privacy-policy" component={PrivacyPolicy} />
          <Route path="/terms-of-service" component={TermsOfService} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <BottomNavigation />
    </div>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
