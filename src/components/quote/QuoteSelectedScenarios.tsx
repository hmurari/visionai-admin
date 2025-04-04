import { Check } from 'lucide-react';
import { pricingDataV2 } from '@/data/pricing_v2';
import { Branding } from '@/types/quote';

interface QuoteSelectedScenariosProps {
  selectedScenarios: string[];
  branding: Branding;
}

export function QuoteSelectedScenarios({ selectedScenarios, branding }: QuoteSelectedScenariosProps) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold mb-2" style={{ color: branding.primaryColor }}>
        SELECTED SCENARIOS
      </h3>
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex flex-wrap gap-2">
          {pricingDataV2.scenarios.map((scenario, index) => (
            <div
              key={index}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border inline-flex ${
                selectedScenarios.includes(scenario)
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-gray-200 bg-gray-50 text-gray-400'
              }`}
            >
              {selectedScenarios.includes(scenario) && (
                <Check className="h-3 w-3 text-blue-600 flex-shrink-0" />
              )}
              <span className="text-xs whitespace-nowrap">{scenario}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 