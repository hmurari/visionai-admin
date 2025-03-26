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

interface PricingData {
  pricing: {
    monthly: {
      everything: {
        upTo20Cameras: number;
        upTo100Cameras: number;
        over100Cameras: number;
      };
      core: {
        upTo20Cameras: number;
        upTo100Cameras: number;
        over100Cameras: number;
      };
      single: {
        upTo20Cameras: number;
        upTo100Cameras: number;
        over100Cameras: number;
      };
      infrastructureCost: number;
    };
    yearly: {
      everything: {
        upTo20Cameras: number;
        upTo100Cameras: number;
        over100Cameras: number;
      };
      core: {
        upTo20Cameras: number;
        upTo100Cameras: number;
        over100Cameras: number;
      };
      single: {
        upTo20Cameras: number;
        upTo100Cameras: number;
        over100Cameras: number;
      };
      infrastructureCost: number;
    };
    threeYear: {
      everything: {
        upTo20Cameras: number;
        upTo100Cameras: number;
        over100Cameras: number;
      };
      core: {
        upTo20Cameras: number;
        upTo100Cameras: number;
        over100Cameras: number;
      };
      single: {
        upTo20Cameras: number;
        upTo100Cameras: number;
        over100Cameras: number;
      };
      infrastructureCost: number;
    };
  };
  additionalCosts: {
    edgeServer: {
      name: string;
      description: string;
      cost: number;
    };
    implementation: {
      name: string;
      description: string;
      cost: number;
    };
    infrastructure: {
      name: string;
      description: string;
      costPerCamera: number;
    };
  };
  standardFeatures: string[];
  companyInfo: {
    name: string;
    phone: string;
    email: string;
  };
}

interface StaticPricingTableProps {
  pricingData: PricingData;
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

  // All scenarios list
  const allScenarios = [
    "PPE Compliance",
    "Area Controls",
    "Forklift Safety",
    "Emergency Events",
    "Hazard Warnings",
    "Behavioral Safety",
    "Mobile Phone Compliance",
    "Staircase Safety",
    "Housekeeping",
    "Headcounts",
    "Occupancy Metrics",
    "Spills & Leaks Detection"
  ];
  
