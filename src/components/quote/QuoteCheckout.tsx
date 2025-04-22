import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAction, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { loadStripe } from '@stripe/stripe-js';
import { QuoteDetailsV2 } from '@/types/quote';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface QuoteCheckoutProps {
  quoteDetails: QuoteDetailsV2;
}

export default function QuoteCheckout({ quoteDetails }: QuoteCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const saveQuote = useMutation(api.quotes.saveQuote);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, ensure we have a quote ID by saving the quote if it doesn't have an ID
      let quoteId = quoteDetails._id;
      
      if (!quoteId) {
        // Save the quote first
        const clientInfo = quoteDetails.clientInfo;
        quoteId = await saveQuote({
          customerName: clientInfo.name,
          companyName: clientInfo.company,
          email: clientInfo.email,
          address: clientInfo.address,
          city: clientInfo.city,
          state: clientInfo.state,
          zip: clientInfo.zip,
          customerId: clientInfo.customerId || undefined,
          totalAmount: quoteDetails.totalContractValue,
          cameraCount: quoteDetails.totalCameras,
          packageName: quoteDetails.isEverythingPackage ? "Everything Package" : "Custom Package",
          subscriptionType: quoteDetails.subscriptionType,
          deploymentType: "Cloud",
          quoteData: quoteDetails,
          createdAt: Date.now(),
        });
        
        toast.success("Quote saved successfully");
      }
      
      // Now proceed with checkout
      const result = await createCheckoutSession({
        quoteId,
        customerEmail: quoteDetails.clientInfo.email,
        starterKitIncluded: false, // Adjust based on your needs
        cameraCount: quoteDetails.totalCameras,
        subscriptionType: quoteDetails.subscriptionType,
        discountPercentage: quoteDetails.discountPercentage || 0,
        partnerId: user?.id || "",
      });

      if (result?.url) {
        window.location.href = result.url;
      } else {
        setError("Failed to create checkout session. No URL returned.");
      }
    } catch (error) {
      console.error("Error in checkout process:", error);
      setError("Failed to process checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <Button 
        onClick={handleCheckout} 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Proceed to Payment"}
      </Button>
    </div>
  );
} 