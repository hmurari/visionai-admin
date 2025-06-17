import { useState, useEffect, ReactElement, useRef } from 'react';
import { 
  CheckCircle, 
  Camera, 
  Bell, 
  BarChart3, 
  Database, 
  Shield, 
  Smartphone, 
  Cloud, 
  HeadphonesIcon, 
  RefreshCw, 
  Code,
  Video,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  Shield as ShieldIcon,
  Settings,
  Check,
  Star
} from 'lucide-react';
import { 
  currencyOptions, 
  formatCurrency, 
  fetchExchangeRates 
} from '@/utils/currencyUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import '../styles/pricingTable.css';
import { generatePDF } from '@/utils/pdfUtils';

interface PricingDataV2 {
  basePackage: {
    name: string;
    price: number;
    includedCameras: number;
    includedScenarios: number;
    description: string[];
  };
  subscriptionTypes: Array<{
    id: string;
    name: string;
    description: string;
    multiplier: number;
    discount: number;
  }>;
  additionalCameraPricing: {
    corePackage: Array<{
      range: string;
      pricePerMonth: number;
    }>;
    everythingPackage: Array<{
      range: string;
      pricePerMonth: number;
    }>;
  };
  scenarios: string[];
  standardFeatures: string[];
  companyInfo: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    website: string;
  };
  branding: {
    logo: string;
    companyName: string;
    primaryColor: string;
  };
}

interface StaticPricingTableProps {
  pricingData: PricingDataV2;
  showSecondCurrency?: boolean;
  primaryCurrency?: string;
  exchangeRate?: number;
  currencySymbol?: string;
  showThreeYear?: boolean;
}

