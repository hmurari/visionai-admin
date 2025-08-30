import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/ui/use-toast";
import { DealsListView } from "@/components/DealsListView";
import { DealRegistrationForm } from "@/components/DealRegistrationForm";
import { CustomerForm } from "@/components/CustomerForm";
import { Navigate } from "react-router-dom";
import { Dialog } from "@/components/ui/dialog";

// Import our new hooks and components
import { useDealFilters, useDealStats, useDealManagement, useCSVExport } from "@/hooks";
import { DealFilters, DealStats, DealHeader } from "@/components/deals";

export default function DealRegistration() {
  const { user } = useUser();
  const { toast } = useToast();

  // Get user data to check if admin
  const userData = useQuery(
    api.users.getUserByToken,
    user?.id ? { tokenIdentifier: user.id } : "skip"
  );
  
  const isAdmin = userData?.role === "admin";

  // Get deals based on user role
  const deals = useQuery(
    isAdmin ? api.admin.getAllDeals : api.deals.getDeals,
    user?.id ? (isAdmin ? {} : { userId: user.id }) : "skip"
  ) || [];

  // Get all users for admin to map partner names
  const users = isAdmin ? useQuery(api.admin.getAllUsers) || [] : [];

  // Use our custom hooks
  const filters = useDealFilters({ deals, users, isAdmin });
  const stats = useDealStats({ 
    deals, 
    filteredDeals: filters.filteredDeals, 
    isAdmin 
  });
  const management = useDealManagement();
  const csvExport = useCSVExport({
    filteredDeals: filters.filteredDeals,
    isAdmin,
    getPartnerName: filters.getPartnerName
  });

  // Handle CSV export with toast notifications
  const handleExportCsv = () => {
    try {
      csvExport.handleExportCsv();
      toast({ title: "CSV exported", description: `Exported ${filters.filteredDeals.length} deals` });
    } catch (err) {
      toast({ title: "Export failed", description: "Unable to export CSV", variant: "destructive" });
    }
  };

  // Handle deal click from streamlined view
  const handleDealClick = (dealId: string) => {
    const deal = deals.find(d => d._id === dealId);
    if (deal) {
      management.openEditDealDialog(dealId);
    }
  };

  // Handle customer creation
  const handleCustomerCreated = () => {
    management.closeCustomerForm();
  };

  // Handle successful deal creation/update
  const handleDealSuccess = () => {
    management.closeDealDialog();
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD]">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Header with title and actions */}
          <DealHeader
            isAdmin={isAdmin}
            pipelineStats={stats.pipelineStats}
            dealsCount={deals.length}
            onExportCsv={handleExportCsv}
            onCreateDeal={management.openNewDealDialog}
          />

          {/* Admin Dashboard Stats */}
          <DealStats
            stats={stats.pipelineStats}
            onStatusClick={filters.setSelectedStatus}
          />

          {/* Filters */}
          {deals.length > 0 && (
            <DealFilters
              searchQuery={filters.searchQuery}
              selectedPartner={filters.selectedPartner}
              selectedStatus={filters.selectedStatus}
              uniquePartners={filters.uniquePartners}
              isAdmin={isAdmin}
              getPartnerName={filters.getPartnerName}
              onSearchChange={filters.setSearchQuery}
              onPartnerChange={filters.setSelectedPartner}
              onStatusChange={filters.setSelectedStatus}
              onClearFilters={filters.clearFilters}
              hasActiveFilters={filters.hasActiveFilters}
            />
          )}

          {/* Display filtered deals count */}
          {deals.length > 0 && (
            <div className="text-sm text-gray-500 mb-2">
              Showing {filters.filteredDeals.length} of {deals.length} deals
              {(filters.hasActiveFilters) ? " with filters applied" : ""}
            </div>
          )}
          
          <div className="mt-6">
            {/* Streamlined CRM View */}
            <DealsListView 
              deals={filters.filteredDeals}
              isAdmin={isAdmin}
              getPartnerName={filters.getPartnerName}
              onDealClick={handleDealClick}
            />
          </div>
        </div>
      </main>
      <Footer />

      {/* Deal Registration/Creation Form */}
      {management.isDealFormOpen && (
        <Dialog open={management.isDealFormOpen} onOpenChange={management.closeDealDialog}>
          <DealRegistrationForm
            isOpen={management.isDealFormOpen}
            onClose={management.closeDealDialog}
            editingDeal={management.editingDeal}
            isAdmin={isAdmin}
            onSuccess={handleDealSuccess}
            initialData={management.getInitialDataForDeal(management.editingDeal || "", deals)}
          />
        </Dialog>
      )}

      {/* Customer Form */}
      <CustomerForm
        isOpen={management.customerFormOpen}
        onClose={management.closeCustomerForm}
        onSuccess={handleCustomerCreated}
      />
    </div>
  );
}
