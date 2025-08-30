import { Deal, Partner } from "@/types/deal";

interface UseCSVExportProps {
  filteredDeals: Deal[];
  isAdmin: boolean;
  getPartnerName: (partnerId: string) => string;
}

interface UseCSVExportReturn {
  handleExportCsv: () => void;
}

const escapeCsv = (value: any): string => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  const needsQuotes = /[",\n\r]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
};

const formatDate = (ts?: number): string => {
  if (!ts || Number.isNaN(ts)) return "";
  try {
    return new Date(ts).toISOString();
  } catch {
    return "";
  }
};

export const useCSVExport = ({
  filteredDeals,
  isAdmin,
  getPartnerName
}: UseCSVExportProps): UseCSVExportReturn => {

  const handleExportCsv = () => {
    try {
      const headersBase = [
        "Deal ID",
        "Customer Name",
        "Contact Name",
        "Customer Email",
        "Customer Phone",
        "Address",
        "City",
        "State",
        "Zip",
        "Country",
        "Opportunity Amount",
        "Commission Rate",
        "Status",
        "Expected Close Date",
        "Last Followup",
        "Camera Count",
        "Interested Usecases",
        "Notes",
        "Created At",
        "Updated At",
      ];

      const headers = isAdmin ? ["Partner"].concat(headersBase) : headersBase;

      const rows = filteredDeals.map((d: any) => {
        const base = [
          d._id,
          d.customerName,
          d.contactName,
          d.customerEmail,
          d.customerPhone,
          d.customerAddress,
          d.customerCity,
          d.customerState,
          d.customerZip,
          d.customerCountry,
          d.opportunityAmount,
          d.commissionRate,
          d.status,
          formatDate(d.expectedCloseDate),
          formatDate(d.lastFollowup),
          d.cameraCount,
          Array.isArray(d.interestedUsecases) ? d.interestedUsecases.join(";") : "",
          d.notes,
          formatDate(d._creationTime),
          formatDate(d.updatedAt),
        ].map(escapeCsv);

        if (isAdmin) {
          const partner = d.partnerId ? getPartnerName(d.partnerId) : "Unassigned";
          return [escapeCsv(partner)].concat(base).join(",");
        }
        return base.join(",");
      });

      const csvContent = [headers.map(escapeCsv).join(","), ...rows].join("\n");
      const bom = "\uFEFF"; // Excel-friendly BOM
      const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `deals_${date}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Note: Toast notifications would need to be handled by the component using this hook
      console.log(`CSV exported successfully with ${filteredDeals.length} deals`);
    } catch (err) {
      console.error("CSV export failed", err);
      throw new Error("Unable to export CSV");
    }
  };

  return {
    handleExportCsv
  };
};
