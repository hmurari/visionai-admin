export type DealStatus = "new" | "1st_call" | "2plus_calls" | "approved" | "won" | "lost" | "later";

export interface Deal {
  _id: string;
  _creationTime: number;
  updatedAt?: number;
  customerName: string;
  contactName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerZip?: string;
  customerCountry?: string;
  opportunityAmount: number;
  commissionRate?: number;
  status: DealStatus;
  expectedCloseDate?: number;
  lastFollowup?: number;
  cameraCount?: number;
  interestedUsecases?: string[];
  notes?: string;
  partnerId?: string;
  assignmentNotes?: string;
  userId?: string;
}

export interface Partner {
  _id: string;
  tokenIdentifier: string;
  name?: string;
  companyName?: string;
  phone?: string;
  email: string;
  role?: string;
  partnerStatus?: "active" | "disabled";
  joinDate?: number;
  country?: string;
  industryFocus?: string;
  annualRevenue?: string;
  website?: string;
}

export interface DealFilters {
  selectedPartner: string;
  selectedStatus: string;
  searchQuery: string;
}

export interface DealStats {
  new: number;
  firstCall: number;
  twoPlusCalls: number;
  approved: number;
  won: number;
  lost: number;
  later: number;
  total: number;
  newAmount: number;
  firstCallAmount: number;
  twoPlusCallsAmount: number;
  approvedAmount: number;
  wonAmount: number;
  lostAmount: number;
  laterAmount: number;
  totalPipelineValue: number;
  totalAmount: number;
}

export interface PartnerOption {
  id: string;
  type: 'partner';
}

export interface DealFormData {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerZip?: string;
  customerCountry?: string;
  opportunityAmount: string;
  commissionRate?: number;
  expectedCloseDate?: string;
  lastFollowup?: string;
  notes?: string;
  status?: DealStatus;
  cameraCount?: string;
  interestedUsecases?: string[];
  partnerId?: string;
  assignmentNotes?: string;
}
