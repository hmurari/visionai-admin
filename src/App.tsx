import { Route, Routes } from "react-router-dom";
import { useConvexAuth } from "convex/react";
import { useStoreUserEffect } from "./utils/useStoreUserEffect";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import DealRegistration from "./pages/deal-registration";
import PartnerApplication from "./pages/partner-application";
import AdminDashboard from "./pages/admin-dashboard";
import AdminSetup from "./pages/admin-setup";
import { Loader2 } from "lucide-react";

export default function App() {
  const { isLoading, isAuthenticated } = useStoreUserEffect();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      
      {/* Protected routes - require authentication */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? <Dashboard /> : <Home />
        }
      />
      <Route
        path="/deal-registration"
        element={
          isAuthenticated ? <DealRegistration /> : <Home />
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
          isAuthenticated ? <AdminDashboard /> : <Home />
        }
      />
      <Route
        path="/admin-setup"
        element={
          isAuthenticated ? <AdminSetup /> : <Home />
        }
      />
    </Routes>
  );
}
