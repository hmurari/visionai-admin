import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { 
  Search, 
  Plus 
} from "lucide-react";
import { toast } from "sonner";
import { CustomerForm } from "@/components/CustomerForm";
import { CustomerList } from "@/components/CustomerList";

export default function CustomersPage() {
  const { isSignedIn, user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  
  // Fetch customers
  const customers = useQuery(api.customers.list) || [];
  
  // Mutations
  const deleteCustomer = useMutation(api.customers.deleteCustomer);
  
  // Filter customers based on search term
  const filteredCustomers = searchTerm 
    ? customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : customers;
  
  // Handle customer form success
  const handleCustomerFormSuccess = (customer: any) => {
    setCustomerFormOpen(false);
    setSelectedCustomer(null);
  };
  
  // Handle edit customer
  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setCustomerFormOpen(true);
  };
  
  // Handle delete customer
  const handleDeleteCustomer = (customerId: string) => {
    setCustomerToDelete(customerId);
    setDeleteDialogOpen(true);
  };
  
  // Confirm delete customer
  const confirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    try {
      await deleteCustomer({ id: customerToDelete });
      toast.success("Customer deleted successfully");
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer");
    } finally {
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };
  
  // Redirect if not signed in
  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }
  
  return (
    <div>
      <Navbar />
      
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Customers</h1>
          <Button onClick={() => setCustomerFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Your Customers</CardTitle>
              <div className="w-1/3">
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                  prefix={<Search className="h-4 w-4 text-gray-400" />}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length > 0 ? (
              <CustomerList 
                customers={filteredCustomers}
                onEdit={handleEditCustomer}
                onDelete={handleDeleteCustomer}
              />
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <Search className="h-12 w-12 mx-auto text-gray-300" />
                </div>
                <h3 className="text-lg font-medium mb-2">No customers found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? "Try adjusting your search" 
                    : "You haven't added any customers yet"}
                </p>
                {searchTerm ? (
                  <Button onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                ) : (
                  <Button onClick={() => setCustomerFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Customer
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Customer Form Dialog */}
      <CustomerForm
        isOpen={customerFormOpen}
        onClose={() => {
          setCustomerFormOpen(false);
          setSelectedCustomer(null);
        }}
        onSuccess={handleCustomerFormSuccess}
        initialData={selectedCustomer}
      />
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCustomer}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 