export default function StaticPricingTable({ 
  pricingData, 
  showSecondCurrency = false, 
  primaryCurrency = 'USD',
  exchangeRate = 1,
  currencySymbol = '$',
  showThreeYear = true
}: StaticPricingTableProps) {
  // Add state for exchange rates
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [rateError, setRateError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showCurrencyControls, setShowCurrencyControls] = useState(false);

  // Calculate dates
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 30);

  // Additional features with icons
  const additionalFeatures = [
    { name: "Web & Mobile App", icon: <Smartphone className="h-4 w-4" /> },
    { name: "4 weeks whiteglove onboarding", icon: <Users className="h-4 w-4" /> },
    { name: "12s Video Clips", icon: <Video className="h-4 w-4" /> },
    { name: "1 Year Video Archival", icon: <Database className="h-4 w-4" /> },
    { name: "Up to 100 users", icon: <Users className="h-4 w-4" /> },
    { name: "TV Wall Feature", icon: <BarChart3 className="h-4 w-4" /> },
    { name: "Text, Email, MS Teams, WhatsApp", icon: <Bell className="h-4 w-4" /> },
    { name: "Periodic Reports (daily, weekly)", icon: <Calendar className="h-4 w-4" /> },
    { name: "Speaker Integration (Axis, HikVision)", icon: <Settings className="h-4 w-4" /> }
  ];
  
  // Fetch exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoadingRates(true);
      setRateError('');
      
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        
        if (data.result === 'success') {
          setRates(data.rates);
          setLastUpdated(new Date(data.time_last_update_utc));
        } else {
          throw new Error('Failed to fetch exchange rates');
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
        setRateError('Using default exchange rates');
      } finally {
        setIsLoadingRates(false);
      }
    };

    if (showSecondCurrency) {
      fetchRates();
    }
  }, [showSecondCurrency]);
  
  // Format primary currency helper
  const formatPrimaryCurrency = (amount: number) => {
    const convertedAmount = primaryCurrency === 'USD' ? amount : amount * exchangeRate;
    return new Intl.NumberFormat(
      primaryCurrency === 'INR' ? 'en-IN' : 'en-US', 
      {
        style: 'currency',
        currency: primaryCurrency,
        maximumFractionDigits: 0,
        minimumFractionDigits: 0
      }
    ).format(convertedAmount);
  };
  
  // Format USD (secondary currency) helper
  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Helper function to display price with secondary currency if needed
  const displayPrice = (amount: number) => {
    if (!showSecondCurrency || primaryCurrency === 'USD') {
      return formatPrimaryCurrency(amount);
    }
    
    return (
      <div>
        {formatPrimaryCurrency(amount)}
        <div className="text-xs text-gray-500">
          ({formatUSD(amount)})
        </div>
      </div>
    );
  };
  
  // Add a ref to the pricing table
  const pricingTableRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!pricingTableRef.current) return;
    
    await generatePDF(
      pricingTableRef.current,
      {
        filename: `Visionify_Pricing_Table_${new Date().toISOString().split('T')[0]}.pdf`,
        title: 'Visionify Pricing Table',
        subject: 'Safety Analytics Pricing',
        author: 'Visionify Inc.',
        keywords: 'pricing, safety analytics, visionify',
        creator: 'Visionify Pricing Generator'
      }
    );
  };

  // Calculate discounted prices for different subscription types
  const getDiscountedPrice = (basePrice: number, subscriptionType: string) => {
    const subscription = pricingData.subscriptionTypes.find(s => s.id === subscriptionType);
    if (!subscription) return basePrice;
    
    return basePrice * (1 - subscription.discount);
  };

  return (
    <div ref={pricingTableRef} className="pricing-table max-w-7xl mx-auto p-6">
      {/* Title with enhanced styling */}
      <h2 className="text-center text-3xl font-bold mb-8 text-[#1E293B] tracking-tight">
        Visionify License Pricing
      </h2>
      
      {/* Simplified Pricing Table */}
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
              <th className="py-6 px-6 text-left text-lg font-bold text-blue-900">Camera Volume</th>
              <th className="py-6 px-6 text-center text-lg font-bold text-blue-900">Core Package</th>
              <th className="py-6 px-6 text-center text-lg font-bold text-blue-900">Everything Package</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* 1-20 Cameras */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="py-6 px-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-4">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">1-20 Cameras</div>
                    <div className="text-sm text-gray-500">Standard pricing</div>
                  </div>
                </div>
              </td>
              <td className="py-6 px-6 text-center">
                <div className="space-y-2">
                  <div className="text-lg font-bold text-gray-900">
                    {displayPrice(getDiscountedPrice(pricingData.additionalCameraPricing.corePackage[0].pricePerMonth, 'yearly'))}
                  </div>
                  <div className="text-xs text-gray-500">per camera/month</div>
                </div>
              </td>
              <td className="py-6 px-6 text-center">
                <div className="space-y-2">
                  <div className="text-lg font-bold text-gray-900">
                    {displayPrice(getDiscountedPrice(pricingData.additionalCameraPricing.everythingPackage[0].pricePerMonth, 'yearly'))}
                  </div>
                  <div className="text-xs text-gray-500">per camera/month</div>
                </div>
              </td>
            </tr>

            {/* 21-100 Cameras */}
            <tr className="hover:bg-gray-50 transition-colors bg-green-25">
              <td className="py-6 px-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-green-100 text-green-600 mr-4">
                    <Star className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">21-100 Cameras</div>
                    <div className="text-sm text-green-600 font-medium">20% volume discount</div>
                  </div>
                </div>
              </td>
              <td className="py-6 px-6 text-center">
                <div className="space-y-2">
                  <div className="text-lg font-bold text-green-700">
                    {displayPrice(getDiscountedPrice(pricingData.additionalCameraPricing.corePackage[1].pricePerMonth, 'yearly'))}
                  </div>
                  <div className="text-xs text-gray-500">per camera/month</div>
                </div>
              </td>
              <td className="py-6 px-6 text-center">
                <div className="space-y-2">
                  <div className="text-lg font-bold text-green-700">
                    {displayPrice(getDiscountedPrice(pricingData.additionalCameraPricing.everythingPackage[1].pricePerMonth, 'yearly'))}
                  </div>
                  <div className="text-xs text-gray-500">per camera/month</div>
                </div>
              </td>
            </tr>

            {/* 100+ Cameras */}
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="py-6 px-6">
                <div className="flex items-center">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 mr-4">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">100+ Cameras</div>
                    <div className="text-sm text-purple-600 font-medium">40% volume discount • Best Value</div>
                  </div>
                </div>
              </td>
              <td className="py-6 px-6 text-center">
                <div className="space-y-2">
                  <div className="text-lg font-bold text-purple-700">
                    {displayPrice(getDiscountedPrice(pricingData.additionalCameraPricing.corePackage[2].pricePerMonth, 'yearly'))}
                  </div>
                  <div className="text-xs text-gray-500">per camera/month</div>
                </div>
              </td>
              <td className="py-6 px-6 text-center">
                <div className="space-y-2">
                  <div className="text-lg font-bold text-purple-700">
                    {displayPrice(getDiscountedPrice(pricingData.additionalCameraPricing.everythingPackage[2].pricePerMonth, 'yearly'))}
                  </div>
                  <div className="text-xs text-gray-500">per camera/month</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        {/* Pricing Notes */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              <span className="font-medium">Annual Pricing</span>
            </p>
            <p className="text-sm text-gray-400">
              <span className="font-medium">(Includes 20% discount over monthly rates)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Package Comparison */}
      <div className="mb-8 grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Check className="h-5 w-5 text-blue-600" />
            </div>
            Core Package
          </h3>
          <p className="text-gray-600 mb-4">Choose any 3 safety scenarios from our complete list</p>
          <div className="space-y-2">
            {pricingData.scenarios.slice(0, 3).map((scenario, index) => (
              <div key={index} className="flex items-center text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                {scenario}
              </div>
            ))}
            <div className="text-sm text-gray-500 italic">+ Choose any 3 scenarios</div>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
          <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Star className="h-5 w-5 text-white" />
            </div>
            Everything Package
          </h3>
          <p className="text-blue-700 mb-4">All {pricingData.scenarios.length} safety scenarios included</p>
          <div className="grid grid-cols-2 gap-1">
            {pricingData.scenarios.map((scenario, index) => (
              <div key={index} className="flex items-center text-xs text-blue-700">
                <CheckCircle className="h-3 w-3 mr-1 text-blue-600" />
                {scenario}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Standard Features Section */}
      <div className="mb-8 p-6 bg-green-50 rounded-xl border border-green-200">
        <h3 className="text-xl font-semibold text-green-900 mb-4 text-center">Standard Features Included</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {additionalFeatures.map((feature, index) => (
            <div key={index} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <div className="text-green-600 mr-3">{feature.icon}</div>
              <span className="text-sm text-green-800 font-medium">{feature.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer section with company information */}
      <div className="footer-section border-t pt-8 mt-8 text-center">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{pricingData.companyInfo.name}</h3>
          <p className="text-sm text-gray-600 mb-2">
            {pricingData.companyInfo.address}, {pricingData.companyInfo.city}, {pricingData.companyInfo.state} {pricingData.companyInfo.zip}
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href={`tel:${pricingData.companyInfo.phone}`} className="text-blue-600 hover:text-blue-700">
              {pricingData.companyInfo.phone}
            </a>
            <a href={`mailto:${pricingData.companyInfo.email}`} className="text-blue-600 hover:text-blue-700">
              {pricingData.companyInfo.email}
            </a>
            <a href={`https://${pricingData.companyInfo.website}`} className="text-blue-600 hover:text-blue-700">
              {pricingData.companyInfo.website}
            </a>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 space-y-1">
          <p>Quote expires on: {expirationDate.toLocaleDateString()}</p>
          <p>Generated on: {today.toLocaleDateString()}</p>
          <p>All prices are in {primaryCurrency}. Additional terms and conditions may apply.</p>
        </div>
      </div>
    </div>
  );
}