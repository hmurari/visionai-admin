import { formatCurrency, formatCurrencyWithExchange, getCurrencySymbol } from '../../utils/formatters';
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
  // Format secondary currency
  const formatSecondaryCurrency = (amount: number) => {
    if (!quoteDetails.exchangeRate || !quoteDetails.secondaryCurrency || isNaN(amount)) return '';
    return formatCurrencyWithExchange(amount, quoteDetails.secondaryCurrency, quoteDetails.exchangeRate);
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
    return quoteDetails.serverCount || Math.ceil(quoteDetails.totalCameras / 20);
  };

  const edgeServers = calculateEdgeServers();
  const serverCost = (quoteDetails.serverCount || 1) * (quoteDetails.serverBaseCost || 2000);
  const packageType = quoteDetails.isEverythingPackage ? "Everything Package" : "Core Package";

  // Get currency symbol for the secondary currency
  const secondaryCurrencySymbol = quoteDetails.showSecondCurrency && quoteDetails.secondaryCurrency
    ? getCurrencySymbol(quoteDetails.secondaryCurrency)
    : '';

  return (
    <div className="quote-section quote-pricing-summary">
      <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
        PRICING SUMMARY
      </h3>
      
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
                  <div className="font-medium">Edge Servers</div>
                  <div className="text-sm text-gray-500">
                    {quoteDetails.serverCount || 1} server{(quoteDetails.serverCount || 1) > 1 ? 's' : ''} × {formatCurrency(quoteDetails.serverBaseCost || 2000)} per server
                  </div>
                </td>
                <td className="p-2 text-right">
                  <div>
                    <span className="text-md font-bold">{formatCurrency(serverCost)}</span>
                    <span className="text-sm text-gray-500 ml-1">one-time</span>
                    
                    {quoteDetails.showSecondCurrency && (
                      <p className="text-sm text-gray-500">
                        {formatSecondaryCurrency(serverCost)}
                        <span className="ml-1">one-time</span>
                      </p>
                    )}
                  </div>
                </td>
              </tr>
              
              {/* Implementation Cost Row - only show if included */}
              {quoteDetails.includeImplementationCost && quoteDetails.implementationCost > 0 && (
                <tr className="border-t border-gray-200">
                  <td className="p-2 border-r border-gray-200 align-top">
                    <div className="font-medium">Implementation Fee</div>
                    <div className="text-sm text-gray-500">
                      One-time implementation and setup fee
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    <div>
                      <span className="text-md font-bold">{formatCurrency(quoteDetails.implementationCost)}</span>
                      <span className="text-sm text-gray-500 ml-1">one-time</span>
                      
                      {quoteDetails.showSecondCurrency && (
                        <p className="text-sm text-gray-500">
                          {formatSecondaryCurrency(quoteDetails.implementationCost)}
                          <span className="ml-1">one-time</span>
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              
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
                      <span className="text-sm ml-1">
                        {quoteDetails.subscriptionType === 'monthly' ? 'per month' : 'per year'}
                      </span>
                      
                      {quoteDetails.showSecondCurrency && (
                        <p className="text-sm text-red-400">
                          -{formatSecondaryCurrency(quoteDetails.discountAmount || 0)}
                          <span className="ml-1">
                            {quoteDetails.subscriptionType === 'monthly' ? 'per month' : 'per year'}
                          </span>
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              
              <tr className="border-t border-gray-200">
                <td className="p-2 border-r border-gray-200">
                  <div className="font-semibold">4-Week Onboarding</div>
                  <div className="text-sm text-gray-500">
                    Configuration & model tuning
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
      
      {/* Total Contract Value Component */}
      <div className="mt-6">
        <QuoteTotalContractValue 
          quoteDetails={quoteDetails} 
          branding={branding} 
        />
      </div>
    </div>
  );
} 