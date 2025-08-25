import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { OrderFormDetails, Branding } from '@/types/quote';
import { generatePDF } from '@/utils/pdfUtils';
import { toast } from 'sonner';

// Import existing quote components to reuse
import { OrderFormHeader } from '@/components/quote/OrderFormHeader';
import { LegalSummary } from '@/components/quote/LegalSummary';
import { KeyTerms } from '@/components/quote/KeyTerms';
import { QuoteClientData } from '@/components/quote/QuoteClientData';
import { QuotePackageSummary } from '@/components/quote/QuotePackageSummary';
import { QuoteSelectedScenarios } from '@/components/quote/QuoteSelectedScenarios';
import { QuotePricingSheet } from '@/components/quote/QuotePricingSheet';
import { QuotePricingSummary } from '@/components/quote/QuotePricingSummary';
import { QuoteTotalContractValue } from '@/components/quote/QuoteTotalContractValue';
import { QuoteStandardFeatures } from '@/components/quote/QuoteStandardFeatures';
import { SuccessCriteria } from '@/components/quote/SuccessCriteria';
import { TermsAndConditions } from '@/components/quote/TermsAndConditions';
import { SignaturePage } from '@/components/quote/SignaturePage';

interface OrderFormPreviewProps {
  orderFormDetails: OrderFormDetails;
}

const defaultBranding: Branding = {
  companyName: 'Visionify',
  logo: '/logo-color.png',
  primaryColor: '#1e40af',
  secondaryColor: '#3b82f6',
  fontFamily: 'Inter, sans-serif'
};

