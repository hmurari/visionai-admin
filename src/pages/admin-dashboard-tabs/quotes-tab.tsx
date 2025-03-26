import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
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
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Package, 
  Camera, 
  Eye, 
  Trash2, 
  Search, 
  Users, 
  Building,
  X,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import QuotePreview from "@/components/QuotePreview";
import { pricingData } from "@/data/pricing";
import { SearchWithResults } from "@/components/SearchWithResults";

export function QuotesTab() {
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<any[]>([]);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);

  // Fetch all quotes and users
  const allQuotes = useQuery(api.admin.getAllQuotes) || [];
  const allUsers = useQuery(api.admin.getAllUsers) || [];
  const deleteQuote = useMutation(api.admin.deleteQuote);

  // Create a map of user IDs to user names
  const userMap = useMemo(() => {
    const map: Record<string, { name: string, companyName: string }> = {};
    allUsers.forEach(user => {
      if (user.tokenIdentifier) {
        map[user.tokenIdentifier] = {
          name: user.name || "Unknown",
          companyName: user.companyName || "Unknown Company"
        };
      }
    });
    return map;
  }, [allUsers]);

  // Get user display name
  const getUserName = (quote: any) => {
    // First try to get from the embedded user info in quoteData
    if (quote.quoteData && quote.quoteData._userInfo) {
      const userInfo = quote.quoteData._userInfo;
      return userInfo.companyName || userInfo.name || "Unknown";
    }
    
    // Fall back to the user map if available
    if (userMap[quote.userId]) {
      return userMap[quote.userId].companyName || userMap[quote.userId].name;
    }
    
    // If all else fails
    return "Unknown User";
  };

  // Get unique users from quotes with proper names
  const uniqueUsers = useMemo(() => {
    const userSet = new Map<string, {id: string, name: string, type: string}>();
    
    allQuotes.forEach(quote => {
      const userId = quote.userId;
      const userName = getUserName(quote);
      
      // Only add if we have a valid user name (not "Unknown User")
      if (userName !== "Unknown User") {
        userSet.set(userId, {
          id: userId,
          name: userName,
          type: 'reseller'
        });
      }
    });
    
    return Array.from(userSet.values());
  }, [allQuotes]);

  // Get unique customers from quotes
  const uniqueCustomers = useMemo(() => {
    const customers = new Set<string>();
    allQuotes.forEach(quote => {
      customers.add(quote.companyName);
    });
    return Array.from(customers).map(companyName => ({
      name: companyName,
      type: 'customer'
    }));
  }, [allQuotes]);

  // Filter quotes based on selected filters
  const filteredQuotes = useMemo(() => {
    return allQuotes.filter(quote => {
      if (selectedFilters.length === 0) return true;
      
      return selectedFilters.some(filter => {
        if (filter.type === 'reseller' && quote.userId === filter.id) {
          return true;
        } else if (filter.type === 'customer' && quote.companyName === filter.name) {
          return true;
        }
        return false;
      });
    });
  }, [allQuotes, selectedFilters]);

  // Get search results
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    
    const resellerResults = uniqueUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const customerResults = uniqueCustomers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return [...resellerResults, ...customerResults];
  }, [searchTerm, uniqueUsers, uniqueCustomers]);

  // Handle selection from search
  const handleSearchSelect = (item: any) => {
    // Check if already selected
    const isAlreadySelected = selectedFilters.some(filter => {
      if (filter.type === 'reseller' && item.type === 'reseller') {
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
  const clearSelection = (item?: any, clearAll = false) => {
    if (clearAll || !item) {
      setSelectedFilters([]);
    } else {
      setSelectedFilters(selectedFilters.filter(filter => {
        if (filter.type === 'reseller' && item.type === 'reseller') {
          return filter.id !== item.id;
        } else if (filter.type === 'customer' && item.type === 'customer') {
          return filter.name !== item.name;
        }
        return true;
      }));
    }
  };

  // Get label for search result
  const getResultLabel = (item: any) => {
    if (item.type === 'reseller') {
      return item.name;
    } else if (item.type === 'customer') {
      return item.name;
    }
    return "";
  };

  // Get type of search result
  const getResultType = (item: any) => item.type;

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get subscription name
  const getSubscriptionName = (type: string) => {
    switch(type) {
      case 'monthly': return 'Monthly';
      case 'yearly': return '1 Year';
      case 'threeYear': return '3 Year';
      default: return type;
    }
  };

  // Handle viewing a quote
  const handleViewQuote = (quote: any) => {
    setSelectedQuote(quote);
    setQuoteDialogOpen(true);
  };

  // Handle deleting a quote
  const handleDeleteQuote = (quoteId: string) => {
    setQuoteToDelete(quoteId);
    setDeleteDialogOpen(true);
  };

  // Confirm delete quote
  const confirmDeleteQuote = async () => {
    if (!quoteToDelete) return;
    
    try {
      await deleteQuote({ id: quoteToDelete });
      toast.success("Quote deleted successfully");
      setDeleteDialogOpen(false);
      setQuoteToDelete(null);
    } catch (error) {
      console.error("Error deleting quote:", error);
      toast.error("Failed to delete quote");
    }
  };

  // Get branding info for quote preview
  const branding = {
    companyName: "Visionify",
    logo: "/logo-color.png",
    primaryColor: "#3B82F6",
    secondaryColor: "#ffffff",
    fontFamily: "'Inter', sans-serif"
  };

  return (
    <div className="space-y-6">
      {/* Search and filter section */}
      <div className="bg-white p-4 rounded-lg border mb-4">
        <SearchWithResults
          placeholder="Search by reseller or customer..."
          onSearch={setSearchTerm}
          onSelect={handleSearchSelect}
          selectedItems={selectedFilters}
          getResultLabel={getResultLabel}
          getResultType={getResultType}
          results={searchResults}
          resultGroups={[
            { 
              type: 'reseller', 
              label: 'Resellers', 
              icon: <Building className="h-4 w-4 mr-2 text-gray-500" /> 
            },
            { 
              type: 'customer', 
              label: 'Customers', 
              icon: <Users className="h-4 w-4 mr-2 text-gray-500" /> 
            }
          ]}
          clearSelection={clearSelection}
        />
        
        {/* Show reseller quick filters */}
        {uniqueUsers.length > 0 && selectedFilters.length === 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-500 mb-2">Quick filters:</p>
            <div className="flex flex-wrap gap-2">
              {uniqueUsers.slice(0, 10).map(user => (
                <Badge 
                  key={user.id}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer"
                  onClick={() => handleSearchSelect(user)}
                >
                  {user.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Display filtered quotes count */}
      <div className="text-sm text-gray-500 mb-2">
        Showing {filteredQuotes.length} of {allQuotes.length} quotes
        {selectedFilters.length > 0 && " with selected filters"}
      </div>
      
      {/* Quotes table */}
      <Card>
        <CardHeader>
          <CardTitle>All Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredQuotes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reseller</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Cameras</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map(quote => (
                  <TableRow key={quote._id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        {formatDate(quote.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{getUserName(quote)}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quote.companyName}</div>
                        <div className="text-sm text-gray-500">{quote.customerName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2 text-gray-500" />
                        {quote.packageName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Camera className="h-4 w-4 mr-2 text-gray-500" />
                        {quote.cameraCount}
                      </div>
                    </TableCell>
                    <TableCell>{getSubscriptionName(quote.subscriptionType)}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(quote.totalAmount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewQuote(quote)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteQuote(quote._id)}
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
              <h3 className="text-lg font-medium mb-2">No quotes found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedFilters.length > 0 
                  ? "Try adjusting your search or filters" 
                  : "No quotes have been created yet"}
              </p>
              {(searchTerm || selectedFilters.length > 0) && (
                <Button onClick={() => clearSelection(null, true)}>
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Dialog for viewing quotes */}
      <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedQuote && (
            <QuotePreview 
              quoteDetails={selectedQuote.quoteData} 
              branding={branding}
              pricingData={pricingData}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Quote</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this quote? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteQuote}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QuotesTab; 