import { useState, useEffect, ReactElement } from 'react';
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

  // Feature icons mapping
  const featureIcons = {
    "12s Video Clips, 1 year Archival": <Video className="h-4 w-4" />,
    "Web & Mobile App": <Smartphone className="h-4 w-4" />,
    "Up to 100 users": <Users className="h-4 w-4" />,
    "Volume discounts for 100+ Cameras": <TrendingUp className="h-4 w-4" />
  };
  
  // Additional features with icons
  const additionalFeatures = [
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
  
  return (
    <div className="pricing-table">
      {/* Title */}
      <h2 className="text-center text-xl font-bold mb-6 text-[#1E293B]">
        Visionify License Pricing
      </h2>
      
      {/* Pricing Table */}
      <div className="mb-6">
        <table className="modern-table">
          <thead>
            <tr>
              <th className="w-1/5">Package</th>
              <th className="w-1/5">Camera Tier</th>
              <th className="w-1/5">Starter</th>
              <th className="w-1/5 popular-column">Core Package</th>
              <th className="w-1/5">Everything Package</th>
            </tr>
          </thead>
          <tbody>
            {/* Monthly Subscription */}
            <tr className="pricing-row">
              <td className="py-3 px-4" rowSpan={3}>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                  <div>
                    <div className="font-medium">Monthly Subscription</div>
                    <div className="text-xs text-gray-500">Billed Monthly</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-center">1-20 Cams</td>
              <td className="py-3 px-4 text-center">
                {displayPrice(pricingData.pricing.monthly.single.upTo20Cameras)}
              </td>
              <td className="py-3 px-4 text-center popular-column">
                {displayPrice(pricingData.pricing.monthly.core.upTo20Cameras)}
              </td>
              <td className="py-3 px-4 text-center">
                {displayPrice(pricingData.pricing.monthly.everything.upTo20Cameras)}
              </td>
            </tr>
            <tr className="pricing-row">
              <td className="py-3 px-4 text-center">21-99 Cams</td>
              <td className="py-3 px-4 text-center">
                {displayPrice(pricingData.pricing.monthly.single.upTo100Cameras)}
              </td>
              <td className="py-3 px-4 text-center popular-column">
                {displayPrice(pricingData.pricing.monthly.core.upTo100Cameras)}
              </td>
              <td className="py-3 px-4 text-center">
                {displayPrice(pricingData.pricing.monthly.everything.upTo100Cameras)}
              </td>
            </tr>
            <tr className="pricing-row">
              <td className="py-3 px-4 text-center">100+ Cams</td>
              <td className="py-3 px-4 text-center">
                {displayPrice(pricingData.pricing.monthly.single.over100Cameras)}
              </td>
              <td className="py-3 px-4 text-center popular-column">
                {displayPrice(pricingData.pricing.monthly.core.over100Cameras)}
              </td>
              <td className="py-3 px-4 text-center">
                {displayPrice(pricingData.pricing.monthly.everything.over100Cameras)}
              </td>
            </tr>
            
            {/* 1 Year Agreement */}
            <tr className="pricing-row">
              <td className="py-3 px-4" rowSpan={3}>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-blue-500 mr-2" />
                  <div>
                    <div className="font-medium">1 Year Agreement</div>
                    <div className="text-xs text-gray-500">17% off over monthly</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-center">1-20 Cams</td>
              <td className="py-3 px-4 text-center">
                {displayPrice(pricingData.pricing.yearly.single.upTo20Cameras)}
              </td>
              <td className="py-3 px-4 text-center popular-column">
                {displayPrice(pricingData.pricing.yearly.core.upTo20Cameras)}
              </td>
              <td className="py-3 px-4 text-center">
                {displayPrice(pricingData.pricing.yearly.everything.upTo20Cameras)}
              </td>
            </tr>
            <tr className="pricing-row">
              <td className="py-3 px-4 text-center">21-99 Cams</td>
              <td className="py-3 px-4 text-center">
                {displayPrice(pricingData.pricing.yearly.single.upTo100Cameras)}
              </td>
              <td className="py-3 px-4 text-center popular-column">
                {displayPrice(pricingData.pricing.yearly.core.upTo100Cameras)}
              </td>
              <td className="py-3 px-4 text-center">
                {displayPrice(pricingData.pricing.yearly.everything.upTo100Cameras)}
              </td>
            </tr>
            <tr className="pricing-row">
              <td className="py-3 px-4 text-center">100+ Cams</td>
              <td className="py-3 px-4 text-center">
                {displayPrice(pricingData.pricing.yearly.single.over100Cameras)}
              </td>
              <td className="py-3 px-4 text-center popular-column">
                {displayPrice(pricingData.pricing.yearly.core.over100Cameras)}
              </td>
              <td className="py-3 px-4 text-center">
                {displayPrice(pricingData.pricing.yearly.everything.over100Cameras)}
              </td>
            </tr>
            
            {/* Cloud Costs */}
            <tr className="pricing-row">
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <Cloud className="h-4 w-4 text-blue-500 mr-2" />
                  <div>
                    <div className="font-medium">Cloud Costs</div>
                    <div className="text-xs text-gray-500">(Visionify Cloud, per camera/month)</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-center"></td>
              <td colSpan={3} className="py-3 px-4">
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="font-medium">{displayPrice(pricingData.additionalCosts.infrastructure.costPerCamera)}</div>
                    <div className="text-xs text-gray-500">per camera/month</div>
                    <div className="text-xs text-gray-500">not required for Customer Cloud</div>
                  </div>
                </div>
              </td>
            </tr>
            <tr className="pricing-row">
              <td className="py-3 px-4" rowSpan={2}>
                <div className="flex items-center">
                  <Database className="h-4 w-4 text-blue-500 mr-2" />
                  <div>
                    <div className="font-medium">One-time Costs</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-right">Edge Server (per device):</td>
              <td colSpan={3} className="py-3 px-4">
                <div className="flex justify-center">
                  <div className="text-center font-medium">
                    {displayPrice(pricingData.additionalCosts.edgeServer.cost)}
                  </div>
                </div>
              </td>
            </tr>
            <tr className="pricing-row">
              <td className="py-3 px-4 text-right">Implementation Costs (per site):</td>
              <td colSpan={3} className="py-3 px-4">
                <div className="flex justify-center">
                  <div className="text-center font-medium">
                    {displayPrice(pricingData.additionalCosts.implementation.cost)}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Package Features - Simplified Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden package-card">
          <div className="bg-gray-100 py-2 px-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-center text-gray-700">Starter (Choose 1)</h3>
          </div>
          <div className="p-3">
            <div className="flex flex-col gap-y-1.5">
              {allScenarios.map((scenario, index) => (
                <div key={index} className="flex items-start">
                  <Check className={`h-3 w-3 mr-1.5 mt-0.5 ${index === 0 ? 'text-blue-500' : 'text-gray-300'}`} />
                  <span className={`text-xs ${index === 0 ? 'text-gray-700' : 'text-gray-400'}`}>{scenario}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-blue-200 overflow-hidden package-card">
          <div className="bg-blue-50 py-2 px-4 border-b border-blue-200">
            <h3 className="text-sm font-semibold text-center text-blue-700">Core Package (Choose 3)</h3>
          </div>
          <div className="p-3">
            <div className="flex flex-col gap-y-1.5">
              {allScenarios.map((scenario, index) => (
                <div key={index} className="flex items-start">
                  <Check className={`h-3 w-3 mr-1.5 mt-0.5 ${index < 3 ? 'text-blue-500' : 'text-gray-300'}`} />
                  <span className={`text-xs ${index < 3 ? 'text-gray-700' : 'text-gray-400'}`}>{scenario}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden package-card">
          <div className="bg-gray-100 py-2 px-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-center text-gray-700">Everything Package</h3>
          </div>
          <div className="p-3">
            <div className="flex flex-col gap-y-1.5">
              {allScenarios.map((scenario, index) => (
                <div key={index} className="flex items-start">
                  <Check className="h-3 w-3 mr-1.5 mt-0.5 text-blue-500" />
                  <span className="text-xs text-gray-700">{scenario}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Standard Features - Simplified */}
      <div className="mb-6">
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(featureIcons).map(([feature, FeatureIcon], index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 text-center feature-card">
              <div className="text-blue-500 mb-2 flex justify-center">
                {FeatureIcon}
              </div>
              <span className="text-xs text-gray-700">{feature}</span>
            </div>
          ))}
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
      
      {/* Footer - Simplified */}
      <div className="text-center pt-4 pb-8 footer-section">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-gray-700 mb-2">
            For more information or a custom quote, please contact our sales team at {pricingData.companyInfo.phone} or {pricingData.companyInfo.email}
          </p>
          <p className="text-xs text-gray-500">
            Effective Date: {today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | 
            Pricing valid for 30 days until {expirationDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}