const OrderFormPreview = ({ orderFormDetails }: OrderFormPreviewProps) => {
  const previewRef = useRef<HTMLDivElement>(null);

  // Export to PDF - similar to quotes, capture all pages
  const exportToPDF = async () => {
    if (!previewRef.current || !orderFormDetails) return;
    
    try {
      // Get all page elements for multi-page PDF export
      const pageElements = [
        document.getElementById('order-form-page-1'),
        document.getElementById('order-form-page-2'),
        document.getElementById('order-form-page-3'),
        document.getElementById('order-form-page-4')
      ].filter(Boolean) as HTMLElement[];

      if (pageElements.length === 0) {
        toast.error('No pages found for export');
        return;
      }

      // Use multi-page PDF generation like quotes
      const { generatePDFFromMultiplePages } = await import('@/utils/pdfUtils');
      const customerName = orderFormDetails.clientInfo.company || orderFormDetails.clientInfo.name || 'Customer';
      const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');
      
      await generatePDFFromMultiplePages(pageElements, {
        filename: `${orderFormDetails.orderFormNumber || 'ORDER-00000'}-${sanitizedCustomerName}`,
        title: 'Visionify Order Form',
        subject: 'Order Form',
        creator: 'Visionify Order Form Generator',
        author: 'Visionify Inc.',
        keywords: 'order form, visionify, ai safety'
      });
      toast.success('Order form exported successfully!');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to export order form');
    }
  };

  // Render all pages in a single view like quotes
  const renderAllPages = () => {
    const { quoteDetails } = orderFormDetails;
    
    return (
      <div className="space-y-12">
        {/* Page 1: Header, Legal Summary, To/From, Key Terms */}
        <div id="order-form-page-1" className="page-break-after space-y-8 bg-white min-h-[800px] shadow-sm" style={{ width: '8.5in', margin: '0 auto', padding: '0.75in' }}>
          <OrderFormHeader
            date={orderFormDetails.date}
            showSecondCurrency={quoteDetails.showSecondCurrency}
            secondaryCurrency={quoteDetails.secondaryCurrency}
            exchangeRate={quoteDetails.exchangeRate}
            branding={defaultBranding}
            orderFormNumber={orderFormDetails.orderFormNumber}
          />
          
          <LegalSummary branding={defaultBranding} />
          
          <QuoteClientData 
            clientInfo={orderFormDetails.clientInfo} 
            branding={defaultBranding} 
          />
          
          <KeyTerms 
            keyTerms={orderFormDetails.keyTerms} 
            branding={defaultBranding} 
          />
        </div>
        
        {/* Page 2: Package Summary, Selected Scenarios, Pricing Sheet */}
        <div id="order-form-page-2" className="page-break-after space-y-8 bg-white min-h-[800px] shadow-sm" style={{ width: '8.5in', margin: '0 auto', padding: '0.75in' }}>
          <OrderFormHeader
            date={orderFormDetails.date}
            branding={defaultBranding}
            orderFormNumber={orderFormDetails.orderFormNumber}
            isSecondPage={true}
            pageNumber={2}
          />
          
          <QuotePackageSummary
            totalCameras={quoteDetails.totalCameras}
            subscriptionType={quoteDetails.subscriptionType}
            branding={defaultBranding}
            isEverythingPackage={quoteDetails.isEverythingPackage}
          />
          
          <QuoteSelectedScenarios
            selectedScenarios={quoteDetails.selectedScenarios}
            branding={defaultBranding}
          />
          
          <QuotePricingSheet
            showSecondCurrency={quoteDetails.showSecondCurrency}
            secondaryCurrency={quoteDetails.secondaryCurrency}
            exchangeRate={quoteDetails.exchangeRate}
            branding={defaultBranding}
            subscriptionType={quoteDetails.subscriptionType}
          />
        </div>
        
        {/* Page 3: Order Items, Success Criteria */}
        <div id="order-form-page-3" className="page-break-after space-y-8 bg-white min-h-[800px] shadow-sm" style={{ width: '8.5in', margin: '0 auto', padding: '0.75in' }}>
          <OrderFormHeader
            date={orderFormDetails.date}
            branding={defaultBranding}
            orderFormNumber={orderFormDetails.orderFormNumber}
            isSecondPage={true}
            pageNumber={3}
          />
          
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-4" style={{ color: defaultBranding.primaryColor }}>
              ORDER ITEMS
            </h3>
            <QuotePricingSummary
              quoteDetails={quoteDetails}
              branding={defaultBranding}
              hideTitle={true}
            />
          </div>
          
          <div className="mt-4">
            <SuccessCriteria
              successCriteria={orderFormDetails.successCriteria}
              branding={defaultBranding}
            />
          </div>
        </div>
        
        {/* Page 4: Terms & Conditions, Signature Page */}
        <div id="order-form-page-4" className="space-y-8 bg-white min-h-[800px] shadow-sm" style={{ width: '8.5in', margin: '0 auto', padding: '0.75in' }}>
          <OrderFormHeader
            date={orderFormDetails.date}
            branding={defaultBranding}
            orderFormNumber={orderFormDetails.orderFormNumber}
            isSecondPage={true}
            pageNumber={4}
          />
          
          <TermsAndConditions
            termsAndConditions={orderFormDetails.termsAndConditions}
            branding={defaultBranding}
          />
          
          <SignaturePage
            branding={defaultBranding}
            visionifySignature={orderFormDetails.visionifySignature}
            customerSignature={orderFormDetails.customerSignature}
            isWideFormat={true}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with controls */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">Order Form Preview</h3>
            <div className="text-sm text-gray-500">
              4 Pages
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Export button */}
            <Button onClick={exportToPDF} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
      
      {/* Content area - use full width with horizontal scroll if needed */}
      <div className="flex-1 overflow-auto bg-gray-100">
        <div 
          ref={previewRef}
          className="py-8 px-4"
          style={{ 
            fontFamily: defaultBranding.fontFamily,
            fontSize: '14px',
            lineHeight: '1.5',
            minWidth: '8.5in'
          }}
        >
          {renderAllPages()}
        </div>
      </div>
    </div>
  );
};

export default OrderFormPreview; 