import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { DarkModeProvider } from "@/hooks/use-dark-mode";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { NewHomePage } from "@/pages/new-home-page";
import AuthPage from "@/pages/auth-page";
import SimpleAuth from "@/pages/simple-auth";
import { AdminPage } from "@/pages/admin-page";
import { ProfilePage } from "@/pages/profile-page";
import { UserProfilePage } from "@/pages/user-profile-page";
import { SettingsPage } from "@/pages/settings-page";
import { PreferencesPage } from "@/pages/preferences-page";
import { CommunitiesPage } from "@/pages/communities-page";
import { CommunitiesHomePage } from "@/pages/communities-home-page";
import { CommunityPage } from "@/pages/community-page";
import { CommunityManagePage } from "@/pages/community-manage-page";
import { DiscoveryPage } from "@/pages/discovery-page";
import { DiscoveryHomePage } from "@/pages/discovery-home-page";
import { LandingPage } from "@/pages/landing-page";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading CommunityConnect...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      // If user is authenticated and on auth page, redirect to home
      if (user && window.location.pathname === "/auth") {
        setLocation("/");
      }
      // Don't redirect unauthenticated users away from root path (landing page)
      // Only redirect from protected routes
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading Verser...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/auth" component={SimpleAuth} />
      <Route path="/admin" component={() => <ProtectedRoute component={AdminPage} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} />} />
      <Route path="/profile/:id" component={() => <ProtectedRoute component={() => <UserProfilePage />} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={SettingsPage} />} />
      <Route path="/preferences" component={() => <ProtectedRoute component={PreferencesPage} />} />
      <Route path="/communities" component={() => <ProtectedRoute component={CommunitiesPage} />} />
      <Route path="/communities/home" component={() => <ProtectedRoute component={CommunitiesHomePage} />} />
      <Route path="/community/:id" component={() => <ProtectedRoute component={() => <CommunityPage />} />} />
      <Route path="/community/:id/manage" component={() => <ProtectedRoute component={() => <CommunityManagePage />} />} />
      <Route path="/discovery" component={() => <ProtectedRoute component={DiscoveryPage} />} />
      <Route path="/discovery/home" component={() => <ProtectedRoute component={DiscoveryHomePage} />} />
      <Route path="/" component={() => user ? <NewHomePage /> : <LandingPage />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DarkModeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </DarkModeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
