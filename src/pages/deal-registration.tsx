import { useState, useMemo } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, SearchX, Search, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";

export default function DealRegistration() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isDealFormOpen, setIsDealFormOpen] = useState(false);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  // Filtering state
  const [selectedPartner, setSelectedPartner] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);

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



  // Filter deals based on selected filters and search query
  const filteredDeals = useMemo(() => {
    let filtered = deals;
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(deal => {
        // Search in customer name
        const customerMatch = deal.customerName?.toLowerCase().includes(query);
        
        // Search in contact name
        const contactMatch = deal.contactName?.toLowerCase().includes(query);
        
        // Search in reseller name (for admin users)
        let resellerMatch = false;
        if (isAdmin && deal.partnerId) {
          const partnerName = getPartnerName(deal.partnerId);
          resellerMatch = partnerName.toLowerCase().includes(query);
        }
        
        return customerMatch || contactMatch || resellerMatch;
      });
    }
    
    // Filter by partner
    if (selectedPartner !== "all") {
      if (selectedPartner === "unassigned") {
        filtered = filtered.filter(deal => !deal.partnerId);
      } else {
        filtered = filtered.filter(deal => deal.partnerId === selectedPartner);
      }
    }
    
    // Apply status filtering  
    if (selectedStatus !== "all") {
      filtered = filtered.filter(deal => deal.status === selectedStatus);
    }
    
    return filtered;
  }, [deals, selectedPartner, selectedStatus, searchQuery, isAdmin, getPartnerName]);

  // Calculate pipeline overview statistics (admin only) - excludes status filtering
  const pipelineStats = useMemo(() => {
    if (!isAdmin) return null;
    
    // Only apply partner and search filtering, NOT status filtering
    let dealsForStats = [...deals];
    
    // Apply search filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      dealsForStats = dealsForStats.filter(deal => {
        const customerMatch = deal.customerName.toLowerCase().includes(query);
        const contactMatch = deal.contactName?.toLowerCase().includes(query);
        let resellerMatch = false;
        if (isAdmin && deal.partnerId) {
          const partnerName = getPartnerName(deal.partnerId);
          resellerMatch = partnerName.toLowerCase().includes(query);
        }
        return customerMatch || contactMatch || resellerMatch;
      });
    }
    
    // Apply partner filtering
    if (selectedPartner !== "all") {
      if (selectedPartner === "unassigned") {
        dealsForStats = dealsForStats.filter(deal => !deal.partnerId);
      } else {
        dealsForStats = dealsForStats.filter(deal => deal.partnerId === selectedPartner);
      }
    }
    
    // Calculate stats by status
    const newDeals = dealsForStats.filter(deal => deal.status === "new");
    const firstCallDeals = dealsForStats.filter(deal => deal.status === "1st_call");
    const twoPlusCallsDeals = dealsForStats.filter(deal => deal.status === "2plus_calls");
    const approvedDeals = dealsForStats.filter(deal => deal.status === "approved");
    const wonDeals = dealsForStats.filter(deal => deal.status === "won");
    const lostDeals = dealsForStats.filter(deal => deal.status === "lost");
    
    // Calculate amounts
    const newAmount = newDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
    const firstCallAmount = firstCallDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
    const twoPlusCallsAmount = twoPlusCallsDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
    const approvedAmount = approvedDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
    const wonAmount = wonDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
    const lostAmount = lostDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
    
    return { 
      new: newDeals.length,
      firstCall: firstCallDeals.length,
      twoPlusCalls: twoPlusCallsDeals.length,
      approved: approvedDeals.length,
      won: wonDeals.length,
      lost: lostDeals.length,
      total: dealsForStats.length,
      newAmount,
      firstCallAmount,
      twoPlusCallsAmount,
      approvedAmount,
      wonAmount,
      lostAmount,
      totalAmount: newAmount + firstCallAmount + twoPlusCallsAmount + approvedAmount + wonAmount + lostAmount
    };
  }, [deals, selectedPartner, searchQuery, isAdmin, getPartnerName]);

  // Calculate filtered deal statistics (admin only)
  const filteredStats = useMemo(() => {
    if (!isAdmin) return null;
    
    const newDeals = filteredDeals.filter(deal => deal.status === "new");
    const firstCallDeals = filteredDeals.filter(deal => deal.status === "1st_call");
    const twoPlusCallsDeals = filteredDeals.filter(deal => deal.status === "2plus_calls");
    const approvedDeals = filteredDeals.filter(deal => deal.status === "approved");
    const wonDeals = filteredDeals.filter(deal => deal.status === "won");
    const lostDeals = filteredDeals.filter(deal => deal.status === "lost");
    
    // Calculate amounts
    const newAmount = newDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
    const firstCallAmount = firstCallDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
    const twoPlusCallsAmount = twoPlusCallsDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
    const approvedAmount = approvedDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
    const wonAmount = wonDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
    const lostAmount = lostDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
    
    return { 
      new: newDeals.length,
      firstCall: firstCallDeals.length,
      twoPlusCalls: twoPlusCallsDeals.length,
      approved: approvedDeals.length,
      won: wonDeals.length,
      lost: lostDeals.length,
      total: filteredDeals.length,
      newAmount,
      firstCallAmount,
      twoPlusCallsAmount,
      approvedAmount,
      wonAmount,
      lostAmount,
      totalAmount: newAmount + firstCallAmount + twoPlusCallsAmount + approvedAmount + wonAmount + lostAmount
    };
  }, [filteredDeals, isAdmin]);

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

  // Utility function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
          {isAdmin && pipelineStats && (
            <div className="grid grid-cols-1 gap-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card 
                  className="bg-slate-50 border-slate-200 cursor-pointer hover:shadow-md hover:border-slate-300 transition-all duration-200"
                  onClick={() => setSelectedStatus("new")}
                  title="Click to filter by New deals"
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-lg font-bold text-slate-600">{pipelineStats.new}</div>
                    <div className="text-sm font-semibold text-slate-500">{formatCurrency(pipelineStats.newAmount)}</div>
                    <div className="text-xs text-slate-400 mt-1">New</div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="bg-blue-50 border-blue-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
                  onClick={() => setSelectedStatus("1st_call")}
                  title="Click to filter by 1st Call deals"
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-lg font-bold text-blue-600">{pipelineStats.firstCall}</div>
                    <div className="text-sm font-semibold text-blue-500">{formatCurrency(pipelineStats.firstCallAmount)}</div>
                    <div className="text-xs text-blue-400 mt-1">1st Call</div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="bg-indigo-50 border-indigo-200 cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all duration-200"
                  onClick={() => setSelectedStatus("2plus_calls")}
                  title="Click to filter by 2+ Calls deals"
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-lg font-bold text-indigo-600">{pipelineStats.twoPlusCalls}</div>
                    <div className="text-sm font-semibold text-indigo-500">{formatCurrency(pipelineStats.twoPlusCallsAmount)}</div>
                    <div className="text-xs text-indigo-400 mt-1">2+ Calls</div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="bg-purple-50 border-purple-200 cursor-pointer hover:shadow-md hover:border-purple-300 transition-all duration-200"
                  onClick={() => setSelectedStatus("approved")}
                  title="Click to filter by Approved deals"
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-lg font-bold text-purple-600">{pipelineStats.approved}</div>
                    <div className="text-sm font-semibold text-purple-500">{formatCurrency(pipelineStats.approvedAmount)}</div>
                    <div className="text-xs text-purple-400 mt-1">Approved</div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="bg-green-50 border-green-200 cursor-pointer hover:shadow-md hover:border-green-300 transition-all duration-200"
                  onClick={() => setSelectedStatus("won")}
                  title="Click to filter by Won deals"
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-lg font-bold text-green-600">{pipelineStats.won}</div>
                    <div className="text-sm font-semibold text-green-500">{formatCurrency(pipelineStats.wonAmount)}</div>
                    <div className="text-xs text-green-400 mt-1">Won</div>
                  </CardContent>
                </Card>
                
                <Card 
                  className="bg-red-50 border-red-200 cursor-pointer hover:shadow-md hover:border-red-300 transition-all duration-200"
                  onClick={() => setSelectedStatus("lost")}
                  title="Click to filter by Lost deals"
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-lg font-bold text-red-600">{pipelineStats.lost}</div>
                    <div className="text-sm font-semibold text-red-500">{formatCurrency(pipelineStats.lostAmount)}</div>
                    <div className="text-xs text-red-400 mt-1">Lost</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Filters */}
          {deals.length > 0 && (
            <div className="bg-white p-4 rounded-lg border mb-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Search Bar */}
                <div className="flex flex-col space-y-2 min-w-[400px]">
                  <Label className="text-sm font-medium">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search by customer, contact, or reseller name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Partner Filter */}
                {isAdmin && (
                  <div className="flex flex-col space-y-2 min-w-[200px]">
                    <Label className="text-sm font-medium">Partner/Reseller</Label>
                    <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Partners" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Partners</SelectItem>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {uniquePartners
                          .filter(partner => partner.id !== 'unassigned')
                          .map(partner => (
                          <SelectItem key={String(partner.id)} value={String(partner.id)}>
                            {getPartnerName(partner.id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Status Filter */}
                <div className="flex flex-col space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="1st_call">1st Call</SelectItem>
                      <SelectItem value="2plus_calls">2+ Calls</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Clear Filters */}
                {(selectedPartner !== "all" || selectedStatus !== "all" || searchQuery.trim()) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPartner("all");
                      setSelectedStatus("all");
                      setSearchQuery("");
                    }}
                    className="mt-6 sm:mt-6"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Display filtered deals count */}
          {deals.length > 0 && (
            <div className="text-sm text-gray-500 mb-2">
              Showing {filteredDeals.length} of {deals.length} deals
              {(selectedPartner !== "all" || selectedStatus !== "all" || searchQuery.trim()) ? " with filters applied" : ""}
            </div>
          )}
          
          <div className="mt-6">
            {/* Streamlined CRM View */}
            <DealsListView 
              deals={filteredDeals}
              isAdmin={isAdmin}
              getPartnerName={getPartnerName}
              onDealClick={handleDealClick}
            />
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