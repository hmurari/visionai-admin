import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface DiscountSectionProps {
  discountPercentage: number;
  onDiscountChange: (value: number) => void;
  maxDiscount?: number;
}

export function DiscountSection({
  discountPercentage,
  onDiscountChange,
  maxDiscount = 30
}: DiscountSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Additional Discount</h3>
        <span className="text-lg font-semibold">{discountPercentage}%</span>
      </div>
      
      <div className="grid grid-cols-5 gap-2 mb-2">
        {[0, 5, 10, 15, 20].map(value => (
          <Button
            key={value}
            type="button"
            variant={discountPercentage === value ? "default" : "outline"}
            size="sm"
            onClick={() => onDiscountChange(value)}
            className="py-1 px-2 h-auto"
          >
            {value}%
          </Button>
        ))}
      </div>
      
      <Slider
        value={[discountPercentage]}
        min={0}
        max={maxDiscount}
        step={1}
        onValueChange={(value) => onDiscountChange(Math.min(maxDiscount, value[0]))}
        className="mt-2"
      />
      
      <p className="text-sm text-gray-500">Enter percentage discount to apply to the base price</p>
    </div>
  );
} 