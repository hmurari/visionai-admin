import { useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generatePDF } from '@/utils/pdfUtils';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

// Import the new components
import { QuoteHeader } from '@/components/quote/QuoteHeader';
import { QuoteClientData } from '@/components/quote/QuoteClientData';
import { QuotePackageSummary } from '@/components/quote/QuotePackageSummary';
import { QuoteSelectedScenarios } from '@/components/quote/QuoteSelectedScenarios';
import { QuotePricingSummary } from '@/components/quote/QuotePricingSummary';
import { QuoteStandardFeatures } from '@/components/quote/QuoteStandardFeatures';
import { QuoteFooter } from '@/components/quote/QuoteFooter';

// Import types
import { QuoteDetailsV2, Branding } from '@/types/quote';
import { QuotePricingSheet } from './quote/QuotePricingSheet';
import { pricingDataV2 } from '@/data/pricing_v2';

interface QuotePreviewV2Props {
  quoteDetails: QuoteDetailsV2;
  branding: Branding;
  onSave?: () => void;
  onQuoteUpdate?: (updatedQuote: QuoteDetailsV2) => void;
}

const QuotePreviewV2 = ({ quoteDetails, branding, onSave, onQuoteUpdate }: QuotePreviewV2Props) => {
  const quoteRef = useRef<HTMLDivElement>(null);
  const [localQuoteDetails, setLocalQuoteDetails] = useState<QuoteDetailsV2>(quoteDetails);
  
  // Add this mutation to handle saving directly from the preview if needed
  const saveQuote = useMutation(api.quotes.saveQuote);

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
    
    // Calculate annual and contract values
    const monthlyRecurring = additionalCamerasMonthlyRecurring;
    const annualRecurring = monthlyRecurring * 12;
    const discountPercentage = localQuoteDetails.discountPercentage;
    
    // Calculate discount amount based on subscription type
    const discountAmount = newSubscriptionType === 'monthly'
      ? monthlyRecurring * (discountPercentage / 100)  // Monthly discount
      : annualRecurring * (discountPercentage / 100);  // Annual discount
    
    const discountedMonthlyRecurring = monthlyRecurring * (1 - discountPercentage / 100);
    const discountedAnnualRecurring = annualRecurring * (1 - discountPercentage / 100);
    const totalContractValue = newSubscriptionType === 'monthly'
      ? localQuoteDetails.oneTimeBaseCost + discountedMonthlyRecurring
      : localQuoteDetails.oneTimeBaseCost + (discountedAnnualRecurring * (contractLength / 12));
    
    // Create updated quote details
    const updatedQuoteDetails: QuoteDetailsV2 = {
      ...localQuoteDetails,
      subscriptionType: newSubscriptionType,
      additionalCameraCost,
      additionalCamerasMonthlyRecurring,
      monthlyRecurring,
      discountedMonthlyRecurring,
      annualRecurring,
      discountedAnnualRecurring,
      discountAmount,  // Updated discount amount based on subscription type
      contractLength,
      totalContractValue
    };
    
    // Update local state
    setLocalQuoteDetails(updatedQuoteDetails);
    
    // Notify parent component if callback provided
    if (onQuoteUpdate) {
      onQuoteUpdate(updatedQuoteDetails);
    }
  };

  // Handle generating PDF
  const handleGenerateQuote = async () => {
    if (!quoteRef.current) return;
    
    await generatePDF(
      quoteRef.current,
      {
        filename: `Visionify_Quote_${localQuoteDetails.clientInfo.company}_${new Date().toISOString().split('T')[0]}.pdf`,
        title: `Visionify Quote - ${localQuoteDetails.clientInfo.company}`,
        subject: 'Safety Analytics Quote',
        author: 'Visionify Inc.',
        keywords: 'quote, safety analytics, visionify',
        creator: 'Visionify Quote Generator'
      }
    );
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
        customerId: localQuoteDetails.clientInfo.customerId,
        packageName: localQuoteDetails.isEverythingPackage ? "Everything Package" : "Core Package",
        cameraCount: localQuoteDetails.totalCameras,
        subscriptionType: localQuoteDetails.subscriptionType,
        deploymentType: "visionify", // Default to Visionify Cloud
        totalAmount: localQuoteDetails.subscriptionType === 'monthly' 
          ? localQuoteDetails.oneTimeBaseCost + localQuoteDetails.monthlyRecurring 
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
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleGenerateQuote} 
            className="flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <div 
        ref={quoteRef} 
        className="quote-preview-container bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-[210mm] mx-auto"
      >
        {/* Header with logo */}
        <QuoteHeader 
          date={localQuoteDetails.date}
          showSecondCurrency={localQuoteDetails.showSecondCurrency}
          secondaryCurrency={localQuoteDetails.secondaryCurrency}
          exchangeRate={localQuoteDetails.exchangeRate}
          branding={branding}
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
        
        {/* Additional Camera Pricing */}
        <QuotePricingSheet
          branding={branding}
          showSecondCurrency={localQuoteDetails.showSecondCurrency}
          secondaryCurrency={localQuoteDetails.secondaryCurrency}
          exchangeRate={localQuoteDetails.exchangeRate}
          subscriptionType={localQuoteDetails.subscriptionType}
          onSubscriptionChange={handleSubscriptionChange}
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

        {/* Footer section */}
        <QuoteFooter />
      </div>
    </div>
  );
};

export default QuotePreviewV2;
