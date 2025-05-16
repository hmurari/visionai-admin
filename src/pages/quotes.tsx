import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, FileText, Eye, Calendar, Package, Camera, Trash2 } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import StaticPricingTable from '@/components/StaticPricingTable';
import { pricingData } from '@/data/pricing';
import { currencyOptions } from '@/utils/currencyUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import QuotePreviewV2 from '@/components/QuotePreviewV2';
import { generatePDF } from '@/utils/pdfUtils';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import QuoteGeneratorV2 from '@/components/QuoteGeneratorV2';
import { pricingDataV2 } from '@/data/pricing_v2';
import { Badge } from "@/components/ui/badge";
import SavedQuotesManager from '@/components/SavedQuotesManager';

// Define the Quote type
interface Quote {
  _id: string;
  _creationTime: number;
  customerName: string;
  companyName: string;
  email: string;
  totalAmount: number;
  cameraCount: number;
  packageName: string;
  subscriptionType: string;
  deploymentType: string;
  quoteData: any;
  createdAt: number;
}

export default function Quotes() {
    const { isSignedIn, user } = useUser();
    const [primaryCurrency, setPrimaryCurrency] = useState('USD');
    const [showSecondCurrency, setShowSecondCurrency] = useState(false);
    const [activeTab, setActiveTab] = useState('pricing');
    const pricingTableRef = useRef<HTMLDivElement>(null);
    const [quoteDetails, setQuoteDetails] = useState<any>(null);
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [quoteToDelete, setQuoteToDelete] = useState<string | null>(null);
    const [updatedQuote, setUpdatedQuote] = useState<any>(null);
    
    // Fetch saved quotes
    const savedQuotes = useQuery(api.quotes.getQuotes) || [];
    
    // Fetch subscriptions
    const subscriptions = useQuery(api.subscriptions.getPartnerSubscriptions, { 
      partnerId: user?.id 
    }) || [];
    
    // Delete quote mutation
    const deleteQuote = useMutation(api.quotes.deleteQuote);
    
    // Redirect if not signed in
    if (!isSignedIn) {
      return <Navigate to="/" replace />;
    }
    
    // Get currency symbol based on selected currency
    const getCurrencySymbol = (code: string) => {
      const currency = currencyOptions.find(c => c.value === code);
      return currency ? currency.symbol : '$';
    };
    
    // Get exchange rate based on selected currency
    const getExchangeRate = (code: string) => {
      const currency = currencyOptions.find(c => c.value === code);
      return currency ? currency.rate : 1;
    };
  
    // Update the exportToPDF function to handle pricing table
    const exportToPDF = async () => {
      // For pricing table tab
      if (activeTab === 'pricing' && pricingTableRef.current) {
        try {
          // Add a class for styling during capture
          pricingTableRef.current.classList.add('printing');
          
          // Capture the table as an image with optimized settings
          const canvas = await html2canvas(pricingTableRef.current, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 1200,
            onclone: (document, element) => {
              // Ensure footer text doesn't wrap in the cloned element
              const footerElements = element.querySelectorAll('.footer-section p');
              footerElements.forEach(el => {
                (el as HTMLElement).style.whiteSpace = 'normal';
                (el as HTMLElement).style.width = '100%';
                (el as HTMLElement).style.marginBottom = '10px';
              });
              
              // Add extra padding at the bottom to ensure footer is fully visible
              const footerSection = element.querySelector('.footer-section');
              if (footerSection) {
                (footerSection as HTMLElement).style.paddingBottom = '60px';
              }
              
              // Ensure the popular card is properly styled
              const popularCard = element.querySelector('.popular-card');
              if (popularCard) {
                (popularCard as HTMLElement).style.border = '2px solid #3B82F6';
              }
            }
          });
          
          // Remove the class after capture
          pricingTableRef.current.classList.remove('printing');
          
          // Calculate dimensions to fit on A4 page
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
          });
          
          // A4 dimensions: 210 x 297 mm
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          // Calculate margins
          const margin = 10;
          
          // Calculate image width and height to fit the page with margins
          const imgWidth = pdfWidth - (margin * 2);
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add the image to the PDF
          pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
          
          // Set PDF properties for better optimization
          pdf.setProperties({
            title: 'Visionify Pricing',
            subject: 'Visionify Pricing Information',
            creator: 'Visionify Inc.',
            author: 'info@visionify.ai'
          });
          
          // Save the PDF with optimized settings
          pdf.save(`Visionify_Pricing_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
          console.error('Error generating pricing table PDF:', error);
          alert('There was an error generating the PDF. Please try again.');
        }
      }
    };
  
    // Reset quote details when switching to v1 tab
    const handleTabChange = (value: string) => {
      setActiveTab(value);
    };
    
    // Handle quote generation
    const handleQuoteGenerated = (details: any) => {
      setQuoteDetails(details);
    };
    
    // Handle quote save
    const handleQuoteSaved = (quoteId: string) => {
      // Switch to saved quotes tab
      setActiveTab('saved');
    };
    
    // Handle viewing a saved quote
    const handleViewQuote = (quote: Quote) => {
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
        await deleteQuote({ id: quoteToDelete as any });
        toast.success("Quote deleted successfully");
        setDeleteDialogOpen(false);
        setQuoteToDelete(null);
      } catch (error) {
        console.error("Error deleting quote:", error);
        toast.error("Failed to delete quote");
      }
    };
    
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
  
    // Get branding info for quote preview
    const branding = {
      companyName: "Visionify",
      logo: "/logo-color.png",
      primaryColor: "#3B82F6",
      secondaryColor: "#ffffff",
      fontFamily: "'Inter', sans-serif"
    };
    
    // Define columns for the saved quotes table
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
        cell: ({ row }) => getSubscriptionName(row.original.subscriptionType),
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
          // Check if there's a subscription linked to this quote
          const hasSubscription = subscriptions.some(sub => sub.quoteId === quote._id);
          
          return hasSubscription ? (
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Purchased</Badge>
          ) : (
            <Badge variant="outline">Pending</Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleViewQuote(row.original)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={() => handleDeleteQuote(row.original._id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        ),
      },
    ];
  
    // Add a function to handle quote updates
    const handleQuoteUpdate = (updatedQuoteData) => {
      if (selectedQuote) {
        const updatedQuoteObj = {
          ...selectedQuote,
          quoteData: updatedQuoteData
        };
        setUpdatedQuote(updatedQuoteObj);
      }
    };
  
    return (
      <div className="min-h-screen bg-[#F5F5F7]">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Quotes</h1>
            <div className="flex items-center gap-2">
              {activeTab === 'pricing' && (
                <Button variant="outline" size="sm" onClick={exportToPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
              )}
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="pricing">Pricing Table</TabsTrigger>
              <TabsTrigger value="generator-v2">Quote Generator</TabsTrigger>
              <TabsTrigger value="saved">Saved Quotes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pricing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Table</CardTitle>
                  <CardDescription>
                    View and customize the pricing table for Visionify products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <Label htmlFor="currency-select">Currency</Label>
                      <Select 
                        value={primaryCurrency} 
                        onValueChange={setPrimaryCurrency}
                      >
                        <SelectTrigger id="currency-select">
                          <SelectValue placeholder="Select currency">
                            {currencyOptions.find(c => c.value === primaryCurrency)?.label || 'US Dollar ($)'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {currencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="show-second-currency" 
                          checked={showSecondCurrency}
                          onCheckedChange={setShowSecondCurrency}
                        />
                        <Label htmlFor="show-second-currency">Show USD equivalent</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div ref={pricingTableRef} className="pricing-table-container">
                    <StaticPricingTable 
                      pricingData={pricingData}
                      showSecondCurrency={showSecondCurrency}
                      primaryCurrency={primaryCurrency}
                      exchangeRate={getExchangeRate(primaryCurrency)}
                      currencySymbol={getCurrencySymbol(primaryCurrency)}
                      showThreeYear={false}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="generator-v2" className="space-y-4">
              <QuoteGeneratorV2 
                onQuoteGenerated={handleQuoteGenerated} 
              />
            </TabsContent>
            
            <TabsContent value="saved" className="space-y-4">
              <SavedQuotesManager 
                branding={branding}
                pricingData={pricingData}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Dialog for viewing saved quotes */}
        <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedQuote ? `Quote for ${selectedQuote.companyName}` : 'Quote Preview'}
              </DialogTitle>
              <DialogDescription>
                {selectedQuote ? `Created on ${formatDate(selectedQuote.createdAt)}` : 'Preview of your generated quote'}
              </DialogDescription>
            </DialogHeader>
            {selectedQuote && selectedQuote.quoteData ? (
              <QuotePreviewV2 
                quoteDetails={{
                  ...selectedQuote.quoteData,
                  _id: selectedQuote._id
                }}
                branding={branding}
                onSave={() => {}} // No need to save again
                onQuoteUpdate={handleQuoteUpdate}
              />
            ) : (
              <div className="p-8 text-center">
                <p>Unable to display quote. Missing required data.</p>
              </div>
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