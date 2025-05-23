import { useRef } from 'react';
import { 
  Check, 
  CheckCircle,
  Download,
  Save
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generatePDF } from '@/utils/pdfUtils';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { formatCurrency } from '@/utils/formatters';

interface ClientInfo {
  name: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  customerId?: string;
}

interface PalletQuoteDetails {
  clientInfo: ClientInfo;
  cameras: number;
  subscriptionType: string;
  packageType: string;
  deploymentType: string;
  includeEdgeServer: boolean;
  edgeServerCount: number;
  discountPercentage: number;
  pricing: {
    pricePerCamera: number;
    subscriptionCost: number;
    edgeServerCost: number;
    subtotal: number;
    discountAmount: number;
    total: number;
    totalInSecondCurrency: number;
  };
  showSecondCurrency?: boolean;
  selectedCurrency?: string;
  exchangeRate?: number;
  useCustomPricing?: boolean;
  customPricing?: any;
  productType: string;
}

interface Branding {
  logo: string;
  companyName: string;
  primaryColor: string;
}

interface PalletQuotePreviewProps {
  quoteDetails: PalletQuoteDetails;
  branding: Branding;
  pricingData: any;
  onDownload?: () => void;
  onSave?: (quoteId: string) => void;
}

const PalletQuotePreview = ({ quoteDetails, branding, pricingData, onDownload, onSave }: PalletQuotePreviewProps) => {
  const quoteRef = useRef<HTMLDivElement>(null);
  const saveQuote = useMutation(api.quotes.saveQuote);

  // Add safety check
  if (!quoteDetails || !pricingData) {
    return (
      <div className="p-8 text-center">
        <p>Unable to display quote. Missing required data.</p>
      </div>
    );
  }

  const handleGenerateQuote = async () => {
    if (!quoteRef.current) return;
    
    await generatePDF(
      quoteRef.current,
      {
        filename: `Visionify_Pallet_Quote_${quoteDetails.clientInfo.company}_${new Date().toISOString().split('T')[0]}.pdf`,
        title: `Visionify Pallet Quote - ${quoteDetails.clientInfo.company}`,
        subject: 'Pallet Productivity Analytics Quote',
        author: 'Visionify Inc.',
        keywords: 'quote, pallet analytics, productivity, visionify',
        creator: 'Visionify Quote Generator'
      }
    );
    
    if (onDownload) {
      onDownload();
    }
  };

  const handleSaveQuote = async () => {
    try {
      const sanitizedQuoteData = JSON.parse(JSON.stringify(quoteDetails, (key, value) => {
        if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
          return new Date(value).getTime();
        }
        return value;
      }));
      
      const quoteId = await saveQuote({
        customerName: quoteDetails.clientInfo.name,
        companyName: quoteDetails.clientInfo.company,
        email: quoteDetails.clientInfo.email,
        address: quoteDetails.clientInfo.address,
        city: quoteDetails.clientInfo.city,
        state: quoteDetails.clientInfo.state,
        zip: quoteDetails.clientInfo.zip,
        customerId: quoteDetails.clientInfo.customerId,
        totalAmount: quoteDetails.pricing.total || 0,
        cameraCount: quoteDetails.cameras,
        packageName: "Pallet Core Package",
        subscriptionType: quoteDetails.subscriptionType,
        deploymentType: quoteDetails.deploymentType,
        productType: "pallet",
        quoteData: sanitizedQuoteData,
      });
      
      toast.success("Quote saved successfully");
      if (onSave) onSave(quoteId);
    } catch (error) {
      console.error("Error saving quote:", error);
      toast.error("Failed to save quote");
    }
  };

  const formatSecondaryCurrency = (amount: number) => {
    if (!quoteDetails.exchangeRate || !quoteDetails.selectedCurrency || isNaN(amount)) return '';
    
    const convertedAmount = amount * quoteDetails.exchangeRate;
    
    return new Intl.NumberFormat(
      quoteDetails.selectedCurrency === 'INR' ? 'en-IN' : 'en-US', 
      {
        style: 'currency',
        currency: quoteDetails.selectedCurrency,
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      }
    ).format(convertedAmount);
  };
  
  const displayPrice = (amount: number) => {
    if (!quoteDetails.showSecondCurrency) {
      return formatCurrency(amount);
    }
    
    return (
      <div>
        {formatCurrency(amount)}
        <p className="text-xs text-gray-500">
          {formatSecondaryCurrency(amount)}
        </p>
      </div>
    );
  };

  const getSubscriptionName = () => {
    switch(quoteDetails.subscriptionType) {
      case 'monthly': return 'Monthly';
      case 'pilot': return '3-Month Pilot';
      case 'yearly': return 'Annual';
      default: return 'Subscription';
    }
  };

  const getPricingPeriod = () => {
    switch(quoteDetails.subscriptionType) {
      case 'monthly': return 'per month';
      case 'pilot': return 'for 3 months';
      case 'yearly': return 'per year';
      default: return '';
    }
  };

  // Create quote details for the total contract value component
  const quoteTotalDetails = {
    ...quoteDetails,
    totalCameras: quoteDetails.cameras,
    serverCount: quoteDetails.edgeServerCount,
    serverBaseCost: pricingData.additionalCosts.edgeServer.cost,
    totalOneTimeCost: quoteDetails.pricing.edgeServerCost,
    discountedMonthlyRecurring: quoteDetails.subscriptionType === 'monthly' ? quoteDetails.pricing.total - quoteDetails.pricing.edgeServerCost : 0,
    discountedAnnualRecurring: quoteDetails.subscriptionType === 'yearly' ? quoteDetails.pricing.total - quoteDetails.pricing.edgeServerCost : 0,
    contractLength: quoteDetails.subscriptionType === 'yearly' ? 12 : 1,
    includeImplementationCost: false,
    implementationCost: 0,
    secondaryCurrency: quoteDetails.selectedCurrency,
  };

  const quoteNumber = `P-${Date.now().toString().slice(-6)}`;
  const currentDate = new Date().toLocaleDateString();

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 print:hidden">
        <Button variant="outline" onClick={handleSaveQuote}>
          <Save className="h-4 w-4 mr-2" />
          Save Quote
        </Button>
        <Button onClick={handleGenerateQuote}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Quote Document */}
      <div ref={quoteRef} className="bg-white p-6 shadow-lg rounded-lg text-sm">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-3">
            <img 
              src={branding.logo} 
              alt={branding.companyName} 
              className="h-10 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">QUOTE</h1>
              <p className="text-xs text-gray-600">Pallet Productivity Analytics</p>
            </div>
          </div>
          <div className="text-right text-xs">
            <p className="text-gray-600">Date: {currentDate}</p>
            <p className="text-gray-600">Quote #: {quoteNumber}</p>
          </div>
        </div>

        {/* From/To Section */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">FROM</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-medium">{pricingData.companyInfo.name}</p>
              <p>{pricingData.companyInfo.address}</p>
              <p>{pricingData.companyInfo.city}, {pricingData.companyInfo.state} {pricingData.companyInfo.zip}</p>
              <p>Ph: {pricingData.companyInfo.phone}</p>
              <p>Email: {pricingData.companyInfo.email}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm">TO</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-medium">{quoteDetails.clientInfo.name}</p>
              <p className="font-medium">{quoteDetails.clientInfo.company}</p>
              <p>{quoteDetails.clientInfo.address}</p>
              <p>{quoteDetails.clientInfo.city}, {quoteDetails.clientInfo.state} {quoteDetails.clientInfo.zip}</p>
              <p>{quoteDetails.clientInfo.email}</p>
            </div>
          </div>
        </div>

        {/* Package Summary */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-blue-600 mb-3">PACKAGE SUMMARY</h3>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-4 gap-3 text-xs">
              <div>
                <p className="font-medium text-gray-900">Package</p>
                <p className="text-gray-600 mb-2">Pallet Productivity Tracking</p>
                <div className="space-y-1">
                  {pricingData.selectedScenarios.map((scenario: string, index: number) => (
                    <div key={index} className="flex items-center space-x-1">
                      <CheckCircle className="h-2 w-2 text-green-500" />
                      <span className="text-xs text-gray-600">{scenario}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium text-gray-900">Cameras</p>
                <p className="text-gray-600">{quoteDetails.cameras}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Subscription</p>
                <p className="text-gray-600">{getSubscriptionName()}</p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Hardware</p>
                <p className="text-gray-600">{quoteDetails.includeEdgeServer ? 'Included' : 'Not Included'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tiered Pricing Table */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-blue-600 mb-2">PRICING TABLE</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left text-xs font-medium text-gray-900 border-r border-gray-200">
                    Camera Count
                  </th>
                  <th className="p-2 text-left text-xs font-medium text-gray-900 border-r border-gray-200">
                    Monthly Rate
                    <span className="block text-xs font-normal text-gray-500">per camera/month</span>
                  </th>
                  <th className="p-2 text-left text-xs font-medium text-gray-900">
                    Annual Rate
                    <span className="block text-xs font-normal text-gray-500">per camera/month</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-2 text-xs border-r border-gray-200">1-8 Cameras</td>
                  <td className="p-2 text-xs border-r border-gray-200">
                    {displayPrice(pricingData.pricing.monthly.core.upTo8Cameras)}
                  </td>
                  <td className="p-2 text-xs">
                    {displayPrice(pricingData.pricing.yearly.core.upTo8Cameras)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-xs border-r border-gray-200">9-16 Cameras</td>
                  <td className="p-2 text-xs border-r border-gray-200">
                    {displayPrice(pricingData.pricing.monthly.core.upTo16Cameras)}
                  </td>
                  <td className="p-2 text-xs">
                    {displayPrice(pricingData.pricing.yearly.core.upTo16Cameras)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 text-xs border-r border-gray-200">17+ Cameras</td>
                  <td className="p-2 text-xs border-r border-gray-200">
                    {displayPrice(pricingData.pricing.monthly.core.over16Cameras)}
                  </td>
                  <td className="p-2 text-xs">
                    {displayPrice(pricingData.pricing.yearly.core.over16Cameras)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-blue-600 mb-3">PRICING SUMMARY</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3 text-xs font-medium text-gray-900">Description</th>
                  <th className="text-center p-3 text-xs font-medium text-gray-900">Quantity</th>
                  <th className="text-right p-3 text-xs font-medium text-gray-900">Unit Price (avg)</th>
                  <th className="text-right p-3 text-xs font-medium text-gray-900">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="p-3 text-xs">
                    <div>
                      <p className="font-medium">Pallet Productivity Analytics</p>
                      <p className="text-gray-500">{getSubscriptionName()}</p>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-center">{quoteDetails.cameras} cameras</td>
                  <td className="p-3 text-xs text-right">
                    {displayPrice(quoteDetails.cameras > 0 ? quoteDetails.pricing.subscriptionCost / quoteDetails.cameras / (quoteDetails.subscriptionType === 'yearly' ? 12 : quoteDetails.subscriptionType === 'pilot' ? 3 : 1) : 0)}
                    <div className="text-xs text-gray-500">
                      {quoteDetails.subscriptionType === 'monthly' ? '/month' : 
                       quoteDetails.subscriptionType === 'pilot' ? '/month' : 'per camera/month'}
                    </div>
                  </td>
                  <td className="p-3 text-xs text-right font-medium">{displayPrice(quoteDetails.pricing.subscriptionCost)}</td>
                </tr>
                
                {quoteDetails.includeEdgeServer && quoteDetails.edgeServerCount > 0 && (
                  <tr>
                    <td className="p-3 text-xs">
                      <div>
                        <p className="font-medium">Edge Server Hardware</p>
                        <p className="text-gray-500">One-time cost</p>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-center">{quoteDetails.edgeServerCount}</td>
                    <td className="p-3 text-xs text-right">{formatCurrency(pricingData.additionalCosts.edgeServer.cost)}</td>
                    <td className="p-3 text-xs text-right font-medium">{displayPrice(quoteDetails.pricing.edgeServerCost)}</td>
                  </tr>
                )}
                
                {quoteDetails.discountPercentage > 0 && (
                  <tr className="bg-green-50">
                    <td className="p-3 text-xs font-medium text-green-700" colSpan={3}>
                      Discount ({quoteDetails.discountPercentage}%)
                    </td>
                    <td className="p-3 text-xs text-right font-medium text-green-700">
                      -{displayPrice(quoteDetails.pricing.discountAmount)}
                    </td>
                  </tr>
                )}
                
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td className="p-3 text-sm font-bold text-blue-900" colSpan={3}>TOTAL</td>
                  <td className="p-3 text-sm text-right font-bold text-blue-900">
                    {displayPrice(quoteDetails.pricing.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Standard Features */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-blue-600 mb-3">STANDARD FEATURES</h3>
          <div className="grid grid-cols-2 gap-2">
            {pricingData.standardFeatures.map((feature: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Check className="h-3 w-3 text-green-500" />
                <span className="text-xs text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 mt-6">
          <div className="text-center text-xs text-gray-600">
            <p className="mb-1">This quote is valid for 30 days from the date of issue.</p>
            <p>For questions about this quote, please contact us at {pricingData.companyInfo.email} or {pricingData.companyInfo.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalletQuotePreview; 