import { Route, Routes, Navigate } from "react-router-dom";
import { useConvexAuth } from "convex/react";
import { useStoreUserEffect } from "./utils/useStoreUserEffect";
import { HelmetProvider } from "react-helmet-async";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import DealRegistration from "./pages/deal-registration";
import PartnerApplication from "./pages/partner-application";
import AdminDashboard from "./pages/admin-dashboard";
import AdminSetup from "./pages/admin-setup";
import { Loader2 } from "lucide-react";
import Quotes from "./pages/quotes";
import AnalyticsDashboard from "./pages/analytics-dashboard";
import { Toaster } from 'sonner';
import Customers from "./pages/customers";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import TasksPage from "./pages/tasks";
import { GoogleAnalytics } from './components/GoogleAnalytics';
import { Button } from "./components/ui/button";
import { UserCreationFallback } from "./components/UserCreationFallback";
import { AuthLoadingState } from "./components/AuthLoadingState";

export default function App() {
  const { isLoading, isAuthenticated, error, retryCount, maxRetries } = useStoreUserEffect();
  const { user } = useUser();
  
  // Get user data to check role
  const userData = useQuery(
    api.users?.getUserByToken,
    user?.id ? { tokenIdentifier: user.id } : "skip"
  );
  
  // Get application status
  const applicationStatus = useQuery(api.partners?.getApplicationStatus);
  
  const isAdmin = userData?.role === "admin";
  const isPartner = userData?.role === "partner";
  const isApprovedPartner = isPartner && 
    (typeof applicationStatus === 'string' ? applicationStatus === "approved" : 
     applicationStatus?.status === "approved");

  // Handle authentication errors
  if (error) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">
          Authentication error. Please try refreshing the page.
        </div>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Refresh Page
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (isAuthenticated && !userData) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <UserCreationFallback />
      </div>
    );
  }

  return (
    <HelmetProvider>
      <div className="min-h-screen">
        <GoogleAnalytics />
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                (isApprovedPartner || isAdmin) ? <AnalyticsDashboard /> : <PartnerApplication />
              : <Home />
            } 
          />
          
          {/* Protected routes - require authentication */}
          <Route
            path="/resources"
            element={
              isAuthenticated ? 
                (isApprovedPartner || isAdmin) ? <Dashboard /> : <PartnerApplication />
              : <Home />
            }
          />

          <Route
            path="/deals"
            element={
              isAuthenticated ? 
                (isApprovedPartner || isAdmin) ? <DealRegistration /> : <PartnerApplication />
              : <Home />
            }
          />

          <Route
            path="/deal-registration"
            element={
              isAuthenticated ? 
                (isApprovedPartner || isAdmin) ? <DealRegistration /> : <PartnerApplication />
              : <Home />
            }
          />
          <Route
            path="/quotes"
            element={
              isAuthenticated ? 
                (isApprovedPartner || isAdmin) ? <Quotes /> : <PartnerApplication />
              : <Home />
            }
          />
          <Route
            path="/partner-application"
            element={
              isAuthenticated ? <PartnerApplication /> : <Home />
            }
          />
          <Route
            path="/admin"
            element={
              isAuthenticated && isAdmin ? <AdminDashboard /> : <Home />
            }
          />
          <Route
            path="/admin-setup"
            element={
              isAuthenticated && isAdmin ? <AdminSetup /> : <Home />
            }
          />
          <Route 
            path="/customers" 
            element={
              isAuthenticated ? 
                (isApprovedPartner || isAdmin) ? <Customers /> : <PartnerApplication />
              : <Home />
            } 
          />
          <Route path="/tasks" element={<TasksPage />} />
          {/* Keep for backward compatibility */}
          <Route
            path="/dashboard"
            element={
              <Navigate to="/" replace />
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </HelmetProvider>
  );
}
