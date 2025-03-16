// Common currency options with default rates
export const currencyOptions = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$', rate: 1 },
  { value: 'INR', label: 'Indian Rupee (₹)', symbol: '₹', rate: 83.12 },
  { value: 'EUR', label: 'Euro (€)', symbol: '€', rate: 0.93 },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£', rate: 0.79 },
  { value: 'BRL', label: 'Brazilian Real (R$)', symbol: 'R$', rate: 4.97 },
  { value: 'MXN', label: 'Mexican Peso (MX$)', symbol: 'MX$', rate: 17.05 },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$', rate: 1.38 },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$', rate: 1.53 },
  { value: 'NZD', label: 'New Zealand Dollar (NZ$)', symbol: 'NZ$', rate: 1.65 },
  { value: 'TRY', label: 'Turkish Lira (₺)', symbol: '₺', rate: 31.89 },
  { value: 'EGP', label: 'Egyptian Pound (E£)', symbol: 'E£', rate: 30.90 },
  { value: 'PLN', label: 'Polish Złoty (zł)', symbol: 'zł', rate: 4.00 },
  { value: 'CNY', label: 'Chinese Yuan (¥)', symbol: '¥', rate: 7.23 },
  { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥', rate: 150.59 },
  { value: 'THB', label: 'Thai Baht (฿)', symbol: '฿', rate: 35.97 },
  { value: 'PHP', label: 'Philippine Peso (₱)', symbol: '₱', rate: 56.02 },
  { value: 'MYR', label: 'Malaysian Ringgit (RM)', symbol: 'RM', rate: 4.73 }
];

// Format currency based on locale and currency code
export const formatCurrency = (amount: number, currencyCode: string = 'USD', options: Intl.NumberFormatOptions = {}) => {
  const defaultOptions = {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    ...options
  };

  return new Intl.NumberFormat(
    currencyCode === 'INR' ? 'en-IN' : 'en-US',
    {
      style: 'currency',
      currency: currencyCode,
      ...defaultOptions
    }
  ).format(amount);
};

// Fetch exchange rates from API
export const fetchExchangeRates = async () => {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await response.json();
    
    if (data.result === 'success') {
      return {
        rates: data.rates,
        lastUpdated: new Date(data.time_last_update_utc),
        error: null
      };
    }
    throw new Error('Failed to fetch exchange rates');
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return {
      rates: currencyOptions.reduce((acc, curr) => ({
        ...acc,
        [curr.value]: curr.rate
      }), {}),
      lastUpdated: new Date(),
      error: 'Using default exchange rates'
    };
  }
};

// Get currency symbol
export const getCurrencySymbol = (currencyCode: string) => {
  const currency = currencyOptions.find(c => c.value === currencyCode);
  return currency ? currency.symbol : '$';
};

// Convert amount to different currency
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string, rates: Record<string, number> | null) => {
  if (fromCurrency === toCurrency) return amount;
  if (!rates) return amount;
  
  const rate = rates[toCurrency] / (rates[fromCurrency] || 1);
  return amount * rate;
}; 