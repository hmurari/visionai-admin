import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { CurrencySelect } from '@/components/CurrencySelect';
import { currencyOptions } from '@/utils/currencyUtils';

interface CurrencyOptionsProps {
  showSecondCurrency: boolean;
  onShowSecondCurrencyChange: (value: boolean) => void;
  selectedCurrency: string;
  onCurrencyChange: (value: string) => void;
  exchangeRate: number;
  onExchangeRateChange: (value: number) => void;
  lastUpdated: Date | null;
  onLastUpdatedChange: (value: Date) => void;
  onFetchRates?: () => Promise<void>;
  isLoadingRates?: boolean;
}

export function CurrencyOptions({
  showSecondCurrency,
  onShowSecondCurrencyChange,
  selectedCurrency,
  onCurrencyChange,
  exchangeRate,
  onExchangeRateChange,
  lastUpdated,
  onLastUpdatedChange,
  onFetchRates,
  isLoadingRates = false
}: CurrencyOptionsProps) {
  const [rateError, setRateError] = useState<string | null>(null);
  
  const handleFetchRates = async () => {
    if (!onFetchRates) return;
    
    setRateError(null);
    
    try {
      await onFetchRates();
    } catch (error) {
      setRateError('Failed to fetch exchange rates. Please try again later.');
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Currency Options</h3>
      
      <div className="flex items-center space-x-2 mb-4">
        <Switch
          id="show-second-currency"
          checked={showSecondCurrency}
          onCheckedChange={onShowSecondCurrencyChange}
        />
        <Label htmlFor="show-second-currency">Include Secondary Currency</Label>
      </div>
      
      {showSecondCurrency && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <CurrencySelect
                value={selectedCurrency}
                onChange={onCurrencyChange}
                options={currencyOptions}
              />
            </div>
            
            {onFetchRates && (
              <Button
                variant="outline"
                onClick={handleFetchRates}
                disabled={isLoadingRates}
                className="whitespace-nowrap"
              >
                {isLoadingRates ? 'Loading...' : 'Refresh Rates'}
              </Button>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-sm">
              1 USD = {exchangeRate.toFixed(2)} {selectedCurrency}
            </p>
            
            {lastUpdated && (
              <p className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            )}
          </div>
          
          {rateError && (
            <p className="text-red-500 text-sm">{rateError}</p>
          )}
        </div>
      )}
    </div>
  );
} 