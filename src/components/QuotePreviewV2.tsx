import { useRef, useState, useEffect } from 'react';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generatePDFFromData, generatePDFFromMultiplePages } from '@/utils/pdfUtils';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import the new components
import { QuoteHeader } from '@/components/quote/QuoteHeader';
import { QuoteClientData } from '@/components/quote/QuoteClientData';
import { QuotePackageSummary } from '@/components/quote/QuotePackageSummary';
import { QuoteSelectedScenarios } from '@/components/quote/QuoteSelectedScenarios';
import { QuotePricingSummary } from '@/components/quote/QuotePricingSummary';
import { QuoteStandardFeatures } from '@/components/quote/QuoteStandardFeatures';
import { QuoteFooter } from '@/components/quote/QuoteFooter';
import CustomerCheckoutLink from './quote/CustomerCheckoutLink';

// Import types
import { QuoteDetailsV2, Branding } from '@/types/quote';
import { QuotePricingSheet } from './quote/QuotePricingSheet';
import { pricingDataV2 } from '@/data/pricing_v2';

interface QuotePreviewV2Props {
  quoteDetails: QuoteDetailsV2;
  branding: Branding;
  onSave?: () => void;
  onQuoteUpdate?: (updatedQuote: QuoteDetailsV2) => void;
  showPaymentLink?: boolean;
  pdfMode?: boolean;
  onCreateOrderForm?: (quoteDetails: QuoteDetailsV2) => void;
}

