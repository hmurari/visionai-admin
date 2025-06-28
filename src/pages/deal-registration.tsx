import { useState, useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, Building, Users, SearchX, LayoutGrid, LayoutList } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DealCard } from "@/components/DealCard";
import { DealRegistrationForm } from "@/components/DealRegistrationForm";
import { CustomerSearch } from "@/components/CustomerSearch";
import { CustomerForm } from "@/components/CustomerForm";
import { DealsListView } from "@/components/DealsListView";
import { Navigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SearchWithResults } from "../components/SearchWithResults";

export default function DealRegistration() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isDealFormOpen, setIsDealFormOpen] = useState(false);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [viewType, setViewType] = useState<"streamlined" | "detailed">("streamlined");

  // Search and filtering state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);

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

  // Create a map of partner IDs to partner names (admin only)
  const partnerMap = useMemo(() => {
    if (!isAdmin) return {};
    const map = {};
    users.forEach(user => {
      if (user.tokenIdentifier) {
        map[user.tokenIdentifier] = {
          name: user.name || "Unknown",
          companyName: user.companyName || "Unknown Company"
        };
      }
    });
    return map;
  }, [users, isAdmin]);

  // Helper function to get partner name from partnerId
  const getPartnerName = (partnerId) => {
    if (!users) return "Loading...";
    const partner = users.find(user => user.tokenIdentifier === partnerId);
    if (!partner) return "Unknown Partner";
    
    // Show both company name and contact name for better identification
    const companyName = partner.companyName || "Unknown Company";
    const contactName = partner.name || "Unknown Contact";
    return `${companyName} - ${contactName}`;
  };

  // Get unique partners from deals (admin only)
  const uniquePartners = useMemo(() => {
    if (!isAdmin) return [];
    const partners = new Set();
    deals.forEach(deal => {
      if (deal.partnerId) {
        partners.add(deal.partnerId);
      }
    });
    
    const partnerList = Array.from(partners).map(partnerId => ({
      id: partnerId,
      type: 'partner'
    }));
    
    // Add unassigned option if there are unassigned deals
    const hasUnassignedDeals = deals.some(deal => !deal.partnerId);
    if (hasUnassignedDeals) {
      partnerList.unshift({
        id: 'unassigned',
        type: 'partner'
      });
    }
    
    return partnerList;
  }, [deals, isAdmin]);

  // Get unique customers from deals
  const uniqueCustomers = useMemo(() => {
    const customers = new Set();
    deals.forEach(deal => {
      customers.add(deal.customerName);
    });
    return Array.from(customers).map(customerName => ({
      name: customerName,
      type: 'customer'
    }));
  }, [deals]);

  // Filter deals based on selected filters 
  const filteredDeals = useMemo(() => {
    let filtered = deals;
    
    // Filter by selected partners/customers
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(deal => {
        return selectedFilters.some(filter => {
          if (filter.type === 'partner') {
            if (filter.id === 'unassigned') {
              return !deal.partnerId;
            }
            return deal.partnerId === filter.id;
          } else if (filter.type === 'customer' && deal.customerName === filter.name) {
            return true;
          }
          return false;
        });
      });
    }
    
    return filtered;
  }, [deals, selectedFilters, isAdmin]);

  // Get search results
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    
    const results = [];
    
    // Add partner results for admin
    if (isAdmin) {
      const partnerResults = uniquePartners.filter(partner => {
        const name = partner.id === 'unassigned' ? 'Unassigned' : getPartnerName(partner.id);
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
      results.push(...partnerResults);
    }
    
    // Add customer results
    const customerResults = uniqueCustomers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    results.push(...customerResults);
    
    return results;
  }, [searchTerm, uniquePartners, uniqueCustomers, getPartnerName, isAdmin]);

  // Handle selection from search
  const handleSearchSelect = (item) => {
    const isAlreadySelected = selectedFilters.some(filter => {
      if (filter.type === 'partner' && item.type === 'partner') {
        return filter.id === item.id;
      } else if (filter.type === 'customer' && item.type === 'customer') {
        return filter.name === item.name;
      }
      return false;
    });
    
    if (!isAlreadySelected) {
      setSelectedFilters([...selectedFilters, item]);
    }
  };

  // Clear selection
  const clearSelection = (item, clearAll = false) => {
    if (clearAll) {
      setSelectedFilters([]);
    } else {
      setSelectedFilters(selectedFilters.filter(filter => {
        if (filter.type === 'partner' && item.type === 'partner') {
          return filter.id !== item.id;
        } else if (filter.type === 'customer' && item.type === 'customer') {
          return filter.name !== item.name;
        }
        return true;
      }));
    }
  };

  // Get label for search result
  const getResultLabel = (item) => {
    if (item.type === 'partner') {
      return item.id === 'unassigned' ? 'Unassigned Deals' : getPartnerName(item.id);
    } else if (item.type === 'customer') {
      return item.name;
    }
    return "";
  };

  // Get type of search result
  const getResultType = (item) => item.type;

  // Get icon for search result
  const getResultIcon = (item) => {
    if (item.type === 'partner') {
      return <Building className="h-4 w-4 mr-2 text-gray-500" />;
    } else if (item.type === 'customer') {
      return <Users className="h-4 w-4 mr-2 text-gray-500" />;
    }
    return null;
  };

  // Count deals by assignment status (admin only)
  const assignmentStats = useMemo(() => {
    if (!isAdmin) return null;
    const assigned = deals.filter(deal => deal.partnerId).length;
    const unassigned = deals.filter(deal => !deal.partnerId).length;
    return { assigned, unassigned, total: deals.length };
  }, [deals, isAdmin]);

  // Handle opening new deal dialog
  const openNewDealDialog = () => {
    setEditingDeal(null);
    setIsDealFormOpen(true);
  };

  // Handle editing deal
  const handleEditDeal = (dealId) => {
    setEditingDeal(dealId);
    setIsDealFormOpen(true);
  };

  // Handle deal click from streamlined view
  const handleDealClick = (dealId) => {
    // Find the deal object to pass its data
    const deal = deals.find(d => d._id === dealId);
    if (deal) {
      setEditingDeal(dealId);
      setIsDealFormOpen(true);
    }
  };

  // Get initial data for editing deal
  const getInitialDataForDeal = (dealId) => {
    const deal = deals.find(d => d._id === dealId);
    if (!deal) return null;
    
    return {
      companyName: deal.customerName,
      contactName: deal.contactName,
      contactEmail: deal.customerEmail,
      contactPhone: deal.customerPhone || "",
      customerAddress: deal.customerAddress || "",
      customerCity: deal.customerCity || "",
      customerState: deal.customerState || "",
      customerZip: deal.customerZip || "",
      customerCountry: deal.customerCountry || "",
      opportunityAmount: deal.opportunityAmount.toString(),
      commissionRate: deal.commissionRate || 20,
      expectedCloseDate: new Date(deal.expectedCloseDate).toISOString().split('T')[0],
      lastFollowup: deal.lastFollowup ? new Date(deal.lastFollowup).toISOString().split('T')[0] : "",
      notes: deal.notes || "",
      status: deal.status || "new",
      cameraCount: deal.cameraCount?.toString() || "",
      interestedUsecases: deal.interestedUsecases || [],
      partnerId: deal.partnerId || "",
      assignmentNotes: deal.assignmentNotes || "",
    };
  };

  // Handle customer creation
  const handleCustomerCreated = (customer) => {
    setCustomerFormOpen(false);
  };

  // Handle successful deal creation/update
  const handleDealSuccess = () => {
    setIsDealFormOpen(false);
    setEditingDeal(null);
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD]">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isAdmin ? "Deal Management" : "Deal Registration"}
              </h1>
              <p className="text-gray-600">
                {isAdmin 
                  ? "Manage and assign deals across all partners" 
                  : "Register and track your deals with Visionify"
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              {deals.length > 0 && (
                <div className="flex items-center space-x-2 border rounded-lg p-1">
                  <Button
                    variant={viewType === "streamlined" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewType("streamlined")}
                    className="h-8"
                  >
                    CRM View
                  </Button>
                  <Button
                    variant={viewType === "detailed" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewType("detailed")}
                    className="h-8"
                  >
                    Full Details
                  </Button>
                </div>
              )}
              
              <Button 
                onClick={openNewDealDialog}
                className="flex items-center"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {isAdmin ? "Create New Deal" : "Register New Deal"}
              </Button>
            </div>
          </div>

          {/* Admin Dashboard Stats */}
          {isAdmin && assignmentStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{assignmentStats.total}</div>
                  <p className="text-xs text-muted-foreground">Total Deals</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{assignmentStats.assigned}</div>
                  <p className="text-xs text-muted-foreground">Assigned to Partners</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-orange-600">{assignmentStats.unassigned}</div>
                  <p className="text-xs text-muted-foreground">Unassigned Deals</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search and Filtering */}
          {deals.length > 0 && (
            <div className="bg-white p-4 rounded-lg border mb-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex-1">
                  <SearchWithResults
                    placeholder={isAdmin ? "Search by partner or customer..." : "Search by customer..."}
                    onSearch={setSearchTerm}
                    onSelect={handleSearchSelect}
                    selectedItems={selectedFilters}
                    getResultLabel={getResultLabel}
                    getResultType={getResultType}
                    getResultIcon={getResultIcon}
                    results={searchResults}
                    resultGroups={[
                      ...(isAdmin ? [{ 
                        type: 'partner', 
                        label: 'Partners', 
                        icon: <Building className="h-4 w-4 mr-2 text-gray-500" /> 
                      }] : []),
                      { 
                        type: 'customer', 
                        label: 'Customers', 
                        icon: <Users className="h-4 w-4 mr-2 text-gray-500" /> 
                      }
                    ]}
                    clearSelection={clearSelection}
                  />
                </div>
              </div>
              
              {/* Quick filters (admin only) */}
              {isAdmin && uniquePartners.length > 0 && selectedFilters.length === 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-500 mb-2">Quick filters:</p>
                  <div className="flex flex-wrap gap-2">
                    {uniquePartners.map(partner => (
                      <Badge 
                        key={partner.id}
                        className={`cursor-pointer transition-colors ${
                          partner.id === 'unassigned' 
                            ? 'bg-orange-100 hover:bg-orange-200 text-orange-800' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                        }`}
                        onClick={() => handleSearchSelect(partner)}
                      >
                        {partner.id === 'unassigned' ? 'Unassigned' : getPartnerName(partner.id)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Display filtered deals count */}
          {deals.length > 0 && (
            <div className="text-sm text-gray-500 mb-2">
              Showing {filteredDeals.length} of {deals.length} deals
              {selectedFilters.length > 0 ? " with selected filters" : ""}
            </div>
          )}
          
          <div className="mt-6">
            {/* Streamlined CRM View */}
            {viewType === "streamlined" ? (
              <DealsListView 
                deals={filteredDeals}
                isAdmin={isAdmin}
                getPartnerName={getPartnerName}
                onDealClick={handleDealClick}
              />
            ) : (
              /* Original Detailed View with DealCard components */
              <div className="grid gap-6">
                {filteredDeals.length > 0 ? (
                  filteredDeals.map(deal => (
                    <DealCard 
                      key={deal._id}
                      deal={deal}
                      isAdmin={isAdmin}
                      onPartnerClick={isAdmin ? handleSearchSelect : null}
                      getPartnerName={isAdmin ? getPartnerName : null}
                      refreshDeals={() => {}} // Deals will auto-refresh via Convex
                    />
                  ))
                ) : deals.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <div className="mb-4">
                      <PlusCircle className="h-12 w-12 mx-auto text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      {isAdmin ? "No deals found" : "No deals registered yet"}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {isAdmin 
                        ? "No deals have been registered by any partners yet" 
                        : "Register your first deal to start tracking opportunities"
                      }
                    </p>
                    <Button onClick={openNewDealDialog}>
                      {isAdmin ? "Create First Deal" : "Register Your First Deal"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <div className="mb-4">
                      <SearchX className="h-12 w-12 mx-auto text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No deals found</h3>
                    <p className="text-gray-500 mb-4">
                      Try adjusting your search or filters
                    </p>
                    <Button onClick={() => clearSelection(null, true)}>
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Deal Registration/Creation Form */}
      {isDealFormOpen && (
        <Dialog open={isDealFormOpen} onOpenChange={setIsDealFormOpen}>
          <DealRegistrationForm
            isOpen={isDealFormOpen}
            onClose={() => setIsDealFormOpen(false)}
            editingDeal={editingDeal}
            isAdmin={isAdmin}
            onSuccess={handleDealSuccess}
            initialData={getInitialDataForDeal(editingDeal)}
          />
        </Dialog>
      )}

      {/* Customer Form */}
      <CustomerForm
        isOpen={customerFormOpen}
        onClose={() => setCustomerFormOpen(false)}
        onSuccess={handleCustomerCreated}
      />
    </div>
  );
} 