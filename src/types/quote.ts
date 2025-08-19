export interface ClientInfo {
  name: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  customerId?: string | null;
}

export interface Branding {
  companyName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

export interface QuoteDetailsV2 {
  _id?: string;
  clientInfo: ClientInfo;
  date: string;
  subscriptionType: string;
  totalCameras: number;
  selectedScenarios: string[];
  discountPercentage: number;
  baseCost: number;
  oneTimeBaseCost: number;
  additionalCameras: number;
  additionalCameraCost: number;
  additionalCamerasMonthlyRecurring: number;
  monthlyRecurring: number;
  threeMonthRecurring?: number;
  annualRecurring: number;
  discountedAnnualRecurring: number;
  discountedMonthlyRecurring: number;
  discountedThreeMonthRecurring?: number;
  discountAmount: number;
  contractLength: number;
  totalContractValue: number;
  showSecondCurrency?: boolean;
  secondaryCurrency?: string;
  exchangeRate?: number;
  lastUpdated?: string | null;
  isEverythingPackage?: boolean;
  quoteNumber?: string;
  serverCount?: number;
  serverBaseCost?: number;
  implementationCost?: number;
  includeImplementationCost?: boolean;
  totalOneTimeCost?: number;
  perpetualLicenseCost?: number;
  amcCost?: number;
} 