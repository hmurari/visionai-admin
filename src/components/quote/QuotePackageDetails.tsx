import { Branding } from '@/types/quote';
import { pricingDataV2 } from '@/data/pricing_v2';

interface QuotePackageDetailsProps {
  branding: Branding;
}

export function QuotePackageDetails({ branding }: QuotePackageDetailsProps) {
  // Get the base package data
  const basePackage = pricingDataV2.basePackage;

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
        PACKAGE DETAILS
      </h3>
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <ul className="list-disc pl-5 text-sm">
          <li>Supports {basePackage.includedCameras} cameras</li>
          <li>Hardware included</li>
          <li>Visionify Cloud hosting</li>
          <li>{basePackage.includedScenarios} safety scenarios of your choice</li>
        </ul>
      </div>
    </div>
  );
} 