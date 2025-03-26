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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Briefcase, 
  Edit, 
  Trash2, 
  Search, 
  Plus 
} from "lucide-react";
import { toast } from "sonner";
import { CustomerForm } from "@/components/CustomerForm";
import { formatDistanceToNow } from "date-fns";
import { countries } from "@/components/ui/country-select";
import { industries } from "@/components/ui/industry-select";

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
  
  // Inside the component, add these helper functions
  const getCountryName = (code: string) => {
    const country = countries.find(c => c.code === code);
    return country ? `${country.flag} ${country.name}` : code;
  };

  const getIndustryName = (id: string) => {
    const industry = industries.find(i => i.id === id);
    return industry ? industry.name : id;
  };
  
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-gray-400" />
                          {customer.companyName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          {customer.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {customer.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.phone ? (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {customer.phone}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.city || customer.state || customer.country ? (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                            {[
                              customer.city, 
                              customer.state,
                              customer.country ? getCountryName(customer.country) : null
                            ].filter(Boolean).join(", ")}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {customer.industry ? (
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                            {getIndustryName(customer.industry)}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(customer.createdAt, { addSuffix: true })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteCustomer(customer._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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