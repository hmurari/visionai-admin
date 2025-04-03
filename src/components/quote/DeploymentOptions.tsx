import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DeploymentOptionsProps {
  deploymentType: string;
  onDeploymentTypeChange: (value: string) => void;
  includeEdgeServer: boolean;
  onEdgeServerChange: (value: boolean) => void;
  edgeServerCost: number;
  onEdgeServerCostChange: (value: number) => void;
  includeImplementation: boolean;
  onImplementationChange: (value: boolean) => void;
  implementationCost: number;
  onImplementationCostChange: (value: number) => void;
  cameras: number;
}

export function DeploymentOptions({
  deploymentType,
  onDeploymentTypeChange,
  includeEdgeServer,
  onEdgeServerChange,
  edgeServerCost,
  onEdgeServerCostChange,
  includeImplementation,
  onImplementationChange,
  implementationCost,
  onImplementationCostChange,
  cameras
}: DeploymentOptionsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Deployment Options</h3>
      
      <div>
        <Label className="font-medium">Deployment Type</Label>
        <div className="flex space-x-2 mt-2">
          <Button
            variant={deploymentType === 'customer' ? 'default' : 'outline'}
            onClick={() => onDeploymentTypeChange('customer')}
            className="flex-1"
          >
            Customer Cloud
          </Button>
          <Button
            variant={deploymentType === 'visionify' ? 'default' : 'outline'}
            onClick={() => onDeploymentTypeChange('visionify')}
            className="flex-1"
          >
            Visionify Cloud
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label className="font-medium">Additional Options</Label>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Switch
              id="edge-server"
              checked={includeEdgeServer}
              onCheckedChange={onEdgeServerChange}
            />
            <Label htmlFor="edge-server">Include Edge Server</Label>
          </div>
          
          <div className="w-1/3">
            <Input
              type="number"
              value={edgeServerCost}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  onEdgeServerCostChange(value);
                }
              }}
              disabled={!includeEdgeServer}
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Switch
              id="implementation"
              checked={includeImplementation}
              onCheckedChange={onImplementationChange}
            />
            <Label htmlFor="implementation">Include Implementation</Label>
          </div>
          
          <div className="w-1/3">
            <Input
              type="number"
              value={implementationCost}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  onImplementationCostChange(value);
                }
              }}
              disabled={!includeImplementation}
            />
          </div>
        </div>
        {cameras < 10 && (
          <div className="text-sm text-amber-600 mt-1">
            <span className="font-medium">Note:</span> Implementation fees of $5,000 is recommended for deployments with fewer than 10 cameras.
          </div>
        )}
      </div>
    </div>
  );
} 