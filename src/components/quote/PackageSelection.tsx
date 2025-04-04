import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface PackageSelectionProps {
  selectedScenario: string;
  onScenarioChange: (value: string) => void;
  cameras: number;
  onCameraChange: (value: number) => void;
  subscriptionType: string;
  onSubscriptionChange: (value: string) => void;
  minCameras?: number;
  maxCameras?: number;
  pricingData: any;
  version: 'v1' | 'v2';
}

export function PackageSelection({
  selectedScenario,
  onScenarioChange,
  cameras,
  onCameraChange,
  subscriptionType,
  onSubscriptionChange,
  minCameras = 5,
  maxCameras = 200,
  pricingData,
  version
}: PackageSelectionProps) {
  
  // For V2, we need to handle scenario selection differently
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Package Selection</h3>
      
      {version === 'v1' && (
        <div>
          <Label htmlFor="scenario-select" className="font-medium">Package Selection</Label>
          <Select 
            value={selectedScenario} 
            onValueChange={onScenarioChange}
          >
            <SelectTrigger id="scenario-select" className="mt-1">
              <SelectValue placeholder="Select package" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everything">Everything Package</SelectItem>
              <SelectItem value="core">Core Package - 3 Scenarios</SelectItem>
              
              {/* Divider before single scenarios */}
              <div className="py-2 px-2 text-xs font-medium text-gray-500 border-t border-b border-gray-100 my-1">
                Single Scenarios
              </div>
              
              <SelectItem value="single_ppe">PPE Compliance Only</SelectItem>
              <SelectItem value="single_mobile">Mobile Phone Compliance Only</SelectItem>
              <SelectItem value="single_staircase">Staircase Safety Only</SelectItem>
              <SelectItem value="single_spills">Spills & Leaks Detection Only</SelectItem>
              <SelectItem value="single_area">Area Controls Only</SelectItem>
              <SelectItem value="single_forklift">Forklift Safety Only</SelectItem>
              <SelectItem value="single_emergency">Emergency Events Only</SelectItem>
              <SelectItem value="single_hazard">Hazard Warnings Only</SelectItem>
              <SelectItem value="single_behavioral">Behavioral Safety Only</SelectItem>
              <SelectItem value="single_housekeeping">Housekeeping Only</SelectItem>
              <SelectItem value="single_headcounts">Headcounts Only</SelectItem>
              <SelectItem value="single_occupancy">Occupancy Metrics Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="font-medium">
            Number of Cameras
          </Label>
          <span className="text-lg font-semibold">{version === 'v2' ? (5 + cameras) : cameras}</span>
        </div>
        
        {/* Update the preset buttons for common camera counts */}
        <div className="grid grid-cols-5 gap-2 mb-2">
          {version === 'v1' 
            ? [5, 20, 50, 100, 200].map(value => (
                <Button
                  key={value}
                  type="button"
                  variant={cameras === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCameraChange(value)}
                  className="py-1 px-2 h-auto"
                >
                  {value}
                </Button>
              ))
            : [5, 20, 50, 100, 200].map(value => (
                <Button
                  key={value}
                  type="button"
                  variant={(5 + cameras) === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCameraChange(value - 5)}
                  className="py-1 px-2 h-auto"
                >
                  {value}
                </Button>
              ))
          }
        </div>
        
        <Slider
          value={[cameras]}
          min={minCameras}
          max={maxCameras}
          step={1}
          onValueChange={(value) => onCameraChange(value[0])}
          className="mt-2"
        />
      </div>
      
      <div>
        <Label htmlFor="subscription-select" className="font-medium">Subscription Type</Label>
        <Select 
          value={subscriptionType} 
          onValueChange={onSubscriptionChange}
        >
          <SelectTrigger id="subscription-select" className="mt-1">
            <SelectValue placeholder="Select subscription" />
          </SelectTrigger>
          <SelectContent>
            {pricingData.subscriptionTypes.map((type: any) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name} ({type.description})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
} 