import { Deal } from "@/types/deal";

/**
 * Format currency amount for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date from timestamp to locale string
 */
export const formatDate = (timestamp?: number): string => {
  if (!timestamp || Number.isNaN(timestamp)) return "";
  try {
    return new Date(timestamp).toLocaleDateString();
  } catch {
    return "";
  }
};

/**
 * Get status color class for UI components
 */
export const getStatusColor = (status: Deal['status']): string => {
  switch (status) {
    case 'new':
      return 'text-slate-600 bg-slate-50 border-slate-200';
    case '1st_call':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case '2plus_calls':
      return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    case 'approved':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'won':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'later':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'lost':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

/**
 * Get status display name
 */
export const getStatusDisplayName = (status: Deal['status']): string => {
  switch (status) {
    case 'new':
      return 'Early Stage';
    case '1st_call':
      return 'Low Interest';
    case '2plus_calls':
      return 'High Interest';
    case 'approved':
      return 'Approved';
    case 'won':
      return 'Won';
    case 'later':
      return 'Later';
    case 'lost':
      return 'Lost';
  }
};

/**
 * Check if a deal matches search criteria
 */
export const dealMatchesSearch = (
  deal: Deal,
  searchQuery: string,
  getPartnerName?: (partnerId: string) => string
): boolean => {
  if (!searchQuery.trim()) return true;

  const query = searchQuery.toLowerCase();

  // Search in customer name
  const customerMatch = deal.customerName?.toLowerCase().includes(query);

  // Search in contact name
  const contactMatch = deal.contactName?.toLowerCase().includes(query);

  // Search in reseller name (if getPartnerName is provided)
  let resellerMatch = false;
  if (getPartnerName && deal.partnerId) {
    const partnerName = getPartnerName(deal.partnerId);
    resellerMatch = partnerName.toLowerCase().includes(query);
  }

  return customerMatch || contactMatch || resellerMatch;
};

/**
 * Filter deals by partner
 */
export const filterDealsByPartner = (deals: Deal[], selectedPartner: string): Deal[] => {
  if (selectedPartner === "all") return deals;

  if (selectedPartner === "unassigned") {
    return deals.filter(deal => !deal.partnerId);
  }

  return deals.filter(deal => deal.partnerId === selectedPartner);
};

/**
 * Filter deals by status
 */
export const filterDealsByStatus = (deals: Deal[], selectedStatus: string): Deal[] => {
  if (selectedStatus === "all") return deals;
  return deals.filter(deal => deal.status === selectedStatus);
};
