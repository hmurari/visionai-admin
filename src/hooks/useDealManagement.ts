import { useState } from "react";
import { Deal, DealFormData } from "@/types/deal";

interface UseDealManagementReturn {
  isDealFormOpen: boolean;
  customerFormOpen: boolean;
  editingDeal: string | null;
  deleteDialogOpen: boolean;
  dealToDelete: Deal | null;
  openNewDealDialog: () => void;
  openEditDealDialog: (dealId: string) => void;
  closeDealDialog: () => void;
  openCustomerForm: () => void;
  closeCustomerForm: () => void;
  openDeleteDialog: (deal: Deal) => void;
  closeDeleteDialog: () => void;
  setEditingDeal: (dealId: string | null) => void;
  getInitialDataForDeal: (dealId: string, deals: Deal[]) => DealFormData | null;
}

export const useDealManagement = (): UseDealManagementReturn => {
  const [isDealFormOpen, setIsDealFormOpen] = useState(false);
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<Deal | null>(null);

  const openNewDealDialog = () => {
    setEditingDeal(null);
    setIsDealFormOpen(true);
  };

  const openEditDealDialog = (dealId: string) => {
    setEditingDeal(dealId);
    setIsDealFormOpen(true);
  };

  const closeDealDialog = () => {
    setIsDealFormOpen(false);
    setEditingDeal(null);
  };

  const openCustomerForm = () => {
    setCustomerFormOpen(true);
  };

  const closeCustomerForm = () => {
    setCustomerFormOpen(false);
  };

  const openDeleteDialog = (deal: Deal) => {
    setDealToDelete(deal);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDealToDelete(null);
  };

  const getInitialDataForDeal = (dealId: string, deals: Deal[]): DealFormData | null => {
    const deal = deals.find(d => d._id === dealId);
    if (!deal) return null;

    return {
      companyName: deal.customerName,
      contactName: deal.contactName,
      contactEmail: deal.customerEmail || "",
      contactPhone: deal.customerPhone || "",
      customerAddress: deal.customerAddress || "",
      customerCity: deal.customerCity || "",
      customerState: deal.customerState || "",
      customerZip: deal.customerZip || "",
      customerCountry: deal.customerCountry || "",
      opportunityAmount: deal.opportunityAmount.toString(),
      commissionRate: deal.commissionRate || 20,
      expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : "",
      lastFollowup: deal.lastFollowup ? new Date(deal.lastFollowup).toISOString().split('T')[0] : "",
      notes: deal.notes || "",
      status: deal.status,
      cameraCount: deal.cameraCount?.toString() || "",
      interestedUsecases: deal.interestedUsecases || [],
      partnerId: deal.partnerId || "",
      assignmentNotes: deal.assignmentNotes || "",
    };
  };

  return {
    isDealFormOpen,
    customerFormOpen,
    editingDeal,
    deleteDialogOpen,
    dealToDelete,
    openNewDealDialog,
    openEditDealDialog,
    closeDealDialog,
    openCustomerForm,
    closeCustomerForm,
    openDeleteDialog,
    closeDeleteDialog,
    setEditingDeal,
    getInitialDataForDeal
  };
};