const QuotePreviewV2 = ({ quoteDetails, branding, onSave, onQuoteUpdate, showPaymentLink = true, pdfMode = false, onCreateOrderForm }: QuotePreviewV2Props) => {
  const quoteRef = useRef<HTMLDivElement>(null);
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);
  const [localQuoteDetails, setLocalQuoteDetails] = useState<QuoteDetailsV2>(quoteDetails);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [quoteNumber, setQuoteNumber] = useState<string>("");
  
  // Add this mutation to handle saving directly from the preview if needed
  const saveQuote = useMutation(api.quotes.saveQuote);

  // Generate quote number on initial render
  useEffect(() => {
    // Use existing quote number if available and valid
    if (quoteDetails.quoteNumber && typeof quoteDetails.quoteNumber === 'string' && quoteDetails.quoteNumber.trim() !== '') {
      setQuoteNumber(quoteDetails.quoteNumber);
    } 
    // Use ID-based number if ID exists and is valid
    else if (quoteDetails._id && typeof quoteDetails._id === 'string' && quoteDetails._id.length >= 8) {
      // Ensure we only use alphanumeric characters from the ID
      const cleanId = quoteDetails._id.replace(/[^a-zA-Z0-9]/g, '');
      setQuoteNumber(`QT-${cleanId.substring(0, 8)}`);
    } 
    // Generate a random quote number as fallback - using 4 digits as before
    else {
      try {
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        setQuoteNumber(`VIS-${randomNum}`);
      } catch (error) {
        console.error("Error generating quote number:", error);
        // Ultimate fallback
        setQuoteNumber(`VIS-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`);
      }
    }
  }, [quoteDetails.quoteNumber, quoteDetails._id]);

  // Update local state when props change
  useEffect(() => {
    setLocalQuoteDetails(quoteDetails);
  }, [quoteDetails]);

  // Handle subscription type change
  const handleSubscriptionChange = (newSubscriptionType: string) => {
    // Find the subscription details
    const subscription = pricingDataV2.subscriptionTypes.find(
      sub => sub.id === newSubscriptionType
    ) || pricingDataV2.subscriptionTypes[0];
    
    // Calculate new pricing based on subscription type
    const discount = subscription.discount || 0;
    const contractLength = subscription.multiplier || 1;
    
    // Recalculate camera costs with new discount
    const totalCameras = localQuoteDetails.totalCameras;
    const isEverythingPackage = localQuoteDetails.isEverythingPackage || false;
    
    // Get pricing tiers
    const pricingTiers = isEverythingPackage 
      ? pricingDataV2.additionalCameraPricing.everythingPackage 
      : pricingDataV2.additionalCameraPricing.corePackage;
    
    // Calculate costs for all cameras
    let remainingCameras = totalCameras;
    let totalCameraCost = 0;
    
    // Tier 1: 1-20 cameras
    const tier1Max = 20;
    const tier1Cameras = Math.min(remainingCameras, tier1Max);
    const tier1Cost = tier1Cameras * pricingTiers[0].pricePerMonth;
    remainingCameras -= tier1Cameras;
    
    // Tier 2: 21-100 cameras
    const tier2Max = 80; // Up to 100 total (80 in this tier)
    const tier2Cameras = Math.min(remainingCameras, tier2Max);
    const tier2Cost = tier2Cameras * pricingTiers[1].pricePerMonth;
    remainingCameras -= tier2Cameras;
    
    // Tier 3: 101+ cameras
    const tier3Cameras = remainingCameras;
    const tier3Cost = tier3Cameras * pricingTiers[2].pricePerMonth;
    
    // Calculate total monthly cost for all cameras
    totalCameraCost = tier1Cost + tier2Cost + tier3Cost;
    
    // Apply subscription discount
    const additionalCamerasMonthlyRecurring = totalCameraCost * (1 - discount);
    
    // Calculate average cost per camera for display
    const additionalCameraCost = totalCameras > 0 
      ? additionalCamerasMonthlyRecurring / totalCameras 
      : 0;
    
    // Get server count and cost
    const serverCount = localQuoteDetails.serverCount || 0;
    const serverBaseCost = localQuoteDetails.serverBaseCost || 2000;
    const serverCost = serverCount * serverBaseCost;
    
    // Get implementation cost if it's included
    const implementationCost = localQuoteDetails.includeImplementationCost 
      ? (localQuoteDetails.implementationCost || 0) 
      : 0;
    
    // Calculate total one-time costs
    let totalOneTimeCost = serverCost + implementationCost;
    
    // Calculate annual and contract values
    const monthlyRecurring = additionalCamerasMonthlyRecurring;
    const threeMonthRecurring = monthlyRecurring * 3;
    const annualRecurring = monthlyRecurring * 12;
    const discountPercentage = localQuoteDetails.discountPercentage || 0;
    
    // Special handling for perpetual license
    let perpetualLicenseCost = 0;
    let amcCost = 0;
    
    if (newSubscriptionType === 'perpetual') {
      // For perpetual: take annual costs (with 20% discount) and multiply by 3
      const annualWithDiscount = monthlyRecurring * 12 * (1 - 0.2); // 20% discount
      perpetualLicenseCost = annualWithDiscount * 3;
      amcCost = perpetualLicenseCost * 0.1; // 10% of perpetual license cost
      
      // For perpetual, add the license cost to one-time costs
      totalOneTimeCost += perpetualLicenseCost;
    }
    
    // Special handling for pilot program
    if (newSubscriptionType === 'threeMonth') {
      // Pilot is a fixed cost of $6,000
      totalOneTimeCost = 6000; // Override with pilot cost
    }
    
    // Apply discount directly to monthly, three-month, and annual recurring values
    const discountedMonthlyRecurring = monthlyRecurring * (1 - discountPercentage / 100);
    const discountedThreeMonthRecurring = threeMonthRecurring * (1 - discountPercentage / 100);
    const discountedAnnualRecurring = annualRecurring * (1 - discountPercentage / 100);
    
    // Calculate discount amount based on subscription type
    const discountAmount = newSubscriptionType === 'monthly'
      ? monthlyRecurring * (discountPercentage / 100)  // Monthly discount
      : newSubscriptionType === 'threeMonth'
        ? 0  // No additional discount for pilot (fixed cost)
        : newSubscriptionType === 'perpetual'
          ? 0  // No additional discount for perpetual (already has built-in discount)
          : annualRecurring * (discountPercentage / 100);  // Annual discount
    
    // Calculate total contract value
    let totalContractValue;
    if (newSubscriptionType === 'perpetual') {
      // For perpetual: one-time costs + optional AMC
      totalContractValue = totalOneTimeCost + amcCost;
    } else if (newSubscriptionType === 'threeMonth') {
      // For pilot: fixed cost
      totalContractValue = 6000;
    } else if (newSubscriptionType === 'monthly') {
      totalContractValue = totalOneTimeCost + discountedMonthlyRecurring;
    } else {
      totalContractValue = totalOneTimeCost + (discountedAnnualRecurring * (contractLength / 12));
    }
    
    // Create updated quote details
    const updatedQuoteDetails: QuoteDetailsV2 = {
      ...localQuoteDetails,
      subscriptionType: newSubscriptionType,
      additionalCameraCost,
      additionalCamerasMonthlyRecurring,
      monthlyRecurring,
      discountedMonthlyRecurring,
      threeMonthRecurring,
      discountedThreeMonthRecurring,
      annualRecurring,
      discountedAnnualRecurring,
      discountAmount,
      contractLength,
      totalContractValue,
      serverCount,
      serverBaseCost,
      totalOneTimeCost,
      perpetualLicenseCost,
      amcCost
    };
    
    // Update local state
    setLocalQuoteDetails(updatedQuoteDetails);
    
    // Notify parent component if callback provided
    if (onQuoteUpdate) {
      onQuoteUpdate(updatedQuoteDetails);
    }
  };

  // Handle generating PDF
  const handleGeneratePDF = async () => {
    if (!page1Ref.current || !page2Ref.current) return;
    
    try {
      await generatePDFFromMultiplePages(
        [page1Ref.current, page2Ref.current],
        { 
          filename: `Visionify_Quote_${quoteDetails.clientInfo.company}`,
          checkoutUrl: checkoutUrl || undefined
        }
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Handle when checkout URL is generated
  const handleCheckoutUrlGenerated = (url: string) => {
    setCheckoutUrl(url);
  };

  // Handle direct save if needed
  const handleSaveQuoteDirectly = async () => {
    if (!localQuoteDetails) return;
    
    try {
      // Prepare the quote data for saving
      const quoteData = {
        customerName: localQuoteDetails.clientInfo.name,
        companyName: localQuoteDetails.clientInfo.company,
        email: localQuoteDetails.clientInfo.email,
        address: localQuoteDetails.clientInfo.address,
        city: localQuoteDetails.clientInfo.city,
        state: localQuoteDetails.clientInfo.state,
        zip: localQuoteDetails.clientInfo.zip,
        // Only include customerId if it's a valid Convex ID
        customerId: localQuoteDetails.clientInfo.customerId && 
                   typeof localQuoteDetails.clientInfo.customerId === 'object' ? 
                   localQuoteDetails.clientInfo.customerId : undefined,
        packageName: localQuoteDetails.isEverythingPackage ? "Everything Package" : "Core Package",
        cameraCount: localQuoteDetails.totalCameras,
        subscriptionType: localQuoteDetails.subscriptionType,
        deploymentType: "visionify", // Default to Visionify Cloud
        totalAmount: localQuoteDetails.subscriptionType === 'monthly' 
          ? localQuoteDetails.oneTimeBaseCost + localQuoteDetails.discountedMonthlyRecurring 
          : localQuoteDetails.subscriptionType === 'threeMonth'
            ? localQuoteDetails.oneTimeBaseCost + (localQuoteDetails.discountedThreeMonthRecurring || (localQuoteDetails.discountedMonthlyRecurring * 3))
            : localQuoteDetails.oneTimeBaseCost + localQuoteDetails.discountedAnnualRecurring,
        quoteData: localQuoteDetails,
      };
      
      // Save the quote
      const savedQuote = await saveQuote(quoteData);
      
      // Show success message with sonner toast
      toast.success("Quote saved successfully");
      
      // Call the parent's onSave callback if provided
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error("Error saving quote:", error);
      toast.error("Failed to save quote");
    }
  };

  // Handle quote ID updates
  const handleQuoteSaved = (quoteId: string) => {
    // Update the local quote details with the new ID
    setLocalQuoteDetails(prev => ({
      ...prev,
      _id: quoteId
    }));
    
    // Call the parent's onQuoteUpdate callback if provided
    if (onQuoteUpdate) {
      onQuoteUpdate({
        ...localQuoteDetails,
        _id: quoteId
      });
    }
  };

  // Always call useQuery, but with a null quoteId if not available
  // This ensures the hook is always called in the same order
  const quoteId = localQuoteDetails?._id || null;
  const checkoutLinkResult = useQuery(
    api.subscriptions.getCheckoutLinkForQuote, 
    quoteId ? { quoteId } : { quoteId: "" }
  );
  
  // Only use the checkout link if we have a valid quoteId
  const checkoutLink = quoteId ? checkoutLinkResult : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Quote Preview</h2>
        <div className="flex gap-2">
          {onSave && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSaveQuoteDirectly}
              className="flex items-center justify-center"
            >
              Save Quote
            </Button>
          )}
          {onCreateOrderForm && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onCreateOrderForm(localQuoteDetails)}
              className="flex items-center justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              Create Order Form
            </Button>
          )}
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleGeneratePDF} 
            className="flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
      
      {/* Two-page layout with visual separation */}
      <div className="quote-preview-container max-w-[210mm] mx-auto space-y-8">
        {/* Page 1 */}
        <div 
          ref={page1Ref} 
          className="p-6 page bg-white rounded-lg shadow-sm border border-gray-200"
        >
          {/* Header with logo - now passing quoteNumber */}
          <QuoteHeader 
            date={localQuoteDetails.date}
            showSecondCurrency={localQuoteDetails.showSecondCurrency}
            secondaryCurrency={localQuoteDetails.secondaryCurrency}
            exchangeRate={localQuoteDetails.exchangeRate}
            branding={branding}
            quoteNumber={quoteNumber}
          />
          
          {/* FROM & TO Section */}
          <QuoteClientData 
            clientInfo={localQuoteDetails.clientInfo}
            branding={branding}
          />
          
          {/* Package Summary */}
          <QuotePackageSummary 
            totalCameras={localQuoteDetails.totalCameras}
            subscriptionType={localQuoteDetails.subscriptionType}
            branding={branding}
            isEverythingPackage={localQuoteDetails.isEverythingPackage}
          />
          
          {/* Selected Scenarios */}
          <QuoteSelectedScenarios 
            selectedScenarios={localQuoteDetails.selectedScenarios}
            branding={branding}
          />
          
          {/* Additional Camera Pricing - Moved to page 1 */}
          <QuotePricingSheet
            branding={branding}
            showSecondCurrency={localQuoteDetails.showSecondCurrency}
            secondaryCurrency={localQuoteDetails.secondaryCurrency}
            exchangeRate={localQuoteDetails.exchangeRate}
            subscriptionType={localQuoteDetails.subscriptionType}
            onSubscriptionChange={handleSubscriptionChange}
          />
        </div>
        
        {/* Page 2 */}
        <div 
          ref={page2Ref} 
          className="p-6 page bg-white rounded-lg shadow-sm border border-gray-200"
        >
          {/* Use QuoteHeader component for page 2 as well */}
          <QuoteHeader 
            date={localQuoteDetails.date}
            showSecondCurrency={localQuoteDetails.showSecondCurrency}
            secondaryCurrency={localQuoteDetails.secondaryCurrency}
            exchangeRate={localQuoteDetails.exchangeRate}
            branding={branding}
            quoteNumber={quoteNumber}
            isSecondPage={true}
          />
          
          {/* Pricing Summary (now includes Total Contract Value) */}
          <QuotePricingSummary 
            quoteDetails={localQuoteDetails}
            branding={branding}
            onSubscriptionChange={handleSubscriptionChange}
          />
          
          {/* Standard Features */}
          <QuoteStandardFeatures 
            branding={branding}
          />

          {/* Quote Footer - hide payment link since we'll add it programmatically */}
          <QuoteFooter 
            quoteId={localQuoteDetails._id} 
            pdfMode={pdfMode} 
            hidePdfPaymentLink={true} 
          />

          {/* Payment Link is added programmatically in the PDF */}

        </div>
      </div>
      
      {/* CustomerCheckoutLink - only show when not in PDF mode */}
      {!pdfMode && (
        <CustomerCheckoutLink 
          quoteDetails={localQuoteDetails} 
          onQuoteSaved={handleQuoteSaved}
          onCheckoutUrlGenerated={handleCheckoutUrlGenerated}
        />
      )}
    </div>
  );
};

export default QuotePreviewV2;
