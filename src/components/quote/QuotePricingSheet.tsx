import { pricingDataV2 } from '@/data/pricing_v2';
import { Branding } from '@/types/quote';
import { SubscriptionTabs } from './SubscriptionTabs';

interface QuoteAdditionalCameraPricingProps {
  showSecondCurrency?: boolean;
  secondaryCurrency?: string;
  exchangeRate?: number;
  branding: Branding;
  subscriptionType: string;
  onSubscriptionChange?: (type: string) => void;
}

export function QuotePricingSheet({ 
  showSecondCurrency, 
  secondaryCurrency, 
  exchangeRate,
  branding,
  subscriptionType = 'monthly',
  onSubscriptionChange
}: QuoteAdditionalCameraPricingProps) {
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
    if (!exchangeRate || !secondaryCurrency || isNaN(amount)) return '';
    
    // Convert USD to secondary currency using the exchange rate
    const convertedAmount = amount * exchangeRate;
    
    // Format based on the selected currency
    return new Intl.NumberFormat(
      secondaryCurrency === 'INR' ? 'en-IN' : 'en-US', 
      {
        style: 'currency',
        currency: secondaryCurrency,
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      }
    ).format(convertedAmount);
  };

  // Check if this is perpetual license or pilot - declare early
  const isPerpetual = subscriptionType === 'perpetual';
  const isPilot = subscriptionType === 'threeMonth';

  // Get subscription discount
  const getSubscriptionDiscount = () => {
    // For pilot, use annual discount (20%)
    if (isPilot) {
      const annualSubscription = pricingDataV2.subscriptionTypes.find(
        sub => sub.id === 'yearly'
      );
      return annualSubscription ? annualSubscription.discount : 0;
    }
    
    const subscription = pricingDataV2.subscriptionTypes.find(
      sub => sub.id === subscriptionType
    );
    return subscription ? subscription.discount : 0;
  };

  // Apply discount to price
  const applyDiscount = (price: number) => {
    const discount = getSubscriptionDiscount();
    return price * (1 - discount);
  };

  // Calculate perpetual pricing (annual with 20% discount * 3)
  const calculatePerpetualPrice = (monthlyPrice: number) => {
    const annualPrice = monthlyPrice * 12;
    const annualWithDiscount = annualPrice * (1 - 0.2); // 20% discount
    return annualWithDiscount * 3; // Multiply by 3 for perpetual
  };

  // Get subscription name for display
  const getSubscriptionName = () => {
    const subscription = pricingDataV2.subscriptionTypes.find(
      sub => sub.id === subscriptionType
    );
    return subscription ? subscription.name : 'Monthly';
  };

  // Get discount percentage for display
  const getDiscountPercentage = () => {
    const discount = getSubscriptionDiscount();
    return discount * 100;
  };

  const discountPercentage = getDiscountPercentage();
  const hasDiscount = discountPercentage > 0;

  // Get base package price from pricing data (no discount applied to base price)
  const basePackagePrice = pricingDataV2.basePackage.price;
  const includedCameras = pricingDataV2.basePackage.includedCameras;

  return (
    <div className="mb-6 quote-section quote-pricing-sheet">
      <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
        PRICING SHEET
      </h3>
      
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-2 text-left font-medium border-r border-gray-200">Item</th>
              <th className="p-2 text-center font-medium" colSpan={2}>Price</th>
            </tr>
          </thead>
          <tbody>
            {/* Base Package Row */}
            <tr className="border-b border-gray-200">
              <td className="p-2 border-r border-gray-200">
                <div className="font-medium">AI Server</div>
                <div className="text-xs text-gray-500">Supports up to 20 cameras</div>
              </td>
              <td className="p-2 text-center" colSpan={2}>
                <div className="font-medium">{formatCurrency(2000)} one-time</div>
                {showSecondCurrency && (
                  <div className="text-xs text-gray-500">
                    {formatSecondaryCurrency(2000)}
                  </div>
                )}
              </td>
            </tr>
            
            {/* Package Headers Row */}
            <tr className="bg-gray-50 border-b border-gray-200">
              <td className="p-2 text-left font-medium border-r border-gray-200">
                <div>Total Cameras</div>
                
                {/* Show subscription tabs only if not perpetual */}
                {!isPerpetual && (
                  <SubscriptionTabs 
                    subscriptionType={isPilot ? 'yearly' : subscriptionType} 
                    className="mt-1"
                    onSubscriptionChange={onSubscriptionChange}
                    interactive={!!onSubscriptionChange}
                  />
                )}
                
                {/* Show perpetual tab if perpetual is selected */}
                {isPerpetual && (
                  <SubscriptionTabs 
                    subscriptionType={subscriptionType} 
                    className="mt-1"
                    onSubscriptionChange={onSubscriptionChange}
                    interactive={!!onSubscriptionChange}
                    showPerpetual={true}
                  />
                )}
                
                {hasDiscount && !isPerpetual && !isPilot && (
                  <div className="text-xs font-normal mt-1" style={{ color: "green" }}>
                    {discountPercentage}% discount per camera/month applied
                  </div>
                )}
              </td>
              <td className="p-2 text-center font-medium border-r border-gray-200">
                <div>Core Package</div>
                {!isPerpetual && <div className="text-xs font-normal text-gray-500">per camera/month</div>}
              </td>
              <td className="p-2 text-center font-medium">
                <div>Everything Package</div>
                {!isPerpetual && <div className="text-xs font-normal text-gray-500">per camera/month</div>}
              </td>
            </tr>
            
            {/* Additional Camera Pricing Rows */}
            {pricingDataV2.additionalCameraPricing.corePackage.map((tier, index) => {
              const originalCorePrice = tier.pricePerMonth;
              const originalEverythingPrice = pricingDataV2.additionalCameraPricing.everythingPackage[index].pricePerMonth;
              
              let displayCorePrice, displayEverythingPrice;
              
              if (isPerpetual) {
                // For perpetual: show per camera perpetual price
                displayCorePrice = calculatePerpetualPrice(originalCorePrice);
                displayEverythingPrice = calculatePerpetualPrice(originalEverythingPrice);
              } else if (isPilot) {
                // For pilot: show annual pricing (yearly discount applied)
                displayCorePrice = applyDiscount(originalCorePrice);
                displayEverythingPrice = applyDiscount(originalEverythingPrice);
              } else {
                // For subscription: apply discount
                displayCorePrice = applyDiscount(originalCorePrice);
                displayEverythingPrice = applyDiscount(originalEverythingPrice);
              }
              
              return (
                <tr key={index} className={index > 0 ? "border-t border-gray-200" : ""}>
                  <td className="p-2 border-r border-gray-200">{tier.range}</td>
                  <td className="p-2 text-center border-r border-gray-200">
                    <div className="font-medium">{formatCurrency(displayCorePrice)}{isPerpetual ? ' per camera' : ''}</div>
                    {showSecondCurrency && (
                      <div className="text-xs text-gray-500">
                        {formatSecondaryCurrency(displayCorePrice)}
                      </div>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    <div className="font-medium">{formatCurrency(displayEverythingPrice)}{isPerpetual ? ' per camera' : ''}</div>
                    {showSecondCurrency && (
                      <div className="text-xs text-gray-500">
                        {formatSecondaryCurrency(displayEverythingPrice)}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 