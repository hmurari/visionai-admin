/**
 * Format a number as currency in USD
 * @param amount The number to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  if (isNaN(amount)) return '$0';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a number as currency in a specific currency with exchange rate conversion
 * @param amount The amount in USD
 * @param currencyCode The target currency code (e.g., 'INR', 'EUR')
 * @param exchangeRate The exchange rate to convert from USD
 * @returns Formatted currency string
 */
export const formatCurrencyWithExchange = (
  amount: number, 
  currencyCode: string, 
  exchangeRate: number
): string => {
  if (isNaN(amount) || !exchangeRate) return '';
  
  // Convert USD to target currency
  const convertedAmount = amount * exchangeRate;
  
  // Determine locale based on currency
  const locale = currencyCode === 'INR' ? 'en-IN' : 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(convertedAmount);
};

/**
 * Get currency symbol for a given currency code
 * @param currencyCode The currency code
 * @returns The currency symbol
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  switch (currencyCode) {
    case 'USD':
      return '$';
    case 'INR':
      return '₹';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    default:
      return currencyCode + ' ';
  }
};

/**
 * Format a date to string
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}; 