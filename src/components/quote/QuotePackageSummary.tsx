import { Branding } from '@/types/quote';
import { pricingDataV2 } from '@/data/pricing_v2';

interface QuotePackageSummaryProps {
  totalCameras: number;
  subscriptionType: string;
  branding: Branding;
  isEverythingPackage?: boolean;
}

export function QuotePackageSummary({ 
  totalCameras, 
  subscriptionType, 
  branding,
  isEverythingPackage = false
}: QuotePackageSummaryProps) {
  // Helper function to get subscription name
  const getSubscriptionName = () => {
    const subscription = pricingDataV2.subscriptionTypes.find(
      (type: any) => type.id === subscriptionType
    );
    return subscription ? subscription.name : 'Monthly Subscription';
  };

  const packageName = isEverythingPackage ? "Everything Package" : "Core Package";

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
        PACKAGE SUMMARY
      </h3>
      <div className="border border-gray-200 rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left font-bold text-sm border-r border-gray-200 w-[25%]">Package</th>
              <th className="p-2 text-left font-bold text-sm border-r border-gray-200 w-[15%]">Cameras</th>
              <th className="p-2 text-left font-bold text-sm border-r border-gray-200 w-[20%]">Subscription</th>
              <th className="p-2 text-left font-bold text-sm border-r border-gray-200 w-[20%]">Hardware</th>
              <th className="p-2 text-left font-bold text-sm w-[20%]">Deployment</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border-r border-gray-200">{packageName}</td>
              <td className="p-2 border-r border-gray-200">{totalCameras}</td>
              <td className="p-2 border-r border-gray-200">{getSubscriptionName()}</td>
              <td className="p-2 border-r border-gray-200">Included</td>
              <td className="p-2">Visionify Cloud</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
} 