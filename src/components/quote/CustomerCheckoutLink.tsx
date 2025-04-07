import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAction, useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { QuoteDetailsV2 } from '@/types/quote';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CustomerCheckoutLinkProps {
  quoteDetails: any; // Accept any quote format (V1 or V2)
  onQuoteSaved?: (quoteId: string) => void;
}

export default function CustomerCheckoutLink({ quoteDetails, onQuoteSaved }: CustomerCheckoutLinkProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  
  // Get existing checkout link if available
  const existingLink = useQuery(api.subscriptions.getCheckoutLinkForQuote, { 
    quoteId: quoteDetails._id || '' 
  });
  
  const generateCustomerCheckoutLink = useAction(api.subscriptions.generateCustomerCheckoutLink);
  const saveQuote = useMutation(api.quotes.saveQuote);
  
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  
  // Update checkout URL when existing link is loaded
  useEffect(() => {
    if (existingLink) {
      setCheckoutUrl(existingLink.checkoutUrl);
      setExpiresAt(existingLink.expiresAt);
    }
  }, [existingLink]);
  
  // Initialize customer email from quote details
  useEffect(() => {
    if (quoteDetails) {
      // Handle both V1 and V2 quote formats
      if (quoteDetails.email) {
        setCustomerEmail(quoteDetails.email);
      } else if (quoteDetails.clientInfo?.email) {
        setCustomerEmail(quoteDetails.clientInfo.email);
      } else if (quoteDetails.quoteData?.clientInfo?.email) {
        setCustomerEmail(quoteDetails.quoteData.clientInfo.email);
      }
    }
  }, [quoteDetails]);
  
  // Format expiry date
  const formatExpiryDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Copy link to clipboard
  const copyToClipboard = () => {
    if (checkoutUrl) {
      navigator.clipboard.writeText(checkoutUrl);
      toast.success('Checkout link copied to clipboard');
    }
  };
  
  // Generate checkout link
  const handleGenerateLink = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If quote doesn't have an ID yet, save it first
      let quoteId = quoteDetails._id;
      
      if (!quoteId) {
        // Prepare the quote data for saving if it's not already saved
        const quoteData = {
          customerName: quoteDetails.clientInfo?.name || quoteDetails.customerName || '',
          companyName: quoteDetails.clientInfo?.company || quoteDetails.companyName || '',
          email: customerEmail || quoteDetails.clientInfo?.email || quoteDetails.email || '',
          address: quoteDetails.clientInfo?.address || quoteDetails.address || '',
          city: quoteDetails.clientInfo?.city || quoteDetails.city || '',
          state: quoteDetails.clientInfo?.state || quoteDetails.state || '',
          zip: quoteDetails.clientInfo?.zip || quoteDetails.zip || '',
          customerId: quoteDetails.clientInfo?.customerId || quoteDetails.customerId || null,
          packageName: quoteDetails.packageName || "Starter Package",
          cameraCount: quoteDetails.totalCameras || quoteDetails.cameraCount || 5,
          subscriptionType: quoteDetails.subscriptionType || 'yearly',
          deploymentType: "visionify", // Default to Visionify Cloud
          totalAmount: quoteDetails.discountedAnnualRecurring || quoteDetails.totalAmount || 0,
          quoteData: quoteDetails.quoteData || quoteDetails,
        };
        
        // Save the quote
        const savedQuoteId = await saveQuote(quoteData);
        quoteId = savedQuoteId;
        
        // Notify parent component that quote was saved
        if (onQuoteSaved) {
          onQuoteSaved(savedQuoteId);
        }
      }
      
      // Extract quote details for checkout link generation
      const subscriptionType = quoteDetails.subscriptionType || 
                              quoteDetails.quoteData?.subscriptionType || 
                              'yearly';
                              
      const cameraCount = quoteDetails.totalCameras || 
                         quoteDetails.cameraCount || 
                         quoteDetails.quoteData?.totalCameras || 
                         5;
                         
      const discountPercentage = quoteDetails.discountPercentage || 
                                quoteDetails.quoteData?.discountPercentage || 
                                0;
                                
      const starterKitIncluded = quoteDetails.starterKitIncluded || 
                               quoteDetails.quoteData?.starterKitIncluded || 
                               false;
      
      // Generate checkout link
      const result = await generateCustomerCheckoutLink({
        quoteId,
        customerEmail: customerEmail,
        cameraCount,
        subscriptionType,
        discountPercentage,
        partnerId: user?.id || '',
        starterKitIncluded,
      });
      
      // Update state with new link
      setCheckoutUrl(result.url);
      setExpiresAt(result.expiresAt);
      
      toast.success('Checkout link generated successfully');
    } catch (error) {
      console.error('Error generating checkout link:', error);
      setError(`Error generating checkout link: ${error}`);
      toast.error('Failed to generate checkout link');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle>Customer Payment Link</CardTitle>
        <CardDescription>
          Generate a payment link to share with your customer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Customer Email</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="customer@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-500 mt-2">
              {error}
            </div>
          )}
          
          {checkoutUrl ? (
            <div className="space-y-2">
              <Label>Payment Link</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={checkoutUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(checkoutUrl, '_blank')}
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              
              {expiresAt && (
                <p className="text-sm text-muted-foreground">
                  This link is valid until {formatExpiryDate(expiresAt)}
                </p>
              )}
              
              <div className="flex justify-between items-center pt-2">
                <p className="text-sm">
                  Share this link with your customer to complete their purchase
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateLink}
                  disabled={isLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={handleGenerateLink} 
              className="w-full" 
              disabled={isLoading || !customerEmail}
            >
              {isLoading ? "Generating..." : "Generate Payment Link"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 