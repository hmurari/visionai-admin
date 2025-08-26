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
  speakerCount?: number;
  speakerCost?: number;
  includeSpeakers?: boolean;
  implementationDescription?: string;
  travelCost?: number;
  includeTravel?: boolean;
  travelDescription?: string;
}

export interface KeyTerms {
  product: string;
  program: string;
  deployment: string;
  initialTerm: string;
  startDate: string;
  endDate: string;
  licenses: string;
  renewal: string;
}

export interface OrderFormDetails {
  _id?: string;
  quoteId?: string;
  clientInfo: ClientInfo;
  date: string;
  orderFormNumber?: string;
  keyTerms: KeyTerms;
  successCriteria: string;
  termsAndConditions: string;
  // Include all quote details for pricing
  quoteDetails: QuoteDetailsV2;
  // Signature information
  visionifySignature?: {
    company: string;
    authorizedSignature: string;
    signeeName: string;
    signeeTitle: string;
    companyAddress: string;
    date: string;
  };
  customerSignature?: {
    company: string;
    authorizedSignature: string;
    signeeName: string;
    signeeTitle: string;
    companyAddress: string;
    date: string;
  };
} 