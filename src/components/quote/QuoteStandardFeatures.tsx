import { CheckCircle } from 'lucide-react';
import { pricingDataV2 } from '@/data/pricing_v2';
import { Branding } from '@/types/quote';

interface QuoteStandardFeaturesProps {
  branding: Branding;
}

export function QuoteStandardFeatures({ branding }: QuoteStandardFeaturesProps) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
        STANDARD FEATURES
      </h3>

      <div className="border border-gray-200 rounded-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pricingDataV2.standardFeatures.map((feature: string, index: number) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="text-blue-600 mr-2 h-4 w-4 mt-0.5" />
              <p className="text-sm">{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 