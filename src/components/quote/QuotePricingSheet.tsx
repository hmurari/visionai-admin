import { pricingDataV2 } from '@/data/pricing_v2';
import { Branding } from '@/types/quote';

interface QuoteAdditionalCameraPricingProps {
  showSecondCurrency?: boolean;
  secondaryCurrency?: string;
  exchangeRate?: number;
  branding: Branding;
  subscriptionType: string;
}

export function QuotePricingSheet({ 
  showSecondCurrency, 
  secondaryCurrency, 
  exchangeRate,
  branding,
  subscriptionType = 'monthly'
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

  // Get subscription discount
  const getSubscriptionDiscount = () => {
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
    <div className="mb-6">
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
                <div className="font-medium">Base Price</div>
                <div className="text-xs text-gray-500">{includedCameras} cameras, Edge Server included</div>
              </td>
              <td className="p-2 text-center" colSpan={2}>
                <div className="font-medium">{formatCurrency(basePackagePrice)} per year</div>
                {showSecondCurrency && (
                  <div className="text-xs text-gray-500">
                    {formatSecondaryCurrency(basePackagePrice)}
                  </div>
                )}
              </td>
            </tr>
            {/* Package Headers Row */}
            <tr className="bg-gray-50 border-b border-gray-200">
              <td className="p-2 text-left font-medium border-r border-gray-200">
                <div>Additional Cameras </div>
                {hasDiscount && (
                  <div className="text-xs font-normal" style={{ color: "green" }}>
                    {getSubscriptionName()} pricing with {discountPercentage}% discount
                  </div>
                )}
              </td>
              <td className="p-2 text-center font-medium border-r border-gray-200">
                <div>Core Package</div>
                <div className="text-xs font-normal text-gray-500">per camera/month</div>
              </td>
              <td className="p-2 text-center font-medium">
                <div>Everything Package</div>
                <div className="text-xs font-normal text-gray-500">per camera/month</div>
              </td>
            </tr>
            
            {/* Additional Camera Pricing Rows */}
            {pricingDataV2.additionalCameraPricing.corePackage.map((tier, index) => {
              const originalCorePrice = tier.pricePerMonth;
              const discountedCorePrice = applyDiscount(originalCorePrice);
              
              const originalEverythingPrice = pricingDataV2.additionalCameraPricing.everythingPackage[index].pricePerMonth;
              const discountedEverythingPrice = applyDiscount(originalEverythingPrice);
              
              return (
                <tr key={index} className={index > 0 ? "border-t border-gray-200" : ""}>
                  <td className="p-2 border-r border-gray-200">{tier.range}</td>
                  <td className="p-2 text-center border-r border-gray-200">
                    <div className="font-medium">{formatCurrency(discountedCorePrice)}</div>
                    {showSecondCurrency && (
                      <div className="text-xs text-gray-500">
                        {formatSecondaryCurrency(discountedCorePrice)}
                      </div>
                    )}
                  </td>
                  <td className="p-2 text-center">
                    <div className="font-medium">{formatCurrency(discountedEverythingPrice)}</div>
                    {showSecondCurrency && (
                      <div className="text-xs text-gray-500">
                        {formatSecondaryCurrency(discountedEverythingPrice)}
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