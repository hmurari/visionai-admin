import { Branding } from '@/types/quote';

interface LegalSummaryProps {
  branding: Branding;
}

export function LegalSummary({ branding }: LegalSummaryProps) {
  return (
    <div className="mb-8 quote-section legal-summary">
      <h3 className="text-sm font-bold mb-4" style={{ color: branding.primaryColor }}>
        LEGAL SUMMARY
      </h3>
      <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
        <p className="text-sm leading-relaxed">
          This Order Form is issued under and governed by the terms of the Visionify Customer License Agreement ("CLA"), 
          available at <a href="https://visionify.ai/cla" className="text-blue-600 underline">https://visionify.ai/cla</a>, 
          between Visionify Inc. ("Visionify") and the customer named below ("Customer"). By signing below, Customer agrees 
          to purchase the Services listed in this Order Form, subject to the terms specified herein and in the CLA.
        </p>
      </div>
    </div>
  );
} 