import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Wrench } from 'lucide-react';

interface ImplementationCostsProps {
  implementationCost: number;
  onImplementationCostChange: (value: number) => void;
  includeImplementationCost: boolean;
  onIncludeImplementationCostChange: (value: boolean) => void;
  implementationDescription?: string;
  onImplementationDescriptionChange?: (value: string) => void;
}

export function ImplementationCosts({
  implementationCost = 0,
  onImplementationCostChange,
  includeImplementationCost = false,
  onIncludeImplementationCostChange,
  implementationDescription = `- Onboard cameras & users to Visionify platform
- Configuring Zones & AI scenarios
- Adjust camera angles & provide recommendations
- Fine-tune models as needed for 90%+ accuracy
- Enable real-time alerts (Email, MS Teams, WhatsApp, MobileApp)
- Enable on-prem integrations (Speakers, Audio-Visual, PLC OR API)
- Configure reporting (daily/weekly/monthly reports)`,
  onImplementationDescriptionChange
}: ImplementationCostsProps) {
  
  const handleCostChange = (value: string) => {
    // Convert to number and ensure it's not negative
    const numValue = Math.max(0, parseInt(value) || 0);
    onImplementationCostChange(numValue);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wrench className="h-4 w-4 text-gray-500" />
          <Label htmlFor="include-implementation" className="font-medium">Include Implementation Costs</Label>
        </div>
        <Switch
          id="include-implementation"
          checked={includeImplementationCost}
          onCheckedChange={onIncludeImplementationCostChange}
        />
      </div>
      
      {includeImplementationCost && (
        <div className="space-y-4 ml-6">
          <div className="space-y-2">
            <Label htmlFor="implementation-cost">One-time Implementation Fee ($)</Label>
            <Input
              id="implementation-cost"
              type="number"
              min="0"
              value={implementationCost}
              onChange={(e) => handleCostChange(e.target.value)}
              placeholder="Enter implementation cost"
            />
            <p className="text-sm text-gray-500 mt-1">
              One-time implementation fee for setup and configuration
            </p>
          </div>
          
          {onImplementationDescriptionChange && (
            <div className="space-y-2">
              <Label htmlFor="implementation-description">Implementation Description</Label>
              <Textarea
                id="implementation-description"
                value={implementationDescription}
                onChange={(e) => onImplementationDescriptionChange(e.target.value)}
                placeholder="Enter implementation details..."
                rows={8}
                className="resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                Customize the implementation details that will appear in the quote
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 