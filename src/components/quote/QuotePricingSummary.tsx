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
  const serverCost = (quoteDetails.serverCount || 0) * (quoteDetails.serverBaseCost || 2000);
  const packageType = quoteDetails.isEverythingPackage ? "Everything Package" : "Core Package";

  // Get currency symbol for the secondary currency
  const secondaryCurrencySymbol = quoteDetails.showSecondCurrency && quoteDetails.secondaryCurrency
    ? getCurrencySymbol(quoteDetails.secondaryCurrency)
    : '';

  // Check if this is a pilot
  const isPilot = quoteDetails.subscriptionType === 'threeMonth';

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
              {isPilot ? (
                // Special pilot pricing display
                <tr className="border-t border-gray-200">
                  <td className="p-2 border-r border-gray-200 align-top">
                    <div className="font-medium">3 Month Pilot Program</div>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <div>• 3 Month Subscription for 5 cameras</div>
                      <div>• Loaner Edge Server</div>
                      <div>• Onboarding cameras to Visionify platform</div>
                      <div>• Configuring Zones & AI Scenarios</div>
                      <div>• Onboarding up to 10 users</div>
                      <div>• 4x training Sessions</div>
                      <div>• Travel & Site Survey report</div>
                      <div>• Camera recommendations report</div>
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    <div>
                      <span className="text-md font-bold">{formatCurrency(6000)}</span>
                      <span className="text-sm text-gray-500 ml-1">total</span>
                      
                      {quoteDetails.showSecondCurrency && (
                        <p className="text-sm text-gray-500">
                          {formatSecondaryCurrency(6000)}
                          <span className="ml-1">total</span>
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                // Regular pricing display for non-pilot subscriptions
                <>
                  {quoteDetails.serverCount > 0 && (
                    <tr className="border-t border-gray-200">
                      <td className="p-2 border-r border-gray-200 align-top">
                        <div className="font-medium">Edge Servers</div>
                        <div className="text-sm text-gray-500">
                          {quoteDetails.serverCount} server{quoteDetails.serverCount > 1 ? 's' : ''} × {formatCurrency(quoteDetails.serverBaseCost || 2000)} per server
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
                  )}

                  {quoteDetails.serverCount === 0 && (
                    <tr className="border-t border-gray-200">
                      <td className="p-2 border-r border-gray-200 align-top">
                        <div className="font-medium">Edge Servers</div>
                        <div className="text-sm text-gray-500">
                          Customer will provide their own servers
                        </div>
                      </td>
                      <td className="p-2 text-right">
                        <div>
                          <span className="text-md font-bold">{formatCurrency(0)}</span>
                          <span className="text-sm text-gray-500 ml-1">(not included)</span>
                        </div>
                      </td>
                    </tr>
                  )}
                  
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
                        <div className="font-medium">
                          {quoteDetails.subscriptionType === 'perpetual' ? 'Perpetual License' : 'Camera Subscription'}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {quoteDetails.subscriptionType === 'perpetual' ? (
                            `${quoteDetails.totalCameras} cameras × ${formatCurrency((quoteDetails.perpetualLicenseCost || 0) / quoteDetails.totalCameras)} per camera`
                          ) : (
                            `${quoteDetails.totalCameras} cameras × ${formatCurrency(quoteDetails.monthlyRecurring / quoteDetails.totalCameras)} per camera
                            ${quoteDetails.subscriptionType === 'monthly' ? '/month' : 
                              quoteDetails.subscriptionType === 'threeMonth' ? '/month × 3 months' : '/month × 12 months'}`
                          )}
                        </div>
                        
                        {/* Show subscription tabs only if not perpetual */}
                        {quoteDetails.subscriptionType !== 'perpetual' && (
                          <SubscriptionTabs 
                            subscriptionType={quoteDetails.subscriptionType} 
                            className="mt-2 mb-1"
                            onSubscriptionChange={onSubscriptionChange}
                            interactive={!!onSubscriptionChange}
                          />
                        )}
                        
                        {/* Show perpetual tab if perpetual is selected */}
                        {quoteDetails.subscriptionType === 'perpetual' && (
                          <SubscriptionTabs 
                            subscriptionType={quoteDetails.subscriptionType} 
                            className="mt-2 mb-1"
                            onSubscriptionChange={onSubscriptionChange}
                            interactive={!!onSubscriptionChange}
                            showPerpetual={true}
                          />
                        )}
                      </td>
                      <td className="p-2 text-right">
                        <div>
                          {quoteDetails.subscriptionType === 'perpetual' ? (
                            <>
                              <span className="text-md font-bold">{formatCurrency(quoteDetails.perpetualLicenseCost || 0)}</span>
                              <span className="text-sm text-gray-500 ml-1">one-time</span>
                            </>
                          ) : quoteDetails.subscriptionType === 'monthly' ? (
                            <>
                              <span className="text-md font-bold">{formatCurrency(quoteDetails.monthlyRecurring || 0)}</span>
                              <span className="text-sm text-gray-500 ml-1">per month</span>
                            </>
                          ) : quoteDetails.subscriptionType === 'threeMonth' ? (
                            <>
                              <span className="text-md font-bold">{formatCurrency(quoteDetails.threeMonthRecurring || (quoteDetails.monthlyRecurring * 3) || 0)}</span>
                              <span className="text-sm text-gray-500 ml-1">for 3 months</span>
                            </>
                          ) : (
                            <>
                              <span className="text-md font-bold">{formatCurrency(quoteDetails.annualRecurring || 0)}</span>
                              <span className="text-sm text-gray-500 ml-1">per year</span>
                            </>
                          )}
                          
                          {quoteDetails.showSecondCurrency && (
                            <p className="text-sm text-gray-500">
                              {quoteDetails.subscriptionType === 'perpetual' 
                                ? formatSecondaryCurrency(quoteDetails.perpetualLicenseCost || 0)
                                : quoteDetails.subscriptionType === 'monthly' 
                                  ? formatSecondaryCurrency(quoteDetails.monthlyRecurring || 0)
                                  : quoteDetails.subscriptionType === 'threeMonth'
                                    ? formatSecondaryCurrency(quoteDetails.threeMonthRecurring || (quoteDetails.monthlyRecurring * 3) || 0)
                                    : formatSecondaryCurrency(quoteDetails.annualRecurring || 0)
                              }
                              <span className="ml-1">
                                {quoteDetails.subscriptionType === 'perpetual' 
                                  ? 'one-time'
                                  : quoteDetails.subscriptionType === 'monthly' 
                                    ? 'per month' 
                                    : quoteDetails.subscriptionType === 'threeMonth'
                                      ? 'for 3 months'
                                      : 'per year'}
                              </span>
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {/* Optional AMC for perpetual license */}
                  {quoteDetails.subscriptionType === 'perpetual' && quoteDetails.amcCost && quoteDetails.amcCost > 0 && (
                    <tr className="border-t border-gray-200">
                      <td className="p-2 border-r border-gray-200 align-top">
                        <div className="font-medium">Annual Maintenance Contract (AMC)</div>
                        <div className="text-sm text-gray-500">
                          Support, model & software updates (Optional)
                        </div>
                      </td>
                      <td className="p-2 text-right">
                        <div>
                          <span className="text-md font-bold">{formatCurrency(quoteDetails.amcCost)}</span>
                          <span className="text-sm text-gray-500 ml-1">per year</span>
                          
                          {quoteDetails.showSecondCurrency && (
                            <p className="text-sm text-gray-500">
                              {formatSecondaryCurrency(quoteDetails.amcCost)}
                              <span className="ml-1">per year</span>
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                  
                  {quoteDetails.discountPercentage > 0 && quoteDetails.subscriptionType !== 'perpetual' && (
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
                            {quoteDetails.subscriptionType === 'monthly' 
                              ? 'per month' 
                              : quoteDetails.subscriptionType === 'threeMonth'
                                ? 'for 3 months'
                                : 'per year'}
                          </span>
                          
                          {quoteDetails.showSecondCurrency && (
                            <p className="text-sm text-red-400">
                              -{formatSecondaryCurrency(quoteDetails.discountAmount || 0)}
                              <span className="ml-1">
                                {quoteDetails.subscriptionType === 'monthly' 
                                  ? 'per month' 
                                  : quoteDetails.subscriptionType === 'threeMonth'
                                    ? 'for 3 months'
                                    : 'per year'}
                              </span>
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Total Contract Value Component - hide for pilot */}
      {!isPilot && (
        <div className="mt-6">
          <QuoteTotalContractValue 
            quoteDetails={quoteDetails} 
            branding={branding} 
          />
        </div>
      )}
    </div>
  );
} 