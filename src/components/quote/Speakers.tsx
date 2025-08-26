import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Volume2 } from 'lucide-react';

interface SpeakersProps {
  speakerCount: number;
  onSpeakerCountChange: (value: number) => void;
  includeSpeakers: boolean;
  onIncludeSpeakersChange: (value: boolean) => void;
  speakerCost?: number;
}

export function Speakers({
  speakerCount = 0,
  onSpeakerCountChange,
  includeSpeakers = false,
  onIncludeSpeakersChange,
  speakerCost = 950
}: SpeakersProps) {
  
  const handleCountChange = (value: string) => {
    // Convert to number and ensure it's not negative
    const numValue = Math.max(0, parseInt(value) || 0);
    onSpeakerCountChange(numValue);
  };

  const totalSpeakerCost = speakerCount * speakerCost;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4 text-gray-500" />
          <Label htmlFor="include-speakers" className="font-medium">Include Speakers</Label>
        </div>
        <Switch
          id="include-speakers"
          checked={includeSpeakers}
          onCheckedChange={onIncludeSpeakersChange}
        />
      </div>
      
      {includeSpeakers && (
        <div className="space-y-2 ml-6">
                        <Label htmlFor="speaker-count">Number of AXIS Network Speakers</Label>
          <Input
            id="speaker-count"
            type="number"
            min="0"
            value={speakerCount}
            onChange={(e) => handleCountChange(e.target.value)}
            placeholder="Enter number of speakers"
          />
          <div className="text-sm text-gray-500 space-y-1">
                          <p>AXIS Network Speaker - ${speakerCost.toLocaleString()} each</p>
            {speakerCount > 0 && (
              <p className="font-medium">
                Total Speaker Cost: ${totalSpeakerCost.toLocaleString()}
              </p>
            )}
            <p>One-time cost for audio notification system</p>
          </div>
        </div>
      )}
    </div>
  );
} 