import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Wrench } from 'lucide-react';

interface ImplementationCostsProps {
  implementationCost: number;
  onImplementationCostChange: (value: number) => void;
  includeImplementationCost: boolean;
  onIncludeImplementationCostChange: (value: boolean) => void;
}

export function ImplementationCosts({
  implementationCost = 0,
  onImplementationCostChange,
  includeImplementationCost = false,
  onIncludeImplementationCostChange
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
        <div className="space-y-2 ml-6">
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
      )}
    </div>
  );
} 