  // Additional features with icons
  const additionalFeatures = [
    { name: "12s Video Clips, 1 year Archival", icon: <Video className="h-4 w-4" /> },
    { name: "Web & Mobile App", icon: <Smartphone className="h-4 w-4" /> },
    { name: "Up to 100 users", icon: <Users className="h-4 w-4" /> },
    { name: "Volume discounts for 100+ Cameras", icon: <TrendingUp className="h-4 w-4" /> },
    { name: "24/7 Support", icon: <Clock className="h-4 w-4" /> },
    { name: "Regular Updates", icon: <RefreshCw className="h-4 w-4" /> },
    { name: "Secure Data Storage", icon: <ShieldIcon className="h-4 w-4" /> },
    { name: "Custom Configuration", icon: <Settings className="h-4 w-4" /> }
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

  return (
    <div ref={pricingTableRef} className="pricing-table max-w-7xl mx-auto p-6">
      {/* Title with enhanced styling */}
      <h2 className="text-center text-3xl font-bold mb-8 text-[#1E293B] tracking-tight">
        Visionify License Pricing
      </h2>
      
      {/* Pricing Table with enhanced styling */}
      <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="w-1/5 py-4 px-6 text-center text-med font-semibold text-gray-700">Package</th>
              <th className="w-1/5 py-4 px-6 text-center text-med font-semibold text-gray-700">Camera Count</th>
              <th className="w-1/5 py-4 px-6 text-center text-med font-semibold text-gray-700">Starter</th>
              <th className="w-1/5 py-4 px-6 text-center text-med font-semibold text-blue-700 bg-blue-50">
                <div className="flex items-center justify-center">
                  Core Package
                </div>
              </th>
              <th className="w-1/5 py-4 px-6 text-center text-med font-semibold text-gray-700">Everything Package</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Monthly Subscription row with updated styling */}
            <tr>
              <td className="py-4 px-6" rowSpan={3}>
                <div className="flex items-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">Monthly Subscription</div>
                    <div className="text-sm text-gray-500">Billed Monthly</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6 text-center">1-20 Cams</td>
              <td className="py-4 px-6 text-center">
                {displayPrice(pricingData.pricing.monthly.single.upTo20Cameras)}
              </td>
              <td className="py-4 px-6 text-center popular-column">
                {displayPrice(pricingData.pricing.monthly.core.upTo20Cameras)}
              </td>
              <td className="py-4 px-6 text-center">
                {displayPrice(pricingData.pricing.monthly.everything.upTo20Cameras)}
              </td>
            </tr>
            <tr>
              <td className="py-4 px-6 text-center">21-99 Cams</td>
              <td className="py-4 px-6 text-center">
                {displayPrice(pricingData.pricing.monthly.single.upTo100Cameras)}
              </td>
              <td className="py-4 px-6 text-center popular-column">
                {displayPrice(pricingData.pricing.monthly.core.upTo100Cameras)}
              </td>
              <td className="py-4 px-6 text-center">
                {displayPrice(pricingData.pricing.monthly.everything.upTo100Cameras)}
              </td>
            </tr>
            <tr>
              <td className="py-4 px-6 text-center">100+ Cams</td>
              <td className="py-4 px-6 text-center">
                {displayPrice(pricingData.pricing.monthly.single.over100Cameras)}
              </td>
              <td className="py-4 px-6 text-center popular-column">
                {displayPrice(pricingData.pricing.monthly.core.over100Cameras)}
              </td>
              <td className="py-4 px-6 text-center">
                {displayPrice(pricingData.pricing.monthly.everything.over100Cameras)}
              </td>
            </tr>
            
            {/* 1 Year Agreement */}
            <tr>
              <td className="py-4 px-6" rowSpan={3}>
                <div className="flex items-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">1 Year Agreement</div>
                    <div className="text-sm text-gray-500">17% off over monthly</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6 text-center">1-20 Cams</td>
              <td className="py-4 px-6 text-center">
                {displayPrice(pricingData.pricing.yearly.single.upTo20Cameras)}
              </td>
              <td className="py-4 px-6 text-center popular-column">
                {displayPrice(pricingData.pricing.yearly.core.upTo20Cameras)}
              </td>
              <td className="py-4 px-6 text-center">
                {displayPrice(pricingData.pricing.yearly.everything.upTo20Cameras)}
              </td>
            </tr>
            <tr>
              <td className="py-4 px-6 text-center">21-99 Cams</td>
              <td className="py-4 px-6 text-center">
                {displayPrice(pricingData.pricing.yearly.single.upTo100Cameras)}
              </td>
              <td className="py-4 px-6 text-center popular-column">
                {displayPrice(pricingData.pricing.yearly.core.upTo100Cameras)}
              </td>
              <td className="py-4 px-6 text-center">
                {displayPrice(pricingData.pricing.yearly.everything.upTo100Cameras)}
              </td>
            </tr>
            <tr>
              <td className="py-4 px-6 text-center">100+ Cams</td>
              <td className="py-4 px-6 text-center">
                {displayPrice(pricingData.pricing.yearly.single.over100Cameras)}
              </td>
              <td className="py-4 px-6 text-center popular-column">
                {displayPrice(pricingData.pricing.yearly.core.over100Cameras)}
              </td>
              <td className="py-4 px-6 text-center">
                {displayPrice(pricingData.pricing.yearly.everything.over100Cameras)}
              </td>
            </tr>
            
            {/* Cloud Costs */}
            <tr>
              <td className="py-4 px-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Cloud className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">Cloud Costs</div>
                    <div className="text-sm text-gray-500">(Visionify Cloud, per camera/month)</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6 text-center"></td>
              <td colSpan={3} className="py-4 px-6">
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="font-medium">{displayPrice(pricingData.additionalCosts.infrastructure.costPerCamera)}</div>
                    <div className="text-sm text-gray-500">per camera/month</div>
                    <div className="text-sm text-gray-500">not required for Customer Cloud</div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="py-4 px-6" rowSpan={2}>
                <div className="flex items-center">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Database className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">One-time Costs</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6 min-w-[300px]">
                <div className="text-right">
                  <div className="font-medium text-gray-900">Edge Server (per device):</div>
                  <div className="text-sm text-gray-500">Can be procured by customer</div>
                </div>
              </td>
              <td colSpan={3} className="py-4 px-6">
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{displayPrice(pricingData.additionalCosts.edgeServer.cost)}</div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td className="py-4 px-6 min-w-[300px]">
                <div className="text-right whitespace-nowrap">
                  <div className="font-medium text-gray-900">Implementation Costs (per site):</div>
                  <div className="text-sm text-gray-500">Waived for 20+ cameras</div>
                </div>
              </td>
              <td colSpan={3} className="py-4 px-6">
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{displayPrice(pricingData.additionalCosts.implementation.cost)}</div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Package Features - Enhanced Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-4 px-6">
            <h3 className="text-lg font-semibold text-gray-800">Starter</h3>
            <p className="text-sm text-gray-600 mt-1">Choose 1 Scenario</p>
          </div>
          <div className="p-6 bg-white">
            <div className="space-y-3">
              {allScenarios.map((scenario, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex-shrink-0 ${index === 0 ? 'text-blue-500' : 'text-gray-300'}`}>
                    <Check className="h-5 w-5" />
                  </div>
                  <span className={`ml-3 text-sm ${index === 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                    {scenario}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-blue-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-4 px-6">
            <h3 className="text-lg font-semibold text-blue-800">Core Package</h3>
            <p className="text-sm text-blue-600 mt-1">Choose 3 Scenarios</p>
          </div>
          <div className="p-6 bg-white">
            <div className="space-y-3">
              {allScenarios.map((scenario, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex-shrink-0 ${index < 3 ? 'text-blue-500' : 'text-gray-300'}`}>
                    <Check className="h-5 w-5" />
                  </div>
                  <span className={`ml-3 text-sm ${index < 3 ? 'text-gray-800' : 'text-gray-400'}`}>
                    {scenario}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-4 px-6">
            <h3 className="text-lg font-semibold text-gray-800">Everything Package</h3>
            <p className="text-sm text-gray-600 mt-1">All Scenarios</p>
          </div>
          <div className="p-6 bg-white">
            <div className="space-y-3">
              {allScenarios.map((scenario, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-shrink-0 text-blue-500">
                    <Check className="h-5 w-5" />
                  </div>
                  <span className="ml-3 text-sm text-gray-800">
                    {scenario}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      
      {/* Additional Features - Simplified */}
      <div className="mb-8">
        <div className="grid grid-cols-4 gap-4">
          {additionalFeatures.map((feature, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 text-center feature-card">
              <div className="text-blue-500 mb-2 flex justify-center">
                {feature.icon}
              </div>
              <span className="text-xs text-gray-700">{feature.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Extra spacing before footer */}
      <div className="h-12"></div>
      
      {/* Footer with gradient background */}
      <div className="mt-12 bg-gradient-to-r from-gray-50 via-white to-gray-50 rounded-xl p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-800 mb-4">
            For more information or a custom quote, please contact our sales team
          </p>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <a href={`tel:${pricingData.companyInfo.phone}`} className="text-blue-600 hover:text-blue-700">
              {pricingData.companyInfo.phone}
            </a>
            <span className="text-gray-300">|</span>
            <a href={`mailto:${pricingData.companyInfo.email}`} className="text-blue-600 hover:text-blue-700">
              {pricingData.companyInfo.email}
            </a>
          </div>
          <p className="text-sm text-gray-500">
            Pricing valid until {expirationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}