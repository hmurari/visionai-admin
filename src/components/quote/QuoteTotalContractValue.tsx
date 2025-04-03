import { QuoteDetailsV2, Branding } from '@/types/quote';

interface QuoteTotalContractValueProps {
  quoteDetails: QuoteDetailsV2;
  branding: Branding;
}

export function QuoteTotalContractValue({ quoteDetails, branding }: QuoteTotalContractValueProps) {
  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '$0';
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
      minimumFractionDigits: 0
    }).format(amount);
    
    return formatted;
  };
  
  // Format secondary currency
  const formatSecondaryCurrency = (amount: number) => {
    if (!quoteDetails.exchangeRate || !quoteDetails.secondaryCurrency || isNaN(amount)) return '';
    
    // Convert USD to secondary currency using the exchange rate
    const convertedAmount = amount * quoteDetails.exchangeRate;
    
    // Format based on the selected currency
    return new Intl.NumberFormat(
      quoteDetails.secondaryCurrency === 'INR' ? 'en-IN' : 'en-US', 
      {
        style: 'currency',
        currency: quoteDetails.secondaryCurrency,
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      }
    ).format(convertedAmount);
  };

  return (
    <div className="mt-6 border border-gray-200 rounded-md p-4 bg-blue-50">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">Total Contract Value</p>
          <p className="text-xs text-gray-500">
            {quoteDetails.subscriptionType === 'monthly' ? 'Monthly' : 
             quoteDetails.subscriptionType === 'yearly' ? '1 Year' : '3 Year'} Agreement
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
            {formatCurrency(quoteDetails.totalContractValue || 0)}
          </p>
          {quoteDetails.showSecondCurrency && (
            <p className="text-sm text-right" style={{ color: branding.primaryColor }}>
              {formatSecondaryCurrency(quoteDetails.totalContractValue || 0)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 