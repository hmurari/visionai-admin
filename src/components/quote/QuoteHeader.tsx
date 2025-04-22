import { Branding } from '@/types/quote';

interface QuoteHeaderProps {
  date: string;
  showSecondCurrency?: boolean;
  secondaryCurrency?: string;
  exchangeRate?: number;
  branding: Branding;
  quoteNumber?: string;
  isSecondPage?: boolean;
}

export function QuoteHeader({ 
  date, 
  showSecondCurrency, 
  secondaryCurrency, 
  exchangeRate, 
  branding,
  quoteNumber,
  isSecondPage
}: QuoteHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-8 quote-section quote-header">
      <div>
        <img 
          src="/logo-color.png" 
          alt="Visionify" 
          className="h-16 mb-2"
        />
      </div>
      <div className="text-right">
        <h2 className="text-xl font-bold mb-1">{isSecondPage ? "QUOTE (continued)" : "QUOTE"}</h2>
        {!isSecondPage && (
          <>
            <p className="text-gray-600">Date: {new Date(date).toLocaleDateString()}</p>
            <p className="text-gray-600">Quote #: {quoteNumber || "Draft"}</p>
            {showSecondCurrency && (
              <p className="text-gray-500 text-sm">
                Exchange Rate: 1 USD = {exchangeRate?.toFixed(2)} {secondaryCurrency}
              </p>
            )}
          </>
        )}
        {isSecondPage && (
          <p className="text-gray-600">Quote #: {quoteNumber || "Draft"}</p>
        )}
      </div>
    </div>
  );
} 