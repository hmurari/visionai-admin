import { Card, CardContent } from "@/components/ui/card";
import { DealStats as DealStatsType } from "@/types/deal";
import { formatCurrency } from "@/utils/dealUtils";

interface DealStatsProps {
  stats: DealStatsType | null;
  onStatusClick: (status: string) => void;
}

export const DealStats = ({ stats, onStatusClick }: DealStatsProps) => {
  if (!stats) return null;

  const statusCards = [
    {
      status: 'new',
      label: 'Early Stage',
      count: stats.new,
      amount: stats.newAmount,
      color: 'slate'
    },
    {
      status: '1st_call',
      label: 'Low Interest',
      count: stats.firstCall,
      amount: stats.firstCallAmount,
      color: 'blue'
    },
    {
      status: '2plus_calls',
      label: 'High Interest',
      count: stats.twoPlusCalls,
      amount: stats.twoPlusCallsAmount,
      color: 'indigo'
    },
    {
      status: 'approved',
      label: 'Approved',
      count: stats.approved,
      amount: stats.approvedAmount,
      color: 'purple'
    },
    {
      status: 'won',
      label: 'Won',
      count: stats.won,
      amount: stats.wonAmount,
      color: 'green'
    },
    {
      status: 'later',
      label: 'Later',
      count: stats.later,
      amount: stats.laterAmount,
      color: 'amber'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statusCards.map(({ status, label, count, amount, color }) => (
          <Card
            key={status}
            className={`bg-${color}-50 border-${color}-200 cursor-pointer hover:shadow-md hover:border-${color}-300 transition-all duration-200`}
            onClick={() => onStatusClick(status)}
            title={`Click to filter by ${label.toLowerCase()} deals`}
          >
            <CardContent className="p-4 text-center">
              <div className={`text-lg font-bold text-${color}-600`}>{count}</div>
              <div className={`text-sm font-semibold text-${color}-500`}>{formatCurrency(amount)}</div>
              <div className={`text-xs text-${color}-400 mt-1`}>{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
