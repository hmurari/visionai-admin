import { Branding } from '@/types/quote';

interface QuoteHeaderProps {
  date: string;
  showSecondCurrency?: boolean;
  secondaryCurrency?: string;
  exchangeRate?: number;
  branding: Branding;
}

export function QuoteHeader({ date, showSecondCurrency, secondaryCurrency, exchangeRate, branding }: QuoteHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <img 
          src="/logo-color.png" 
          alt="Visionify" 
          className="h-16 mb-2"
        />
      </div>
      <div className="text-right">
        <h2 className="text-xl font-bold mb-1">QUOTE</h2>
        <p className="text-gray-600">Date: {new Date(date).toLocaleDateString()}</p>
        <p className="text-gray-600">Quote #: VIS-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
        {showSecondCurrency && (
          <p className="text-gray-500 text-sm">
            Exchange Rate: 1 USD = {exchangeRate?.toFixed(2)} {secondaryCurrency}
          </p>
        )}
      </div>
    </div>
  );
} 