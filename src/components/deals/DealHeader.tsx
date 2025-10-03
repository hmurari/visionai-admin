import { Button } from "@/components/ui/button";
import { Download, PlusCircle } from "lucide-react";
import { DealStats as DealStatsType } from "@/types/deal";
import { formatCurrency } from "@/utils/dealUtils";

interface DealHeaderProps {
  isAdmin: boolean;
  pipelineStats: DealStatsType | null;
  dealsCount: number;
  onExportCsv: () => void;
  onCreateDeal: () => void;
}

export const DealHeader = ({
  isAdmin,
  pipelineStats,
  dealsCount,
  onExportCsv,
  onCreateDeal
}: DealHeaderProps) => {
  return (
    <div className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {isAdmin ? "Deal Management" : "Deal Registration"}
        </h1>
        <p className="text-gray-600">
          {isAdmin
            ? "Manage and assign deals across all partners"
            : "Register and track your deals with Visionify"
          }
        </p>
      </div>
      <div className="flex items-center space-x-3">
        {/* Total Pipeline Value */}
        {pipelineStats && (
          <div className="text-sm text-gray-600">
            Pipeline Value: <span className="font-semibold text-gray-900">
              {formatCurrency(pipelineStats.totalPipelineValue)}
            </span>
          </div>
        )}
        {dealsCount > 0 && (
          <Button
            onClick={onExportCsv}
            variant="outline"
            className="flex items-center"
            title="Export current list to CSV"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        )}

        <Button
          onClick={onCreateDeal}
          className="flex items-center"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          {isAdmin ? "Create New Deal" : "Register New Deal"}
        </Button>
      </div>
    </div>
  );
};
