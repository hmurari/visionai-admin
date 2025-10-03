import { useState, useMemo } from "react";
import { Deal, DealFilters, Partner, PartnerOption } from "@/types/deal";

interface UseDealFiltersProps {
  deals: Deal[];
  users: Partner[];
  isAdmin: boolean;
}

interface UseDealFiltersReturn extends DealFilters {
  filteredDeals: Deal[];
  partnerFilteredDeals: Deal[]; // Deals filtered by partner/search only (no status filter)
  uniquePartners: PartnerOption[];
  partnerMap: Record<string, { name: string; companyName: string }>;
  setSelectedPartner: (partner: string) => void;
  setSelectedStatus: (status: string) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  hasPartnerFilters: boolean; // True if partner or search filters are active
  getPartnerName: (partnerId: string) => string;
}

export const useDealFilters = ({
  deals,
  users,
  isAdmin
}: UseDealFiltersProps): UseDealFiltersReturn => {
  const [selectedPartner, setSelectedPartner] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Create a map of partner IDs to partner names (admin only)
  const partnerMap = useMemo(() => {
    if (!isAdmin) return {};
    const map: Record<string, { name: string; companyName: string }> = {};
    users.forEach(user => {
      if (user.tokenIdentifier) {
        map[user.tokenIdentifier] = {
          name: user.name || "Unknown",
          companyName: user.companyName || "Unknown Company"
        };
      }
    });
    return map;
  }, [users, isAdmin]);

  // Helper function to get partner name from partnerId
  const getPartnerName = (partnerId: string): string => {
    if (!users) return "Loading...";
    const partner = users.find(user => user.tokenIdentifier === partnerId);
    if (!partner) return "Unknown Partner";

    // Show both company name and contact name for better identification
    const companyName = partner.companyName || "Unknown Company";
    const contactName = partner.name || "Unknown Contact";
    return `${companyName} - ${contactName}`;
  };

  // Get unique partners from deals (admin only)
  const uniquePartners = useMemo(() => {
    if (!isAdmin) return [];
    const partners = new Set<string>();
    deals.forEach(deal => {
      if (deal.partnerId) {
        partners.add(deal.partnerId);
      }
    });

    const partnerList: PartnerOption[] = Array.from(partners).map(partnerId => ({
      id: partnerId,
      type: 'partner'
    }));

    // Add unassigned option if there are unassigned deals
    const hasUnassignedDeals = deals.some(deal => !deal.partnerId);
    if (hasUnassignedDeals) {
      partnerList.unshift({
        id: 'unassigned',
        type: 'partner'
      });
    }

    return partnerList;
  }, [deals, isAdmin]);

  // Filter deals based on selected filters and search query
  const filteredDeals = useMemo(() => {
    let filtered = [...deals];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(deal => {
        // Search in customer name
        const customerMatch = deal.customerName?.toLowerCase().includes(query);

        // Search in contact name
        const contactMatch = deal.contactName?.toLowerCase().includes(query);

        // Search in reseller name (for admin users)
        let resellerMatch = false;
        if (isAdmin && deal.partnerId) {
          const partnerName = getPartnerName(deal.partnerId);
          resellerMatch = partnerName.toLowerCase().includes(query);
        }

        return customerMatch || contactMatch || resellerMatch;
      });
    }

    // Filter by partner
    if (selectedPartner !== "all") {
      if (selectedPartner === "unassigned") {
        filtered = filtered.filter(deal => !deal.partnerId);
      } else {
        filtered = filtered.filter(deal => deal.partnerId === selectedPartner);
      }
    }

    // Apply status filtering
    if (selectedStatus === "lost") {
      // Show only lost deals when explicitly selected
      filtered = filtered.filter(deal => deal.status === "lost");
    } else if (selectedStatus !== "all") {
      // Show specific status when selected
      filtered = filtered.filter(deal => deal.status === selectedStatus);
    } else {
      // When "all" is selected, exclude lost deals by default
      filtered = filtered.filter(deal => deal.status !== "lost");
    }

    return filtered;
  }, [deals, selectedPartner, selectedStatus, searchQuery, isAdmin, getPartnerName]);

  // Filter deals by partner/search only (no status filter)
  const partnerFilteredDeals = useMemo(() => {
    let filtered = [...deals];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(deal => {
        // Search in customer name
        const customerMatch = deal.customerName?.toLowerCase().includes(query);

        // Search in contact name
        const contactMatch = deal.contactName?.toLowerCase().includes(query);

        // Search in reseller name (for admin users)
        let resellerMatch = false;
        if (isAdmin && deal.partnerId) {
          const partnerName = getPartnerName(deal.partnerId);
          resellerMatch = partnerName.toLowerCase().includes(query);
        }

        return customerMatch || contactMatch || resellerMatch;
      });
    }

    // Filter by partner
    if (selectedPartner !== "all") {
      if (selectedPartner === "unassigned") {
        filtered = filtered.filter(deal => !deal.partnerId);
      } else {
        filtered = filtered.filter(deal => deal.partnerId === selectedPartner);
      }
    }

    return filtered;
  }, [deals, selectedPartner, searchQuery, isAdmin, getPartnerName]);

  const clearFilters = () => {
    setSelectedPartner("all");
    setSelectedStatus("all");
    setSearchQuery("");
  };

  const hasActiveFilters: boolean = !!(selectedPartner !== "all" || selectedStatus !== "all" || searchQuery.trim());
  const hasPartnerFilters: boolean = !!(selectedPartner !== "all" || searchQuery.trim());

  return {
    selectedPartner,
    selectedStatus,
    searchQuery,
    filteredDeals,
    partnerFilteredDeals,
    uniquePartners,
    partnerMap,
    setSelectedPartner,
    setSelectedStatus,
    setSearchQuery,
    clearFilters,
    hasActiveFilters,
    hasPartnerFilters,
    getPartnerName
  };
};
