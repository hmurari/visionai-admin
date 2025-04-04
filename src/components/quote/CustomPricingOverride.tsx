import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

interface CustomPricing {
  tier1Price: number;
  tier2Price: number;
  tier3Price: number;
  infrastructureCost: number;
}

interface CustomPricingOverrideProps {
  useCustomPricing: boolean;
  onUseCustomPricingChange: (value: boolean) => void;
  customPricing: CustomPricing;
  onCustomPricingChange: (field: keyof CustomPricing, value: number) => void;
}

export function CustomPricingOverride({
  useCustomPricing,
  onUseCustomPricingChange,
  customPricing,
  onCustomPricingChange
}: CustomPricingOverrideProps) {
  
  const handleCustomPricingChange = (field: keyof CustomPricing) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      onCustomPricingChange(field, value);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Custom Pricing Override</h3>
        <div className="flex items-center space-x-2">
          <Switch
            id="custom-pricing"
            checked={useCustomPricing}
            onCheckedChange={onUseCustomPricingChange}
          />
          <Label htmlFor="custom-pricing">Enable</Label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tier1-price">1-20 Cameras (per camera/month)</Label>
          <Input
            id="tier1-price"
            type="number"
            value={customPricing.tier1Price}
            onChange={handleCustomPricingChange('tier1Price')}
            disabled={!useCustomPricing}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="tier2-price">21-99 Cameras (per camera/month)</Label>
          <Input
            id="tier2-price"
            type="number"
            value={customPricing.tier2Price}
            onChange={handleCustomPricingChange('tier2Price')}
            disabled={!useCustomPricing}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="tier3-price">100+ Cameras (per camera/month)</Label>
          <Input
            id="tier3-price"
            type="number"
            value={customPricing.tier3Price}
            onChange={handleCustomPricingChange('tier3Price')}
            disabled={!useCustomPricing}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="infra-cost">Infrastructure Cost (per camera/month)</Label>
          <Input
            id="infra-cost"
            type="number"
            value={customPricing.infrastructureCost}
            onChange={handleCustomPricingChange('infrastructureCost')}
            disabled={!useCustomPricing}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
} 