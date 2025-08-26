import { Branding } from '@/types/quote';

interface OrderFormHeaderProps {
  date: string;
  showSecondCurrency?: boolean;
  secondaryCurrency?: string;
  exchangeRate?: number;
  branding: Branding;
  orderFormNumber?: string;
  isSecondPage?: boolean;
  pageNumber?: number;
}

export function OrderFormHeader({ 
  date, 
  showSecondCurrency, 
  secondaryCurrency, 
  exchangeRate, 
  branding,
  orderFormNumber,
  isSecondPage,
  pageNumber
}: OrderFormHeaderProps) {
  return (
    <div className={`flex justify-between items-start ${isSecondPage ? 'mb-4' : 'mb-8'} quote-section order-form-header`}>
      <div>
        <img 
          src="/logo-color.png" 
          alt="Visionify" 
          className="h-16 mb-2"
        />
      </div>
      <div className="text-right">
        <h2 className="text-xl font-bold mb-1">Order Form</h2>
        <p className="text-gray-600">{orderFormNumber || "Draft"}</p>
        {pageNumber && (
          <p className="text-gray-600">PAGE {pageNumber}</p>
        )}
        {!isSecondPage && (
          <>
            <p className="text-gray-600">Date: {new Date(date).toLocaleDateString()}</p>
            {showSecondCurrency && (
              <p className="text-gray-500 text-sm">
                Exchange Rate: 1 USD = {exchangeRate?.toFixed(2)} {secondaryCurrency}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
} 