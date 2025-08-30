import { useMemo } from "react";
import { Deal, DealStats } from "@/types/deal";

interface UseDealStatsProps {
  deals: Deal[];
  filteredDeals: Deal[];
  isAdmin: boolean;
}

interface UseDealStatsReturn {
  pipelineStats: DealStats | null;
  filteredStats: DealStats | null;
}

const calculateDealStats = (deals: Deal[]): DealStats => {
  // Calculate stats by status
  const newDeals = deals.filter(deal => deal.status === "new");
  const firstCallDeals = deals.filter(deal => deal.status === "1st_call");
  const twoPlusCallsDeals = deals.filter(deal => deal.status === "2plus_calls");
  const approvedDeals = deals.filter(deal => deal.status === "approved");
  const wonDeals = deals.filter(deal => deal.status === "won");
  const lostDeals = deals.filter(deal => deal.status === "lost");

  // Calculate amounts
  const newAmount = newDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
  const firstCallAmount = firstCallDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
  const twoPlusCallsAmount = twoPlusCallsDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
  const approvedAmount = approvedDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
  const wonAmount = wonDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);
  const lostAmount = lostDeals.reduce((sum, deal) => sum + (deal.opportunityAmount || 0), 0);

  // Total pipeline value excludes lost deals
  const totalPipelineValue = newAmount + firstCallAmount + twoPlusCallsAmount + approvedAmount + wonAmount;

  return {
    new: newDeals.length,
    firstCall: firstCallDeals.length,
    twoPlusCalls: twoPlusCallsDeals.length,
    approved: approvedDeals.length,
    won: wonDeals.length,
    lost: lostDeals.length,
    total: deals.length,
    newAmount,
    firstCallAmount,
    twoPlusCallsAmount,
    approvedAmount,
    wonAmount,
    lostAmount,
    totalPipelineValue,
    totalAmount: newAmount + firstCallAmount + twoPlusCallsAmount + approvedAmount + wonAmount + lostAmount
  };
};

export const useDealStats = ({
  deals,
  filteredDeals,
  isAdmin
}: UseDealStatsProps): UseDealStatsReturn => {
  // Calculate pipeline overview statistics (admin only)
  const pipelineStats = useMemo(() => {
    if (!isAdmin) return null;
    return calculateDealStats(deals);
  }, [deals, isAdmin]);

  // Calculate filtered deal statistics (admin only)
  const filteredStats = useMemo(() => {
    if (!isAdmin) return null;
    return calculateDealStats(filteredDeals);
  }, [filteredDeals, isAdmin]);

  return {
    pipelineStats,
    filteredStats
  };
};
