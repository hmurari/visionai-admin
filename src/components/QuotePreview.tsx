import { useRef, useEffect } from 'react';
import { 
  Check, 
  CheckCircle,
  Download,
  CircleMinus
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { generatePDF } from '@/utils/pdfUtils';

interface ClientInfo {
  name: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
}

interface QuoteDetails {
  clientInfo: ClientInfo;
  cameras: number;
  subscriptionType: string;
  selectedScenario: string;
  scenarioName: string;
  deploymentType: string;
  includeEdgeServer: boolean;
  includeImplementation: boolean;
  discountPercentage: number;
  date: string;
  exchangeRate?: number;
  secondaryCurrency?: string;
  showSecondCurrency?: boolean;
  perCameraPerMonth?: number;
  basePrice?: number;
  discountedBasePrice?: number;
  discountAmount?: number;
  infrastructureCost?: number;
  infraCostPerCamera?: number;
  edgeServerCost?: number;
  implementationCost?: number;
  annualRecurring?: number;
  monthlyRecurring?: number;
  oneTimeCosts?: number;
  totalContractValue?: number;
  contractLength?: number;
  totalCost?: number;
  useCustomPricing?: boolean;
  customPricing?: any;
}

interface Branding {
  logo: string;
  companyName: string;
  primaryColor: string;
}

interface QuotePreviewProps {
  quoteDetails: QuoteDetails;
  branding: Branding;
  pricingData: any;
  onDownload?: () => void;
}

const QuotePreview = ({ quoteDetails, branding, pricingData, onDownload }: QuotePreviewProps) => {
  const quoteRef = useRef<HTMLDivElement>(null);

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
      },
      onDownload
    );
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '$0';
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    }).format(amount);
    
    return formatted;
  };
  
  // Format secondary currency
  const formatSecondaryCurrency = (amount: number) => {
    if (!quoteDetails.exchangeRate || !quoteDetails.secondaryCurrency || isNaN(amount)) return '';
    
    // Convert USD to secondary currency using the exchange rate
    const convertedAmount = amount * quoteDetails.exchangeRate;
    
    // Format based on the selected currency
    return new Intl.NumberFormat(
      quoteDetails.secondaryCurrency === 'INR' ? 'en-IN' : 'en-US', 
      {
        style: 'currency',
        currency: quoteDetails.secondaryCurrency,
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      }
    ).format(convertedAmount);
  };
  
  // Helper function to display price with secondary currency if needed
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
      case 'monthly': return 'Monthly Subscription';
      case 'yearly': return '1 Year Agreement';
      case 'threeYear': return '3 Year Agreement';
      default: return 'Subscription';
    }
  };

  // Determine if we should show annual or monthly pricing
  const isAnnualBilling = quoteDetails.subscriptionType === 'yearly' || quoteDetails.subscriptionType === 'threeYear';
  const recurringAmount = isAnnualBilling ? quoteDetails.annualRecurring : quoteDetails.monthlyRecurring;
  const billingPeriod = isAnnualBilling ? 'year' : 'month';

  // Get all scenarios for display
  const allScenarios = [
    "PPE Compliance", "Area Controls", "Forklift Safety", "Emergency Events", 
    "Hazard Warnings", "Behavioral Safety", "Mobile Phone Compliance", 
    "Staircase Safety", "Housekeeping", "Headcounts", "Occupancy Metrics",
    "Spills & Leaks Detection"
  ];

  // Get base camera pricing for display based on subscription type and package
  const getBaseCameraPricing = () => {
    // If custom pricing is enabled, use those values
    if (quoteDetails.useCustomPricing && quoteDetails.customPricing) {
      return {
        upTo20Price: quoteDetails.customPricing.tier1Price,
        additionalPrice: quoteDetails.customPricing.tier2Price,
        volumeDiscountPrice: quoteDetails.customPricing.tier3Price,
        infraCostPerCamera: quoteDetails.customPricing.infrastructureCost
      };
    }
    
    // Otherwise use standard pricing
    const subscriptionPricing = pricingData?.pricing?.[quoteDetails.subscriptionType] || {
      [quoteDetails.selectedScenario]: {
        upTo20Cameras: 60,
        upTo100Cameras: 50,
        over100Cameras: 45
      },
      infrastructureCost: 15
    };
    
    // Determine which pricing to use based on the selected scenario
    let scenarioPricing;
    
    // For single scenario options, use the "single" pricing
    if (quoteDetails.selectedScenario === 'single_ppe' || 
        quoteDetails.selectedScenario === 'single_mobile' || 
        quoteDetails.selectedScenario === 'single_staircase' || 
        quoteDetails.selectedScenario === 'single_spills' ||
        quoteDetails.selectedScenario === 'ppe' || 
        quoteDetails.selectedScenario === 'mobile' || 
        quoteDetails.selectedScenario === 'staircase' || 
        quoteDetails.selectedScenario === 'spills') {
      scenarioPricing = subscriptionPricing.single;
    } else {
      // For everything and core packages, use their specific pricing
      scenarioPricing = subscriptionPricing[quoteDetails.selectedScenario];
    }
    
    // If scenarioPricing is still undefined, fall back to a default pricing
    if (!scenarioPricing) {
      console.warn(`Pricing not found for scenario: ${quoteDetails.selectedScenario}, using default pricing instead`);
      scenarioPricing = {
        upTo20Cameras: 60,
        upTo100Cameras: 50,
        over100Cameras: 45
      };
    }
    
    return {
      upTo20Price: scenarioPricing.upTo20Cameras,
      additionalPrice: scenarioPricing.upTo100Cameras,
      volumeDiscountPrice: scenarioPricing.over100Cameras,
      infraCostPerCamera: subscriptionPricing.infrastructureCost || 15
    };
  };
  
  const cameraPricing = getBaseCameraPricing();
  
  // Calculate infrastructure costs if applicable
  const infraCostPerCamera = quoteDetails.deploymentType === 'visionify' ? cameraPricing.infraCostPerCamera : 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Quote Preview</h2>
      </div>
      
      <div ref={quoteRef} className="quote-preview-container bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-[210mm] mx-auto">
        {/* Header with logo */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <img 
              src={branding.logo} 
              alt={branding.companyName} 
              className="h-12 mb-2" 
            />
            {/* <h1 className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
              {branding.companyName}
            </h1> */}
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold mb-1">QUOTE</h2>
            <p className="text-gray-600">Date: {quoteDetails.date}</p>
            <p className="text-gray-600">Quote #: VIS-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
            {quoteDetails.showSecondCurrency && (
              <p className="text-gray-500 text-sm">
                Exchange Rate: 1 USD = {quoteDetails.exchangeRate?.toFixed(2)} {quoteDetails.secondaryCurrency}
                {quoteDetails.lastUpdated && ` (as of ${new Date(quoteDetails.lastUpdated).toLocaleDateString()})`}
              </p>
            )}
          </div>
        </div>
        
        <div className="mb-16">  {/* Previous content */}</div>
        {/* FROM & TO Section */}
        <div className="grid grid-cols-2 gap-4 mb-8 border border-gray-200 rounded-md overflow-hidden">
          <div className="p-4 border-r border-gray-200">
            <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
              FROM
            </h3>
            <p className="text-sm">Visionify, Inc.</p>
            <p className="text-sm">1499, W 120th Ave, Ste 110</p>
            <p className="text-sm">Westminster, CO 80234</p>
            <p className="text-sm">Ph: 720-449-1124</p>
            <p className="text-sm">Email: sales@visionify.ai</p>
          </div>
          <div className="p-4">
            <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
              TO
            </h3>
            <p className="text-sm">{quoteDetails.clientInfo.name}</p>
            <p className="text-sm">{quoteDetails.clientInfo.company}</p>
            <p className="text-sm">{quoteDetails.clientInfo.address}</p>
            <p className="text-sm">{quoteDetails.clientInfo.city} {quoteDetails.clientInfo.state} {quoteDetails.clientInfo.zip}</p>
            <p className="text-sm">{quoteDetails.clientInfo.email}</p>
          </div>
        </div>
        
        <div className="mb-8">  {/* Previous content */}</div>
        {/* Package Summary */}
        <div className="mb-8">
          <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
            PACKAGE SUMMARY
          </h3>
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left font-bold text-sm border-r border-gray-200 w-1/4">Package</th>
                  <th className="p-2 text-left font-bold text-sm border-r border-gray-200 w-1/4">Cameras</th>
                  <th className="p-2 text-left font-bold text-sm border-r border-gray-200 w-1/4">Subscription</th>
                  <th className="p-2 text-left font-bold text-sm w-1/4">Deployment</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-r border-gray-200">{quoteDetails.scenarioName}</td>
                  <td className="p-2 border-r border-gray-200">{quoteDetails.cameras}</td>
                  <td className="p-2 border-r border-gray-200">{getSubscriptionName()}</td>
                  <td className="p-2">{quoteDetails.deploymentType === 'visionify' ? 'Visionify Cloud' : 'Customer Cloud'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mb-8">  {/* Previous content */}</div>
        {/* Package Details */}
        <div className="mb-8">
          <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
            PACKAGE DETAILS
          </h3>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex flex-wrap gap-2">
              {quoteDetails.selectedScenario === 'everything' ? (
                // For Everything package, show all scenarios
                allScenarios.map((scenario, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-2 rounded-full border border-gray-200 bg-white"
                  >
                    <span className="text-blue-800">✓</span>
                    <span className="text-sm text-gray-800">{scenario}</span>
                  </div>
                ))
              ) : quoteDetails.selectedScenario === 'core' ? (
                // For Core package
                <>
                  <p className="w-full text-sm text-gray-600 italic mb-2">
                    Core package includes any three scenarios of your choice:
                  </p>
                  {allScenarios.map((scenario, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full border ${
                        index < 3 
                          ? 'border-gray-200 bg-white' 
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <span className={index < 3 ? 'text-blue-500' : 'text-gray-400'}>
                        {index < 3 ? '✓' : '−'}
                      </span>
                      <span className={`text-sm ${
                        index < 3 ? 'text-gray-800' : 'text-gray-400'
                      }`}>{scenario}</span>
                    </div>
                  ))}
                </>
              ) : quoteDetails.selectedScenario.startsWith('single_') ? (
                // For single scenario packages
                allScenarios.map((scenario, index) => {
                  const isSelected = 
                    (quoteDetails.selectedScenario === 'single_ppe' && scenario === 'PPE Compliance') ||
                    (quoteDetails.selectedScenario === 'single_mobile' && scenario === 'Mobile Phone Compliance') ||
                    (quoteDetails.selectedScenario === 'single_staircase' && scenario === 'Staircase Safety') ||
                    (quoteDetails.selectedScenario === 'single_spills' && scenario === 'Spills & Leaks Detection') ||
                    (quoteDetails.selectedScenario === 'ppe' && scenario === 'PPE Compliance') ||
                    (quoteDetails.selectedScenario === 'mobile' && scenario === 'Mobile Phone Compliance') ||
                    (quoteDetails.selectedScenario === 'staircase' && scenario === 'Staircase Safety') ||
                    (quoteDetails.selectedScenario === 'spills' && scenario === 'Spills & Leaks Detection');
                  
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full border ${
                        isSelected 
                          ? 'border-gray-200 bg-white' 
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <span className={isSelected ? 'text-blue-500' : 'text-gray-400'}>
                        {isSelected ? '✓' : '−'}
                      </span>
                      <span className={`text-sm ${
                        isSelected ? 'text-gray-800' : 'text-gray-400'
                      }`}>{scenario}</span>
                    </div>
                  );
                })
              ) : (
                // Default case - just show PPE compliance
                allScenarios.map((scenario, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full border ${
                      scenario === 'PPE Compliance' 
                        ? 'border-gray-200 bg-white' 
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <span className={scenario === 'PPE Compliance' ? 'text-blue-500' : 'text-gray-400'}>
                      {scenario === 'PPE Compliance' ? '✓' : '−'}
                    </span>
                    <span className={`text-sm ${
                      scenario === 'PPE Compliance' ? 'text-gray-800' : 'text-gray-400'
                    }`}>{scenario}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">  {/* Previous content */}</div>

        {/* Per Camera Pricing Table */}
        <div className="mb-8">
          <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
            PER CAMERA PRICING
          </h3>
          
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 text-left font-bold text-sm border-r border-gray-200 w-1/5">
                    Camera Count
                  </th>
                  <th className="p-2 text-left font-bold text-sm border-r border-gray-200 w-1/5">
                    License Fee
                    <span className="block text-xs font-normal text-gray-500">per camera/month</span>
                  </th>
                  <th className="p-2 text-left font-bold text-sm border-r border-gray-200 w-1/5">
                    Cloud Costs
                    <span className="block text-xs font-normal text-gray-500">per camera/month</span>
                  </th>
                  <th className="p-2 text-left font-bold text-sm border-r border-gray-200 w-1/5">
                    Monthly Total
                    <span className="block text-xs font-normal text-gray-500">per camera</span>
                  </th>
                  <th className="p-2 text-left font-bold text-sm w-1/5">
                    Annual Total
                    <span className="block text-xs font-normal text-gray-500">per camera</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Tier 1: 1-20 Cameras */}
                <tr className="border-t border-gray-200">
                  <td className="p-2 border-r border-gray-200">1-20 Cameras</td>
                  <td className="p-2 border-r border-gray-200">
                    {formatCurrency(cameraPricing.upTo20Price)}
                    {quoteDetails.showSecondCurrency && (
                      <p className="text-sm text-gray-500">
                        {formatSecondaryCurrency(cameraPricing.upTo20Price)}
                      </p>
                    )}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    {quoteDetails.deploymentType === 'visionify' 
                      ? (
                        <>
                          {formatCurrency(infraCostPerCamera)}
                          {quoteDetails.showSecondCurrency && (
                            <p className="text-sm text-gray-500">
                              {formatSecondaryCurrency(infraCostPerCamera)}
                            </p>
                          )}
                        </>
                      )
                      : 'N/A'}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    {formatCurrency(
                      cameraPricing.upTo20Price + 
                      (quoteDetails.deploymentType === 'visionify' ? infraCostPerCamera : 0)
                    )}
                    {quoteDetails.showSecondCurrency && (
                      <p className="text-sm text-gray-500">
                        {formatSecondaryCurrency(
                          cameraPricing.upTo20Price + 
                          (quoteDetails.deploymentType === 'visionify' ? infraCostPerCamera : 0)
                        )}
                      </p>
                    )}
                  </td>
                  <td className="p-2">
                    {formatCurrency(
                      (cameraPricing.upTo20Price + 
                      (quoteDetails.deploymentType === 'visionify' ? infraCostPerCamera : 0)) * 12
                    )}
                    {quoteDetails.showSecondCurrency && (
                      <p className="text-sm text-gray-500">
                        {formatSecondaryCurrency(
                          (cameraPricing.upTo20Price + 
                          (quoteDetails.deploymentType === 'visionify' ? infraCostPerCamera : 0)) * 12
                        )}
                      </p>
                    )}
                  </td>
                </tr>
                
                {/* Tier 2: 21-99 Cameras */}
                <tr className="border-t border-gray-200">
                  <td className="p-2 border-r border-gray-200">21-99 Cameras</td>
                  <td className="p-2 border-r border-gray-200">
                    {formatCurrency(cameraPricing.additionalPrice)}
                    {quoteDetails.showSecondCurrency && (
                      <p className="text-sm text-gray-500">
                        {formatSecondaryCurrency(cameraPricing.additionalPrice)}
                      </p>
                    )}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    {quoteDetails.deploymentType === 'visionify' 
                      ? (
                        <>
                          {formatCurrency(infraCostPerCamera)}
                          {quoteDetails.showSecondCurrency && (
                            <p className="text-sm text-gray-500">
                              {formatSecondaryCurrency(infraCostPerCamera)}
                            </p>
                          )}
                        </>
                      )
                      : 'N/A'}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    {formatCurrency(
                      cameraPricing.additionalPrice + 
                      (quoteDetails.deploymentType === 'visionify' ? infraCostPerCamera : 0)
                    )}
                    {quoteDetails.showSecondCurrency && (
                      <p className="text-sm text-gray-500">
                        {formatSecondaryCurrency(
                          cameraPricing.additionalPrice + 
                          (quoteDetails.deploymentType === 'visionify' ? infraCostPerCamera : 0)
                        )}
                      </p>
                    )}
                  </td>
                  <td className="p-2">
                    {formatCurrency(
                      (cameraPricing.additionalPrice + 
                      (quoteDetails.deploymentType === 'visionify' ? infraCostPerCamera : 0)) * 12
                    )}
                    {quoteDetails.showSecondCurrency && (
                      <p className="text-sm text-gray-500">
                        {formatSecondaryCurrency(
                          (cameraPricing.additionalPrice + 
                          (quoteDetails.deploymentType === 'visionify' ? infraCostPerCamera : 0)) * 12
                        )}
                      </p>
                    )}
                  </td>
                </tr>
                
                {/* Tier 3: 100+ Cameras */}
                <tr className="border-t border-gray-200">
                  <td className="p-2 border-r border-gray-200">100+ Cameras</td>
                  <td className="p-2 border-r border-gray-200">
                    {formatCurrency(cameraPricing.volumeDiscountPrice)}
                    {quoteDetails.showSecondCurrency && (
                      <p className="text-sm text-gray-500">
                        {formatSecondaryCurrency(cameraPricing.volumeDiscountPrice)}
                      </p>
                    )}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    {quoteDetails.deploymentType === 'visionify' 
                      ? (
                        <>
                          {formatCurrency(infraCostPerCamera)}
                          {quoteDetails.showSecondCurrency && (
                            <p className="text-sm text-gray-500">
                              {formatSecondaryCurrency(infraCostPerCamera)}
                            </p>
                          )}
                        </>
                      )
                      : 'N/A'}
                  </td>
                  <td className="p-2 border-r border-gray-200">
                    {formatCurrency(
                      cameraPricing.volumeDiscountPrice + 
                      (quoteDetails.deploymentType === 'visionify' ? infraCostPerCamera : 0)
                    )}
                    {quoteDetails.showSecondCurrency && (
                      <p className="text-sm text-gray-500">
                        {formatSecondaryCurrency(
                          cameraPricing.volumeDiscountPrice + 
                          (quoteDetails.deploymentType === 'visionify' ? infraCostPerCamera : 0)
                        )}
                      </p>
                    )}
                  </td>
                  <td className="p-2">
                    {formatCurrency(
                      (cameraPricing.volumeDiscountPrice + 
                      (quoteDetails.deploymentType === 'visionify' ? infraCostPerCamera : 0)) * 12
                    )}
                    {quoteDetails.showSecondCurrency && (
                      <p className="text-sm text-gray-500">
                        {formatSecondaryCurrency(
                          (cameraPricing.volumeDiscountPrice + 
                          (quoteDetails.deploymentType === 'visionify' ? infraCostPerCamera : 0)) * 12
                        )}
                      </p>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Force page break before pricing summary */}
        {/* <div className="page-break-before"></div> */}
        <div className="mb-64">  {/* Previous content */}</div>
        
        {/* Pricing Summary section */}
        <div className="mb-8">
          <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
            PRICING SUMMARY
          </h3>
          
          {/* Wrap the entire pricing table in a container with specific styles */}
          <div style={{ 
            display: 'block',
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
            position: 'relative'
          }}>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="w-full" style={{ pageBreakInside: 'avoid' }}>
                <thead>
                  <tr>
                    <th colSpan={2} className="p-2 text-left font-bold text-sm bg-blue-50 border-r border-gray-200 w-3/4" style={{ color: branding.primaryColor }}>
                      Recurring Costs (OPEX)
                    </th>
                    <th colSpan={2} className="p-2 text-left font-bold text-sm bg-green-50 w-1/4" style={{ color: branding.primaryColor }}>
                      One-time Costs (CAPEX)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="p-2 font-medium border-r border-gray-200 w-1/6 align-top">License Fees</td>
                    <td className="p-2 border-r border-gray-200 w-7/12">
                      <div>
                        <span className="text-xl font-bold">{formatCurrency(quoteDetails.discountedBasePrice || 0)}</span>
                        <span className="text-sm text-gray-500 ml-1">per year</span>
                        
                        {quoteDetails.discountPercentage > 0 && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            {formatCurrency(quoteDetails.basePrice || 0)}
                          </span>
                        )}
                        
                        {quoteDetails.showSecondCurrency && (
                          <p className="text-sm text-gray-500">
                            {formatSecondaryCurrency(quoteDetails.discountedBasePrice || 0)}
                            <span className="ml-1">per year</span>
                          </p>
                        )}
                        
                        {quoteDetails.discountPercentage > 0 && (
                          <p className="text-sm text-red-500 mt-1">
                            ({quoteDetails.discountPercentage}% discount applied)
                          </p>
                        )}
                        
                        <div className="pl-3 mt-2 border-l-2 border-gray-200">
                          <p className="text-xs text-gray-500">
                            {formatCurrency(quoteDetails.perCameraPerMonth || 0)}/camera/month × {quoteDetails.cameras} cameras × 12 = {formatCurrency((quoteDetails.perCameraPerMonth || 0) * quoteDetails.cameras * 12)}/year
                          </p>
                          {quoteDetails.discountPercentage > 0 && (
                            <p className="text-xs text-red-500">
                              Discount: -{formatCurrency((quoteDetails.perCameraPerMonth || 0) * quoteDetails.cameras * 12 * (quoteDetails.discountPercentage / 100))}/year ({quoteDetails.discountPercentage}%)
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-2 font-medium border-r border-gray-200 w-1/6 align-top">Edge Server</td>
                    <td className="p-2 w-1/6 align-top">
                      {quoteDetails.includeEdgeServer ? (
                        <div>
                          <p className="text-xl font-bold">{formatCurrency(quoteDetails.edgeServerCost || 0)}</p>
                          {quoteDetails.showSecondCurrency && (
                            <p className="text-sm text-gray-500">
                              {formatSecondaryCurrency(quoteDetails.edgeServerCost || 0)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p>N/A</p>
                      )}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-2 font-medium border-r border-gray-200 align-top">Cloud Costs</td>
                    <td className="p-2 border-r border-gray-200">
                      <div>
                        <span className="text-xl font-bold">{formatCurrency(quoteDetails.infrastructureCost || 0)}</span>
                        <span className="text-sm text-gray-500 ml-1">per year</span>
                        
                        {quoteDetails.showSecondCurrency && (
                          <p className="text-sm text-gray-500">
                            {formatSecondaryCurrency(quoteDetails.infrastructureCost || 0)}
                            <span className="ml-1">per year</span>
                          </p>
                        )}
                        
                        {quoteDetails.deploymentType === 'visionify' && (
                          <div className="pl-3 mt-2 border-l-2 border-gray-200">
                            <p className="text-xs text-gray-500">
                              {formatCurrency(quoteDetails.infraCostPerCamera || 0)}/month × {quoteDetails.cameras} cameras × 12 = {formatCurrency(quoteDetails.infrastructureCost || 0)}/year
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 font-medium border-r border-gray-200 align-top">Implementation Costs</td>
                    <td className="p-2 align-top">
                      {quoteDetails.includeImplementation ? (
                        <div>
                          <p className="text-xl font-bold">{formatCurrency(quoteDetails.implementationCost || 0)}</p>
                          {quoteDetails.showSecondCurrency && (
                            <p className="text-sm text-gray-500">
                              {formatSecondaryCurrency(quoteDetails.implementationCost || 0)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p>N/A</p>
                      )}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td className="p-2 font-bold bg-blue-50 border-r border-gray-200">Total Recurring</td>
                    <td className="p-2 font-bold bg-blue-50 border-r border-gray-200">
                      <span className="text-xl font-bold">{formatCurrency(quoteDetails.annualRecurring || 0)}</span>
                      <span className="text-sm text-gray-600 ml-1">per year</span>
                      
                      {quoteDetails.showSecondCurrency && (
                        <p className="text-sm text-gray-600">
                          {formatSecondaryCurrency(quoteDetails.annualRecurring || 0)}
                          <span className="ml-1">per year</span>
                        </p>
                      )}
                    </td>
                    <td className="p-2 font-bold bg-green-50 border-r border-gray-200">Total One-time</td>
                    <td className="p-2 font-bold bg-green-50">
                      <p className="text-xl font-bold">{formatCurrency(quoteDetails.oneTimeCosts || 0)}</p>
                      {quoteDetails.showSecondCurrency && (
                        <p className="text-sm text-gray-600">
                          {formatSecondaryCurrency(quoteDetails.oneTimeCosts || 0)}
                        </p>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              
              {/* Total Contract Value */}
              <div className="p-4 bg-blue-50 border-t border-gray-200 flex justify-between items-center">
                <p className="font-bold text-sm" style={{ color: branding.primaryColor }}>
                  Total Contract Value ({quoteDetails.contractLength || 12} {(quoteDetails.contractLength || 12) === 1 ? 'month' : 'months'})
                </p>
                <div>
                  <p className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
                    {formatCurrency(quoteDetails.totalContractValue || 0)}
                  </p>
                  {quoteDetails.showSecondCurrency && (
                    <p className="text-sm text-right" style={{ color: branding.primaryColor }}>
                      {formatSecondaryCurrency(quoteDetails.totalContractValue || 0)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Standard Features */}
        <div className="mb-32">  {/* Previous content */}</div>
        <div className="mb-8">
          <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
            STANDARD FEATURES
          </h3>

          <div className="border border-gray-200 rounded-md p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Web & Mobile App",
                "4 weeks whiteglove onboarding",
                "12s Video Clips",
                "1 Year Video Archival",
                "Up to 100 users",
                "TV Wall Feature",
                "Text, Email, MS Teams, WhatsApp",
                "Periodic Reports (daily, weekly)",
                "Speaker Integration (Axis, HikVision)"
              ].map((feature, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="text-blue-600 mr-2 h-4 w-4 mt-0.5" />
                  <p className="text-sm">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer section */}
        <div className="mt-8 text-center border-t border-gray-200 pt-4 footer-section">
          <p className="text-sm text-gray-600">
            Quote valid for 30 days from the date of issue. For questions regarding this quote, please contact sales@visionify.ai
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuotePreview;