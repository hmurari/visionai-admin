import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { PartnerOption } from "@/types/deal";

interface DealFiltersProps {
  searchQuery: string;
  selectedPartner: string;
  selectedStatus: string;
  uniquePartners: PartnerOption[];
  isAdmin: boolean;
  getPartnerName: (partnerId: string) => string;
  onSearchChange: (query: string) => void;
  onPartnerChange: (partner: string) => void;
  onStatusChange: (status: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const DealFilters = ({
  searchQuery,
  selectedPartner,
  selectedStatus,
  uniquePartners,
  isAdmin,
  getPartnerName,
  onSearchChange,
  onPartnerChange,
  onStatusChange,
  onClearFilters,
  hasActiveFilters
}: DealFiltersProps) => {
  return (
    <div className="bg-white p-4 rounded-lg border mb-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Bar */}
        <div className="flex flex-col space-y-2 min-w-[400px]">
          <Label className="text-sm font-medium">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by customer, contact, or reseller name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Partner Filter */}
        {isAdmin && (
          <div className="flex flex-col space-y-2 min-w-[200px]">
            <Label className="text-sm font-medium">Partner/Reseller</Label>
            <Select value={selectedPartner} onValueChange={onPartnerChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Partners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Partners</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {uniquePartners
                  .filter(partner => partner.id !== 'unassigned')
                  .map(partner => (
                    <SelectItem key={String(partner.id)} value={String(partner.id)}>
                      {getPartnerName(partner.id)}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status Filter */}
        <div className="flex flex-col space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <Select value={selectedStatus} onValueChange={onStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Active Pipeline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Active Pipeline</SelectItem>
              <SelectItem value="new">Early Stage</SelectItem>
              <SelectItem value="1st_call">Low Interest</SelectItem>
              <SelectItem value="2plus_calls">High Interest</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="later">Later</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="mt-6 sm:mt-6"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};
