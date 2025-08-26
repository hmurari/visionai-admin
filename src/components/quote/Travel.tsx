import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plane } from 'lucide-react';

interface TravelProps {
  travelCost: number;
  onTravelCostChange: (cost: number) => void;
  includeTravel: boolean;
  onIncludeTravelChange: (include: boolean) => void;
  travelDescription?: string;
  onTravelDescriptionChange?: (description: string) => void;
}

export function Travel({
  travelCost = 2000,
  onTravelCostChange,
  includeTravel = false,
  onIncludeTravelChange,
  travelDescription = `- Site Survey & Assessment
- Camera Recommendations Report
- Onsite Installation Support
- System Configuration & Testing
- Staff Training Session`,
  onTravelDescriptionChange
}: TravelProps) {
  
  const handleCostChange = (value: string) => {
    // Convert to number and ensure it's not negative
    const numValue = Math.max(0, parseInt(value) || 0);
    onTravelCostChange(numValue);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Plane className="h-4 w-4 text-gray-500" />
          <Label htmlFor="include-travel" className="font-medium">Include Travel & Site Support</Label>
        </div>
        <Switch
          id="include-travel"
          checked={includeTravel}
          onCheckedChange={onIncludeTravelChange}
        />
      </div>
      
      {includeTravel && (
        <div className="space-y-4 ml-6">
          <div className="space-y-2">
            <Label htmlFor="travel-cost">One-time Travel & Site Support Fee ($)</Label>
            <Input
              id="travel-cost"
              type="number"
              min="0"
              value={travelCost}
              onChange={(e) => handleCostChange(e.target.value)}
              placeholder="Enter travel cost"
            />
            <p className="text-sm text-gray-500 mt-1">
              One-time fee for onsite support including travel and site services
            </p>
          </div>
          
          {onTravelDescriptionChange && (
            <div className="space-y-2">
              <Label htmlFor="travel-description">Travel & Site Support Description</Label>
              <Textarea
                id="travel-description"
                value={travelDescription}
                onChange={(e) => onTravelDescriptionChange(e.target.value)}
                placeholder="Enter travel and site support details..."
                rows={6}
                className="resize-none"
              />
              <p className="text-sm text-gray-500">
                This description will appear in the quote and order form
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 