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
    const oneTimeBaseCost = quoteDetails.oneTimeBaseCost || 2000; // Default to 2000 if not provided
    
    if (quoteDetails.subscriptionType === 'monthly') {
      // For monthly, it's the one-time base cost + 1 month of camera costs
      const monthlyCameraCost = quoteDetails.monthlyRecurring || 0;
      // Apply discount directly to monthly cost
      const discountedMonthlyCost = monthlyCameraCost * (1 - quoteDetails.discountPercentage / 100);
      return oneTimeBaseCost + discountedMonthlyCost;
    } else {
      // For yearly and 3-year, we show the one-time base cost + total contract value
      const discountedAnnualRecurring = quoteDetails.discountedAnnualRecurring || 0;
      const contractLength = quoteDetails.contractLength / 12 || 1; // Convert to years
      return oneTimeBaseCost + (discountedAnnualRecurring * contractLength);
    }
  };

  // Generate explanation text based on subscription type
  const getExplanationText = () => {
    const isMonthly = quoteDetails.subscriptionType === 'monthly';
    const oneTimeBaseCost = quoteDetails.oneTimeBaseCost || 2000;
    const discountText = quoteDetails.discountPercentage > 0 ? 
      ` (with ${quoteDetails.discountPercentage}% additional discount)` : '';
    
    if (isMonthly) {
      const monthlyCameraCost = quoteDetails.monthlyRecurring || 0;
      const discountedMonthlyCost = monthlyCameraCost * (1 - quoteDetails.discountPercentage / 100);
      return `${formatCurrency(oneTimeBaseCost)} one-time base price + ${formatCurrency(discountedMonthlyCost)} for 1 month for ${quoteDetails.totalCameras} cameras${discountText}`;
    } else if (quoteDetails.subscriptionType === 'yearly') {
      const annualCost = quoteDetails.discountedAnnualRecurring || 0;
      return `${formatCurrency(oneTimeBaseCost)} one-time base price + ${formatCurrency(annualCost)} per year (20% subscription discount${quoteDetails.discountPercentage > 0 ? ` + ${quoteDetails.discountPercentage}% additional discount` : ''}) for ${quoteDetails.totalCameras} cameras`;
    } else {
      const annualCost = quoteDetails.discountedAnnualRecurring || 0;
      const years = quoteDetails.contractLength / 12 || 3;
      return `${formatCurrency(oneTimeBaseCost)} one-time base price + ${formatCurrency(annualCost)} per year (30% subscription discount${quoteDetails.discountPercentage > 0 ? ` + ${quoteDetails.discountPercentage}% additional discount` : ''}) for ${quoteDetails.totalCameras} cameras × ${years} years`;
    }
  };

  // Get the title text - always "Total Contract Value"
  const getTitleText = () => {
    return "Total Contract Value";
  };

  // Get the period text
  const getPeriodText = () => {
    if (quoteDetails.subscriptionType === 'monthly') {
      return "for 1 Month";
    } else if (quoteDetails.subscriptionType === 'yearly') {
      return "for 1 year";
    } else {
      return "for 3 years";
    }
  };

  return (
    <div className="mt-6 border border-gray-200 rounded-md p-4 bg-blue-50">
      <div className="flex justify-between items-center">
        <div className="max-w-[80%]">
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