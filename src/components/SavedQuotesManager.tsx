import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Calendar, 
  Camera, 
  Copy, 
  Download, 
  Eye, 
  ExternalLink, 
  Link, 
  Package, 
  RefreshCw, 
  Share2, 
  Trash2,
  CheckCircle,
  Clock
} from 'lucide-react';
import QuotePreviewV2 from './QuotePreviewV2';
import CustomerCheckoutLink from './quote/CustomerCheckoutLink';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { generatePDF } from '@/utils/pdfUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Quote {
  _id: string;
  userId: string;
  customerName: string;
  companyName: string;
  email: string;
  packageName: string;
  cameraCount: number;
  subscriptionType: string;
  totalAmount: number;
  createdAt: number;
  quoteData: any;
}

interface SavedQuotesManagerProps {
  branding: any;
}

export default function SavedQuotesManager({ branding }: SavedQuotesManagerProps) {
  const { user } = useUser();
  const userId = user?.id;
  
  // State for managing quotes
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [updatedQuote, setUpdatedQuote] = useState<Quote | null>(null);
  
  // Always call these hooks regardless of conditions
  const quotes = useQuery(api.quotes.getQuotes) || [];
  const recentQuotes = useQuery(api.quotes.getRecentQuotes) || [];
  const deleteQuoteMutation = useMutation(api.quotes.deleteQuote);
  
  
  // Filter quotes based on active tab
  const filteredQuotes = useMemo(() => {
    if (activeTab === "recent") {
      return recentQuotes;
    } else {
      return quotes;
    }
  }, [activeTab, quotes, recentQuotes]);
  
  // Format date helper
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  // Get quote status - move this outside of any conditional rendering
  const getQuoteStatusForPayment = (quoteId: string) => {
    return 'pending';
  };
  
  // Handle viewing a quote
  const handleQuoteView = (quote) => {
    setSelectedQuote(quote);
    setQuoteDialogOpen(true);
  };
  
  // Handle quote updates
  const handleQuoteUpdate = (updatedQuoteData) => {
    if (selectedQuote) {
      const updatedQuoteObj = {
        ...selectedQuote,
        quoteData: updatedQuoteData
      };
      setUpdatedQuote(updatedQuoteObj);
    }
  };
  
  // Handle showing checkout link dialog
  const handleShowCheckoutLink = (quote) => {
    setSelectedQuote(quote);
    setCustomerEmail(quote.customerEmail || '');
    setCheckoutDialogOpen(true);
  };
  
  // Handle exporting quote as PDF
  const handleExportQuote = (quote) => {
    if (!quote) return;
    
    // Set the selected quote first to ensure it's rendered
    setSelectedQuote(quote);
    setQuoteDialogOpen(true);
    
    // Use setTimeout to ensure the quote content is rendered before generating PDF
    setTimeout(() => {
      const quoteElement = document.querySelector('.quote-preview-container');
      if (!quoteElement) {
        toast.error("Could not find quote content to export");
        return;
      }
      
      generatePDF(quoteElement, {
        filename: `Quote_${quote.companyName}_${formatDate(quote.createdAt)}`,
        title: `Quote for ${quote.companyName}`,
        subject: `Quote generated on ${formatDate(quote.createdAt)}`,
        author: user?.fullName || 'Partner',
        creator: 'Quote Generator'
      });
      
      toast.success("Quote exported as PDF");
    }, 1000);
  };
  
  // Handle deleting a quote
  const handleDeleteQuote = (quote) => {
    setSelectedQuote(quote);
    setDeleteDialogOpen(true);
  };
  
  // Confirm quote deletion
  const confirmDeleteQuote = async () => {
    if (!selectedQuote) return;
    
    try {
      await deleteQuoteMutation({ id: selectedQuote._id });
      toast.success("Quote deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete quote");
      console.error(error);
    }
  };
  
  // Define table columns
  const columns: ColumnDef<Quote>[] = [
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
          {formatDate(row.original.createdAt)}
        </div>
      ),
    },
    {
      accessorKey: "companyName",
      header: "Company",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.companyName}</div>
          <div className="text-sm text-gray-500">{row.original.customerName}</div>
        </div>
      ),
    },
    {
      accessorKey: "packageName",
      header: "Package",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Package className="h-4 w-4 mr-2 text-gray-500" />
          {row.original.packageName}
        </div>
      ),
    },
    {
      accessorKey: "cameraCount",
      header: "Cameras",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Camera className="h-4 w-4 mr-2 text-gray-500" />
          {row.original.cameraCount}
        </div>
      ),
    },
    {
      accessorKey: "subscriptionType",
      header: "Subscription",
      cell: ({ row }) => {
        const quote = row.original;
        return getSubscriptionName(quote.subscriptionType);
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency(row.original.totalAmount)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const quote = row.original;
        const status = getQuoteStatusForPayment(quote._id);
        
        let icon = <Clock className="h-4 w-4 mr-1" />;
        if (status === 'purchased') {
          icon = <CheckCircle className="h-4 w-4 mr-1" />;
        }
        
        return (
          <Badge variant={status === 'purchased' ? 'default' : status === 'link-sent' ? 'secondary' : 'outline'} className="flex items-center gap-1">
            {icon}
            {status === 'purchased' ? 'Purchased' : status === 'link-sent' ? 'Link Sent' : 'Pending'}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const quote = row.original;
        const status = getQuoteStatusForPayment(quote._id);
        const isPurchased = status === 'purchased';
        
        return (
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isPurchased && (
                  <DropdownMenuItem onClick={() => handleShowCheckoutLink(quote)}>
                    <Link className="h-4 w-4 mr-2" />
                    Generate Payment Link
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleExportQuote(quote)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleQuoteView(quote)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDeleteQuote(quote)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        );
      },
    },
  ];
  
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
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Saved Quotes</CardTitle>
          <CardDescription>
            View and manage your saved quotes
          </CardDescription>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Quotes</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="link-sent">Link Sent</TabsTrigger>
              <TabsTrigger value="purchased">Purchased</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={filteredQuotes} 
            searchColumn="companyName"
          />
        </CardContent>
      </Card>
      
      {/* Dialog for viewing saved quotes */}
      <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedQuote ? `Quote for ${selectedQuote.companyName}` : 'Quote Preview'}
            </DialogTitle>
            <DialogDescription>
              {selectedQuote ? `Created on ${new Date(selectedQuote.createdAt).toLocaleDateString()}` : 'Preview of your generated quote'}
            </DialogDescription>
          </DialogHeader>
          {selectedQuote && (
            <div className="p-4">
              <QuotePreviewV2 
                quoteDetails={{
                  ...selectedQuote.quoteData,
                  _id: selectedQuote._id
                }}
                branding={{}}
                onSave={() => {}}
                onQuoteUpdate={() => {}}
                showPaymentLink={true}
                pdfMode={true}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Checkout link dialog */}
      <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Payment Link</DialogTitle>
            <DialogDescription>
              Create a payment link to send to your customer
            </DialogDescription>
          </DialogHeader>
          {selectedQuote && (
            <CustomerCheckoutLink 
              quoteDetails={selectedQuote} 
              onSuccess={() => {
                setCheckoutDialogOpen(false);
                toast.success("Payment link generated successfully", {
                  description: "You can now share this link with your customer or download the quote with the payment link included.",
                  action: {
                    label: "Download",
                    onClick: () => handleExportQuote(selectedQuote)
                  },
                  duration: 10000,
                });
              }}
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
    </>
  );
} 