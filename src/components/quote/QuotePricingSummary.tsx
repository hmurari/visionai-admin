import { formatCurrency } from '@/utils/formatters';
import { Branding, QuoteDetailsV2 } from '@/types/quote';
import { pricingDataV2 } from '@/data/pricing_v2';
import { QuoteTotalContractValue } from './QuoteTotalContractValue';
import { SubscriptionTabs } from './SubscriptionTabs';

interface QuotePricingSummaryProps {
  quoteDetails: QuoteDetailsV2;
  branding: Branding;
  onSubscriptionChange?: (type: string) => void;
}

export function QuotePricingSummary({ quoteDetails, branding, onSubscriptionChange }: QuotePricingSummaryProps) {
  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '$0';
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
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

  // Get subscription name
  const getSubscriptionName = () => {
    const subscription = pricingDataV2.subscriptionTypes.find(
      sub => sub.id === quoteDetails.subscriptionType
    );
    return subscription ? subscription.name : 'Monthly';
  };

  // Calculate number of edge servers needed
  const calculateEdgeServers = () => {
    const serversNeeded = Math.ceil(quoteDetails.totalCameras / 20);
    return serversNeeded;
  };

  const edgeServers = calculateEdgeServers();
  const packageType = quoteDetails.isEverythingPackage ? "Everything Package" : "Core Package";

  // Get currency symbol for the secondary currency
  const getCurrencySymbol = (currencyCode: string) => {
    switch (currencyCode) {
      case 'INR':
        return '₹';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return currencyCode + ' ';
    }
  };

  const secondaryCurrencySymbol = quoteDetails.showSecondCurrency ? 
    getCurrencySymbol(quoteDetails.secondaryCurrency) : '';

  return (
    <div className="mb-8">
      <div className="mb-64"> </div>
      <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
        PRICING SUMMARY
      </h3>
      <div className="mb-4"> </div>
      
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
                <th className="p-2 text-left font-bold text-sm bg-blue-50 border-r border-gray-200" style={{ color: branding.primaryColor }}>
                  Description
                </th>
                <th className="p-2 text-right font-bold text-sm bg-blue-50 w-1/4" style={{ color: branding.primaryColor }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200">
                <td className="p-2 border-r border-gray-200 align-top">
                  <div className="font-medium">Base Price</div>
                  <div className="text-sm text-gray-500">
                    Starter Kit, Edge Server included
                  </div>
                </td>
                <td className="p-2 text-right">
                  <div>
                    <span className="text-md font-bold">{formatCurrency(quoteDetails.oneTimeBaseCost || 2000)}</span>
                    <span className="text-sm text-gray-500 ml-1">one-time</span>
                    
                    {quoteDetails.showSecondCurrency && (
                      <p className="text-sm text-gray-500">
                        {formatSecondaryCurrency(quoteDetails.oneTimeBaseCost || 2000)}
                        <span className="ml-1">one-time</span>
                      </p>
                    )}
                  </div>
                </td>
              </tr>
              
              {quoteDetails.totalCameras > 0 && (
                <tr className="border-t border-gray-200">
                  <td className="p-2 border-r border-gray-200 align-top">
                    <div className="font-medium">Camera Subscription</div>
                    <div className="text-sm text-gray-500 mb-2">
                      {quoteDetails.totalCameras} cameras × {formatCurrency(quoteDetails.additionalCameraCost)} per camera
                      {quoteDetails.subscriptionType === 'monthly' ? '/month' : '/month × 12 months'}
                    </div>
                    
                    {/* Use the updated SubscriptionTabs component with interactive prop */}
                    <SubscriptionTabs 
                      subscriptionType={quoteDetails.subscriptionType} 
                      className="mt-2 mb-1"
                      onSubscriptionChange={onSubscriptionChange}
                      interactive={!!onSubscriptionChange}
                    />
                  </td>
                  <td className="p-2 text-right">
                    <div>
                      {quoteDetails.subscriptionType === 'monthly' ? (
                        <>
                          <span className="text-md font-bold">{formatCurrency(quoteDetails.totalCameras * quoteDetails.additionalCameraCost || 0)}</span>
                          <span className="text-sm text-gray-500 ml-1">per month</span>
                        </>
                      ) : (
                        <>
                          <span className="text-md font-bold">{formatCurrency(quoteDetails.totalCameras * quoteDetails.additionalCameraCost * 12 || 0)}</span>
                          <span className="text-sm text-gray-500 ml-1">per year</span>
                        </>
                      )}
                      
                      {quoteDetails.showSecondCurrency && (
                        <p className="text-sm text-gray-500">
                          {quoteDetails.subscriptionType === 'monthly' 
                            ? formatSecondaryCurrency(quoteDetails.totalCameras * quoteDetails.additionalCameraCost || 0)
                            : formatSecondaryCurrency(quoteDetails.totalCameras * quoteDetails.additionalCameraCost * 12 || 0)
                          }
                          <span className="ml-1">{quoteDetails.subscriptionType === 'monthly' ? 'per month' : 'per year'}</span>
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              
              {quoteDetails.discountPercentage > 0 && (
                <tr className="border-t border-gray-200">
                  <td className="p-2 border-r border-gray-200 align-top">
                    <div className="font-medium text-red-600">Additional Discount ({quoteDetails.discountPercentage}%)</div>
                    <div className="text-sm text-gray-500">
                      Special offer for early adopters
                    </div>
                  </td>
                  <td className="p-2 text-right text-red-500">
                    <div>
                      <span className="text-md font-bold">-{formatCurrency(quoteDetails.discountAmount || 0)}</span>
                      <span className="text-sm ml-1">per year</span>
                      
                      {quoteDetails.showSecondCurrency && (
                        <p className="text-sm text-red-400">
                          -{formatSecondaryCurrency(quoteDetails.discountAmount || 0)}
                          <span className="ml-1">per year</span>
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              
              {/* <tr className="border-t border-gray-200">
                <td className="p-2 border-r border-gray-200">
                  <div className="font-semibold">Edge Server (x{edgeServers})</div>
                  <div className="text-sm text-gray-500">
                    Each server supports up to 20 Cameras
                  </div>
                </td>
                <td className="p-2 text-right">
                  <div>
                    <span className="font-semibold">{formatCurrency(0)}</span>
                    <span className="text-sm text-gray-500 ml-1">(included)</span>
                  </div>
                  {quoteDetails.showSecondCurrency && (
                    <div className="text-sm text-gray-500">
                      {secondaryCurrencySymbol}0
                    </div>
                  )}
                </td>
              </tr> */}
              
              <tr className="border-t border-gray-200">
                <td className="p-2 border-r border-gray-200">
                  <div className="font-semibold">Implementation Cost</div>
                  <div className="text-sm text-gray-500">
                    4 week whiteglove onboarding, configuration & model tuning
                  </div>
                </td>
                <td className="p-2 text-right">
                  <div>
                    <span className="font-semibold">{formatCurrency(0)}</span>
                    <span className="text-sm text-gray-500 ml-1">(included)</span>
                  </div>
                  {quoteDetails.showSecondCurrency && (
                    <div className="text-sm text-gray-500">
                      {secondaryCurrencySymbol}0
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <QuoteTotalContractValue quoteDetails={quoteDetails} branding={branding} />
    </div>
  );
} 