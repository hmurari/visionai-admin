import { pricingDataV2 } from '@/data/pricing_v2';
import { Branding } from '@/types/quote';

interface PricingSheetProps {
  showSecondCurrency?: boolean;
  secondaryCurrency?: string;
  exchangeRate?: number;
  branding: Branding;
  subscriptionType: string;
}

export function PricingSheet({ 
  showSecondCurrency, 
  secondaryCurrency, 
  exchangeRate,
  branding,
  subscriptionType = 'monthly'
}: PricingSheetProps) {
  // ... existing formatting functions ...

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
        PRICING SHEET
        {hasDiscount && (
          <span className="ml-2 text-xs font-normal text-green-600">
            ({getSubscriptionName()} pricing with {discountPercentage}% discount applied)
          </span>
        )}
      </h3>
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left font-medium border-r border-gray-200">Package Type</th>
              <th className="p-2 text-center font-medium">One-Time Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-2 border-r border-gray-200">Base Package (5 Cameras, 3 Scenarios)</td>
              <td className="p-2 text-center">USD $5,000</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-t border-gray-200">
              <th className="p-2 text-left font-medium border-r border-gray-200">Camera Tier</th>
              <th className="p-2 text-center font-medium border-r border-gray-200">
                Core Package
                <span className="block text-xs text-gray-400 font-normal">per camera/month</span>
              </th>
              <th className="p-2 text-center font-medium">
                Everything Package
                <span className="block text-xs text-gray-400 font-normal">per camera/month</span>
              </th>
            </tr>
          </thead>
          {/* ... rest of the existing table body ... */}
        </table>
      </div>
    </div>
  );
} 