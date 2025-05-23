import { formatCurrency, formatCurrencyWithExchange } from '../../utils/formatters';
import { Branding, QuoteDetailsV2 } from '@/types/quote';

interface QuoteTotalContractValueProps {
  quoteDetails: QuoteDetailsV2;
  branding: Branding;
}

export function QuoteTotalContractValue({ quoteDetails, branding }: QuoteTotalContractValueProps) {
  // Format secondary currency
  const formatSecondaryCurrency = (amount: number) => {
    if (!quoteDetails.exchangeRate || !quoteDetails.secondaryCurrency || isNaN(amount)) return '';
    return formatCurrencyWithExchange(amount, quoteDetails.secondaryCurrency, quoteDetails.exchangeRate);
  };

  // Calculate total one-time costs
  const totalOneTimeCost = quoteDetails.totalOneTimeCost || 
    ((quoteDetails.serverCount || 0) * (quoteDetails.serverBaseCost || 2000) + 
    (quoteDetails.includeImplementationCost ? (quoteDetails.implementationCost || 0) : 0));

  // Calculate total recurring costs
  const recurringAmount = quoteDetails.subscriptionType === 'monthly' 
    ? quoteDetails.discountedMonthlyRecurring 
    : quoteDetails.subscriptionType === 'threeMonth'
      ? quoteDetails.discountedThreeMonthRecurring || (quoteDetails.discountedMonthlyRecurring * 3)
      : quoteDetails.discountedAnnualRecurring;
  
  const recurringText = quoteDetails.subscriptionType === 'monthly' 
    ? 'per month'
    : quoteDetails.subscriptionType === 'threeMonth'
      ? 'for 3 months'
      : 'per year';

  // Calculate total contract value
  const contractLength = quoteDetails.contractLength || 
    (quoteDetails.subscriptionType === 'threeMonth' ? 3 : 1);
  const contractYears = contractLength / 12;
  
  let totalContractValue;
  
  if (quoteDetails.subscriptionType === 'monthly') {
    // For monthly plans, include total one-time costs + 1 month of recurring
    totalContractValue = totalOneTimeCost + quoteDetails.discountedMonthlyRecurring;
  } else if (quoteDetails.subscriptionType === 'threeMonth') {
    // For 3-month plans, include total one-time costs + 3 months of recurring
    totalContractValue = totalOneTimeCost + (quoteDetails.discountedThreeMonthRecurring || (quoteDetails.discountedMonthlyRecurring * 3));
  } else {
    // For yearly plans, include total one-time costs + total for contract length
    totalContractValue = totalOneTimeCost + (quoteDetails.discountedAnnualRecurring * contractYears);
  }

  // Get server details text
  const getServerDetailsText = () => {
    const serverCount = quoteDetails.serverCount || 0;
    
    if (serverCount === 0) {
      return 'no servers';
    } else if (serverCount > 1) {
      return `${serverCount} servers`;
    }
    return '1 server';
  };

  // Get contract length text
  const getContractLengthText = () => {
    if (quoteDetails.subscriptionType === 'monthly') {
      return "1 Month";
    } else if (quoteDetails.subscriptionType === 'threeMonth') {
      return "3 Months";
    } else if (quoteDetails.subscriptionType === 'yearly') {
      return "1 Year";
    } else {
      const years = quoteDetails.contractLength / 12 || 3;
      return `${years} Years`;
    }
  };

  return (
    <div className="mb-6 border border-gray-200 rounded-md overflow-hidden">
      <div className="bg-blue-50 p-2 border-b border-gray-200">
        <h3 className="text-sm font-bold" style={{ color: branding.primaryColor }}>
          TOTAL COST SUMMARY
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-0 p-0">
        {/* One-time Fees Column */}
        <div className="border-r border-gray-200 p-3">
          <p className="text-sm font-medium">One-time Fees</p>
          <p className="text-xl font-bold mt-1" style={{ color: branding.primaryColor }}>
            {formatCurrency(totalOneTimeCost)}
          </p>
          {quoteDetails.showSecondCurrency && (
            <p className="text-sm mt-1 text-gray-600">
              {formatSecondaryCurrency(totalOneTimeCost)}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {getServerDetailsText()}
            {quoteDetails.includeImplementationCost && quoteDetails.implementationCost > 0 && 
              ", implementation fee"}
          </p>
        </div>
        
        {/* Recurring Fees Column - now Subscription Fees */}
        <div className="border-r border-gray-200 p-3">
          <p className="text-sm font-medium">Subscription Fees</p>
          <div className="flex items-baseline mt-1">
            <p className="text-xl font-bold" style={{ color: branding.primaryColor }}>
              {formatCurrency(recurringAmount)}
            </p>
            <p className="text-xs text-gray-500 ml-1">
              {recurringText}
            </p>
          </div>
          {quoteDetails.showSecondCurrency && (
            <p className="text-sm mt-1 text-gray-600">
              {formatSecondaryCurrency(recurringAmount)}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            For {quoteDetails.totalCameras} cameras
          </p>
          {quoteDetails.discountPercentage > 0 && (
            <p className="text-xs text-red-500">
              (includes {quoteDetails.discountPercentage}% discount)
            </p>
          )}
        </div>
        
        {/* Total Contract Value Column */}
        <div className="p-3" >
          <p className="text-sm font-medium">Total Contract Value</p>
          <p className="text-xl font-bold mt-1" style={{ color: branding.primaryColor }}>
            {formatCurrency(totalContractValue)}
          </p>
          {quoteDetails.showSecondCurrency && (
            <p className="text-sm mt-1 text-gray-700">
              {formatSecondaryCurrency(totalContractValue)}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            For {getContractLengthText()}
          </p>
        </div>
      </div>
      
      {/* <div className="text-xs text-gray-500 p-2 border-t border-gray-200">
        {quoteDetails.subscriptionType === 'monthly' ? (
          <p>After initial payment, subscription continues at {formatCurrency(quoteDetails.discountedMonthlyRecurring)}/month until canceled.</p>
        ) : (
          <p>Subscription renews at {formatCurrency(quoteDetails.discountedAnnualRecurring)}/year after initial term.</p>
        )}
      </div> */}
    </div>
  );
}