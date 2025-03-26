import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle } from "lucide-react";
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
import { Navigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function DealRegistration() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [editingDealData, setEditingDealData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Mutations and queries
  const deleteDeal = useMutation(api.deals.deleteDeal);
  const deals = useQuery(api.deals.getPartnerDeals) || [];
  
  // Open dialog for new deal - directly open the main form
  const openNewDealDialog = () => {
    setIsDialogOpen(true);
    setEditingDeal(null);
    setEditingDealData(null);
  };
  
  // Open dialog for editing a deal
  const openEditDealDialog = (deal) => {
    // Format the deal data for the form
    const formattedDeal = {
      companyName: deal.customerName,
      contactName: deal.contactName,
      contactEmail: deal.customerEmail,
      contactPhone: deal.contactPhone || "",
      customerAddress: deal.customerAddress || "",
      customerCity: deal.customerCity || "",
      customerState: deal.customerState || "",
      customerZip: deal.customerZip || "",
      customerCountry: deal.customerCountry || "",
      opportunityAmount: deal.opportunityAmount.toString(),
      expectedCloseDate: new Date(deal.expectedCloseDate).toISOString().split('T')[0],
      notes: deal.notes || "",
      status: deal.status || "new",
      lastFollowup: deal.lastFollowup ? new Date(deal.lastFollowup).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      cameraCount: deal.cameraCount?.toString() || "",
      interestedUsecases: deal.interestedUsecases || [],
      commissionRate: deal.commissionRate || 20,
    };
    
    setEditingDeal(deal._id);
    setEditingDealData(formattedDeal);
    setIsDialogOpen(true);
  };
  
  // Confirm delete dialog
  const confirmDeleteDeal = (dealId) => {
    setDealToDelete(dealId);
    setDeleteDialogOpen(true);
  };
  
  // Handle delete deal
  const handleDeleteDeal = async () => {
    try {
      await deleteDeal({ id: dealToDelete });
      toast({
        title: "Deal Deleted",
        description: "The deal has been successfully deleted.",
        variant: "success",
      });
      setDeleteDialogOpen(false);
      setDealToDelete(null);
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error.message || "There was an error deleting the deal.",
        variant: "destructive",
      });
    }
  };
  
  // Handle customer creation
  const handleCustomerCreated = (customer) => {
    setCustomerFormOpen(false);
    // No need to do anything else here, as the user can select the customer in the form
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
              <h1 className="text-3xl font-bold mb-2">Deal Registration</h1>
              <p className="text-gray-600">
                Register and track your deals with Visionify
              </p>
            </div>
            <Button 
              onClick={openNewDealDialog}
              className="flex items-center"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Register New Deal
            </Button>
          </div>
          
          <div className="mt-6">
            <div className="grid gap-6">
              {deals.length > 0 ? (
                deals.map(deal => (
                  <DealCard 
                    key={deal._id}
                    deal={deal}
                    isAdmin={false}
                    refreshDeals={() => {}}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg border">
                  <div className="mb-4">
                    <PlusCircle className="h-12 w-12 mx-auto text-gray-300" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No deals registered yet</h3>
                  <p className="text-gray-500 mb-4">Register your first deal to start tracking opportunities</p>
                  <Button onClick={openNewDealDialog}>
                    Register Your First Deal
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Deal Registration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DealRegistrationForm 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          editingDeal={editingDeal}
          initialData={editingDealData}
          onSuccess={() => {
            setIsDialogOpen(false);
            setEditingDeal(null);
            setEditingDealData(null);
          }}
        />
      </Dialog>
      
      {/* Customer Form Dialog */}
      <CustomerForm
        isOpen={customerFormOpen}
        onClose={() => setCustomerFormOpen(false)}
        onSuccess={handleCustomerCreated}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this deal?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the deal and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDeal} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
    </div>
  );
} 