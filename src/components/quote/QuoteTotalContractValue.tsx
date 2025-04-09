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

  // Calculate the one-time fees
  const getOneTimeFees = () => {
    return quoteDetails.oneTimeBaseCost || 2000; // Default to 2000 if not provided
  };

  // Calculate the recurring fees
  const getRecurringFees = () => {
    if (quoteDetails.subscriptionType === 'monthly') {
      const monthlyCameraCost = quoteDetails.monthlyRecurring || 0;
      return monthlyCameraCost * (1 - quoteDetails.discountPercentage / 100);
    } else {
      const discountedAnnualRecurring = quoteDetails.discountedAnnualRecurring || 0;
      return discountedAnnualRecurring;
    }
  };

  // Get recurring period text
  const getRecurringPeriodText = () => {
    if (quoteDetails.subscriptionType === 'monthly') {
      return "per month";
    } else {
      return "per year";
    }
  };

  // Get contract length text
  const getContractLengthText = () => {
    if (quoteDetails.subscriptionType === 'monthly') {
      return "1 Month";
    } else if (quoteDetails.subscriptionType === 'yearly') {
      return "1 Year";
    } else {
      const years = quoteDetails.contractLength / 12 || 3;
      return `${years} Years`;
    }
  };

  // Get discount explanation text
  const getDiscountText = () => {
    return '';
    let baseDiscount = '';
    if (quoteDetails.subscriptionType === 'yearly') {
      baseDiscount = '20% subscription discount';
    } else if (quoteDetails.subscriptionType === '3-year') {
      baseDiscount = '30% subscription discount';
    }
    
    const additionalDiscount = quoteDetails.discountPercentage > 0 ? 
      `${quoteDetails.discountPercentage}% additional discount` : '';
    
    if (baseDiscount && additionalDiscount) {
      return `(${baseDiscount} + ${additionalDiscount})`;
    } else if (baseDiscount) {
      return `(${baseDiscount})`;
    } else if (additionalDiscount) {
      return `(${additionalDiscount})`;
    }
    return '';
  };

  return (
    <div className="mt-6 border border-gray-200 rounded-md p-4 bg-blue-50">
      <div className="grid grid-cols-3 gap-4">
        {/* One-time Fees Column */}
        <div className="border-r border-gray-200 pr-4">
          <p className="text-sm font-semibold">One-time Fees</p>
          <p className="text-xl font-bold mt-1" style={{ color: branding.primaryColor }}>
            {formatCurrency(getOneTimeFees())}
          </p>
          {quoteDetails.showSecondCurrency && (
            <p className="text-sm mt-1" style={{ color: branding.primaryColor }}>
              {formatSecondaryCurrency(getOneTimeFees())}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Base setup fee
          </p>
        </div>
        
        {/* Recurring Fees Column */}
        <div className="border-r border-gray-200 px-4">
          <p className="text-sm font-semibold">Recurring Fees</p>
          <div className="flex items-baseline mt-1">
            <p className="text-xl font-bold" style={{ color: branding.primaryColor }}>
              {formatCurrency(getRecurringFees())}
            </p>
            <p className="text-xs text-gray-500 ml-1">
              {getRecurringPeriodText()}
            </p>
          </div>
          {quoteDetails.showSecondCurrency && (
            <p className="text-sm mt-1" style={{ color: branding.primaryColor }}>
              {formatSecondaryCurrency(getRecurringFees())}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            For {quoteDetails.totalCameras} cameras
          </p>
          {getDiscountText() && (
            <p className="text-xs text-gray-500">
              {getDiscountText()}
            </p>
          )}
        </div>
        
        {/* Total Contract Value Column */}
        <div className="pl-4">
          <p className="text-sm font-semibold">Total Contract Value</p>
          <p className="text-xl font-bold mt-1" style={{ color: branding.primaryColor }}>
            {formatCurrency(getTotalValue())}
          </p>
          {quoteDetails.showSecondCurrency && (
            <p className="text-sm mt-1" style={{ color: branding.primaryColor }}>
              {formatSecondaryCurrency(getTotalValue())}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            For {getContractLengthText()}
          </p>
        </div>
      </div>
    </div>
  );
}