import { pricingDataV2 } from '@/data/pricing_v2';
import { Branding } from '@/types/quote';

interface QuoteAdditionalCameraPricingProps {
  showSecondCurrency?: boolean;
  secondaryCurrency?: string;
  exchangeRate?: number;
  branding: Branding;
}

export function QuoteAdditionalCameraPricing({ 
  showSecondCurrency, 
  secondaryCurrency, 
  exchangeRate,
  branding
}: QuoteAdditionalCameraPricingProps) {
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

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
        ADDITIONAL CAMERA PRICING
      </h3>
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left font-medium border-r border-gray-200">Camera Tier</th>
              <th className="p-2 text-center font-medium border-r border-gray-200">
                Up to 3 Scenarios
                <span className="block text-xs text-gray-400 font-normal">per camera/month</span>
              </th>
              <th className="p-2 text-center font-medium">
                All Scenarios
                <span className="block text-xs text-gray-400 font-normal">per camera/month</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pricingDataV2.cameraTiers.map((tier, index) => (
              <tr key={index} className={index > 0 ? "border-t border-gray-200" : ""}>
                <td className="p-2 border-r border-gray-200">{tier.name}</td>
                <td className="p-2 text-center border-r border-gray-200">
                  {formatCurrency(tier.pricePerCamera)}
                  {showSecondCurrency && (
                    <div className="text-xs text-gray-400">
                      {formatSecondaryCurrency(tier.pricePerCamera)}
                    </div>
                  )}
                </td>
                <td className="p-2 text-center">
                  {formatCurrency(tier.priceAllScenarios)}
                  {showSecondCurrency && (
                    <div className="text-xs text-gray-400">
                      {formatSecondaryCurrency(tier.priceAllScenarios)}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 