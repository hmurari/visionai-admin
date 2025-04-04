import { formatCurrency } from '@/utils/formatters';
import { Branding, QuoteDetailsV2 } from '@/types/quote';

interface QuoteTotalContractValueProps {
  quoteDetails: QuoteDetailsV2;
  branding: Branding;
}

export function QuoteTotalContractValue({ quoteDetails, branding }: QuoteTotalContractValueProps) {
  // Format currency in USD
  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return '$0';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(amount);
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

  // Calculate the total value to display
  const getTotalValue = () => {
    const basePrice = quoteDetails.baseCost || 0;
    const discountedBasePrice = basePrice * (1 - quoteDetails.discountPercentage / 100);
    
    if (quoteDetails.subscriptionType === 'monthly') {
      // For monthly, it's the annual base price + 1 month of additional camera costs
      const monthlyCameraCost = quoteDetails.additionalCamerasMonthlyRecurring || 0;
      return discountedBasePrice + monthlyCameraCost;
    } else {
      // For yearly and 3-year, we show the total contract value
      return quoteDetails.totalContractValue;
    }
  };

  // Generate explanation text based on subscription type
  const getExplanationText = () => {
    const isMonthly = quoteDetails.subscriptionType === 'monthly';
    const basePrice = quoteDetails.baseCost || 0;
    const discountedBasePrice = basePrice * (1 - quoteDetails.discountPercentage / 100);
    
    if (isMonthly) {
      const monthlyCameraCost = quoteDetails.additionalCamerasMonthlyRecurring || 0;
      return `${formatCurrency(discountedBasePrice)} annual base price + ${formatCurrency(monthlyCameraCost)} for 1 month of additional cameras`;
    } else if (quoteDetails.subscriptionType === 'yearly') {
      return '1 Year Agreement';
    } else {
      return '3 Year Agreement';
    }
  };

  // Get the title text - always "Total Contract Value"
  const getTitleText = () => {
    return "Total Contract Value";
  };

  // Get the period text
  const getPeriodText = () => {
    if (quoteDetails.subscriptionType === 'monthly') {
      return "for initial setup";
    } else if (quoteDetails.subscriptionType === 'yearly') {
      return "for 1 year";
    } else {
      return "for 3 years";
    }
  };

  return (
    <div className="mt-6 border border-gray-200 rounded-md p-4 bg-blue-50">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xl font-bold">{getTitleText()}</p>
          <p className="text-xs text-gray-500">
            {getExplanationText()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold" style={{ color: branding.primaryColor }}>
            {formatCurrency(getTotalValue())}
          </p>
          <p className="text-sm text-gray-600">
            {getPeriodText()}
          </p>
          {quoteDetails.showSecondCurrency && (
            <p className="text-sm text-right" style={{ color: branding.primaryColor }}>
              {formatSecondaryCurrency(getTotalValue())}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}