import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Inventory from "@/pages/inventory";
import Projects from "@/pages/projects";

import Login from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";
import Help from "@/pages/help";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsOfService from "@/pages/terms-of-service";
import AdminDashboard from "@/pages/admin";
import FeedbackPage from "@/pages/feedback";
import { useAuthState } from "@/hooks/useAuth";

import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { Footer } from "@/components/Footer";

function Router() {
  return (
    <div className="min-h-screen bg-forge-dark text-forge-text flex flex-col">
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
