import { useRef } from 'react';
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
import { QuotePackageDetails } from '@/components/quote/QuotePackageDetails';
import { QuoteSelectedScenarios } from '@/components/quote/QuoteSelectedScenarios';
import { QuoteAdditionalCameraPricing } from '@/components/quote/QuoteAdditionalCameraPricing';
import { QuotePricingSummary } from '@/components/quote/QuotePricingSummary';
import { QuoteStandardFeatures } from '@/components/quote/QuoteStandardFeatures';
import { QuoteFooter } from '@/components/quote/QuoteFooter';

// Import types
import { QuoteDetailsV2, Branding } from '@/types/quote';

interface QuotePreviewV2Props {
  quoteDetails: QuoteDetailsV2;
  branding: Branding;
  onSave?: () => void;
}

const QuotePreviewV2 = ({ quoteDetails, branding, onSave }: QuotePreviewV2Props) => {
  const quoteRef = useRef<HTMLDivElement>(null);
  
  // Add this mutation to handle saving directly from the preview if needed
  const saveQuote = useMutation(api.quotes.saveQuote);

  // Handle generating PDF
  const handleGenerateQuote = async () => {
    if (!quoteRef.current) return;
    
    await generatePDF(
      quoteRef.current,
      {
        filename: `Visionify_Quote_${quoteDetails.clientInfo.company}_${new Date().toISOString().split('T')[0]}.pdf`,
        title: `Visionify Quote - ${quoteDetails.clientInfo.company}`,
        subject: 'Safety Analytics Quote',
        author: 'Visionify Inc.',
        keywords: 'quote, safety analytics, visionify',
        creator: 'Visionify Quote Generator'
      }
    );
  };

  // Handle direct save if needed
  const handleSaveQuoteDirectly = async () => {
    if (!quoteDetails) return;
    
    try {
      // Prepare the quote data for saving
      const quoteData = {
        customerName: quoteDetails.clientInfo.name,
        companyName: quoteDetails.clientInfo.company,
        email: quoteDetails.clientInfo.email,
        address: quoteDetails.clientInfo.address,
        city: quoteDetails.clientInfo.city,
        state: quoteDetails.clientInfo.state,
        zip: quoteDetails.clientInfo.zip,
        customerId: quoteDetails.clientInfo.customerId,
        packageName: "Core Package",
        cameraCount: quoteDetails.totalCameras,
        subscriptionType: quoteDetails.subscriptionType,
        deploymentType: "visionify", // Default to Visionify Cloud
        totalAmount: quoteDetails.discountedAnnualRecurring,
        quoteData: quoteDetails,
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
              onClick={onSave}
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
          date={quoteDetails.date}
          showSecondCurrency={quoteDetails.showSecondCurrency}
          secondaryCurrency={quoteDetails.secondaryCurrency}
          exchangeRate={quoteDetails.exchangeRate}
          branding={branding}
        />
        
        {/* FROM & TO Section */}
        <QuoteClientData 
          clientInfo={quoteDetails.clientInfo}
          branding={branding}
        />
        
        {/* Package Summary */}
        <QuotePackageSummary 
          totalCameras={quoteDetails.totalCameras}
          subscriptionType={quoteDetails.subscriptionType}
          branding={branding}
        />
        
        {/* Package Details */}
        <QuotePackageDetails 
          branding={branding}
        />
        
        {/* Selected Scenarios */}
        <QuoteSelectedScenarios 
          selectedScenarios={quoteDetails.selectedScenarios}
          branding={branding}
        />
        
        {/* Additional Camera Pricing */}
        <QuoteAdditionalCameraPricing 
          showSecondCurrency={quoteDetails.showSecondCurrency}
          secondaryCurrency={quoteDetails.secondaryCurrency}
          exchangeRate={quoteDetails.exchangeRate}
          branding={branding}
        />
        
        {/* Pricing Summary (now includes Total Contract Value) */}
        <QuotePricingSummary 
          quoteDetails={quoteDetails}
          branding={branding}
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
