import { Switch, Route } from "wouter";
import { useEffect } from "react";
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

function Router() {
  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: '#1a1a1a',
        color: '#e5e5e5',
        backgroundImage: 'url(/metallic-background.jpg)',
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
  // Force critical styling for production
  useEffect(() => {
    const applyForceStyles = () => {
      // Create and inject critical styles
      let styleEl = document.getElementById('force-styles');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'force-styles';
        document.head.appendChild(styleEl);
      }
      
      styleEl.textContent = `
        * {
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          border: none !important;
        }
        
        body, html, #root {
          background-color: #1a1a1a !important;
          background-image: url('/metallic-background.jpg') !important;
          background-size: cover !important;
          background-position: center !important;
          background-attachment: fixed !important;
          color: white !important;
          font-family: 'Inter', sans-serif !important;
          min-height: 100vh !important;
          overflow-x: hidden !important;
        }
        
        div, span, p, h1, h2, h3, h4, h5, h6, label, button, input, textarea, select {
          color: white !important;
          text-shadow: 0 0 8px rgba(0, 0, 0, 1), 2px 2px 6px rgba(0, 0, 0, 0.9), 4px 4px 8px rgba(0, 0, 0, 0.8) !important;
        }
        
        .bg-card, .bg-background, .bg-muted, [class*="bg-"] {
          background: rgba(26, 26, 26, 0.95) !important;
          backdrop-filter: blur(10px) !important;
          border: 1px solid rgba(255, 107, 53, 0.2) !important;
        }
        
        button {
          background: rgba(255, 107, 53, 0.9) !important;
          color: white !important;
          border: 1px solid rgba(255, 107, 53, 0.5) !important;
          text-shadow: 0 0 8px rgba(0, 0, 0, 1) !important;
        }
        
        input, textarea, select {
          background: rgba(26, 26, 26, 0.8) !important;
          color: white !important;
          border: 1px solid rgba(255, 107, 53, 0.3) !important;
        }
        
        .text-muted-foreground {
          color: rgba(255, 255, 255, 0.8) !important;
        }
      `;
    };
    
    // Apply immediately and after DOM updates
    applyForceStyles();
    
    // Apply again after a short delay to override any delayed styles
    setTimeout(applyForceStyles, 100);
    setTimeout(applyForceStyles, 500);
    setTimeout(applyForceStyles, 1000);
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
