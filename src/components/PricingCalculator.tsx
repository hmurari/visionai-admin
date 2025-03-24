import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Slider 
} from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Button 
} from '@/components/ui/button';
import { 
  Switch 
} from '@/components/ui/switch';
import { 
  Label 
} from '@/components/ui/label';
import {
  Input
} from '@/components/ui/input';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { fetchExchangeRates as fetchRates } from '@/utils/currencyUtils';
import { currencyOptions } from '@/utils/currencyUtils';

// Replace ToggleGroup with a simple button group
const ButtonGroup = ({ value, onChange, options }: { 
  value: string, 
  onChange: (value: string) => void,
  options: { value: string, label: string }[]
}) => {
  return (
    <div className="flex w-full space-x-2">
      {options.map(option => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? "default" : "outline"}
          className="flex-1"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

// Replace Combobox with Select
const CurrencySelect = ({ value, onChange, options }: {
  value: string,
  onChange: (value: string) => void,
  options: { value: string, label: string }[]
}) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select currency">
          {options.find(o => o.value === value)?.label || 'Select currency'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

interface ClientInfo {
  name: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
}

interface CustomPricing {
  tier1Price: number;
  tier2Price: number;
  tier3Price: number;
  infrastructureCost: number;
}

interface PricingCalculatorProps {
  pricingData: any;
  onQuoteGenerated: (quoteDetails: any) => void;
}

const PricingCalculator = ({ pricingData, onQuoteGenerated }: PricingCalculatorProps) => {
  // Client information
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    email: ''
  });
  
  // Package selection
  const [selectedScenario, setSelectedScenario] = useState('everything');
  const [selectedSingleScenario, setSelectedSingleScenario] = useState('ppe');
  const [cameras, setCameras] = useState(20);
  const [subscriptionType, setSubscriptionType] = useState('yearly');
  const [deploymentType, setDeploymentType] = useState('visionify');
  
  // Additional options
  const [includeEdgeServer, setIncludeEdgeServer] = useState(false);
  const [edgeServerCost, setEdgeServerCost] = useState(3000);
  const [includeImplementation, setIncludeImplementation] = useState(true);
  const [implementationCost, setImplementationCost] = useState(10000);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  
  // Currency options
  const [showSecondCurrency, setShowSecondCurrency] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState(83.12);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [rateError, setRateError] = useState('');
  
  // Custom pricing
  const [useCustomPricing, setUseCustomPricing] = useState(false);
  const [customPricing, setCustomPricing] = useState<CustomPricing>({
    tier1Price: 50,
    tier2Price: 40,
    tier3Price: 35,
    infrastructureCost: 12
  });
  
  // Handle client info changes
  const handleClientInfoChange = (field: keyof ClientInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientInfo({
      ...clientInfo,
      [field]: e.target.value
    });
  };
  
  // Handle custom pricing changes
  const handleCustomPricingChange = (field: keyof CustomPricing) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setCustomPricing({
        ...customPricing,
        [field]: value
      });
    }
  };
  
  // Fetch exchange rates
  const handleFetchRates = async () => {
    setIsLoadingRates(true);
    setRateError('');
    
    try {
      const result = await fetchRates();
      
      if (result.error) {
        setRateError(result.error);
      } else {
        setExchangeRates(result.rates);
        setLastUpdated(result.lastUpdated);
        
        // Update the exchange rate for the selected currency
        if (result.rates[selectedCurrency]) {
          setExchangeRate(result.rates[selectedCurrency]);
        }
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      setRateError('Failed to fetch exchange rates');
    } finally {
      setIsLoadingRates(false);
    }
  };
  
  // Fetch rates on initial load if showing second currency
  useEffect(() => {
    if (showSecondCurrency) {
      handleFetchRates();
    }
  }, [showSecondCurrency]);
  
  // Get scenario name based on selection
  const getScenarioName = () => {
    if (selectedScenario === 'everything') {
      return 'Everything Package';
    } else if (selectedScenario === 'core') {
      return 'Core Package - 3 Scenarios';
    } else if (selectedScenario === 'ppe') {
      return 'PPE Compliance Only';
    } else if (selectedScenario === 'mobile') {
      return 'Mobile Phone Compliance Only';
    } else if (selectedScenario === 'staircase') {
      return 'Staircase Safety Only';
    } else if (selectedScenario === 'spills') {
      return 'Spills & Leaks Detection Only';
    } else {
      return 'Custom Package';
    }
  };
  
  // Calculate pricing based on selections
  const calculatePricing = () => {
    // Get base pricing from pricing data or custom pricing
    let basePricing;
    let infraCostPerCamera = 0;
    
    if (useCustomPricing) {
      basePricing = {
        upTo20Price: customPricing.tier1Price,
        additionalPrice: customPricing.tier2Price,
        volumeDiscountPrice: customPricing.tier3Price
      };
      infraCostPerCamera = customPricing.infrastructureCost;
    } else {
      // Get pricing based on subscription type and scenario
      const subscriptionPricing = pricingData.pricing[subscriptionType];
      
      // Determine which pricing tier to use based on scenario
      let scenarioPricing;
      if (selectedScenario === 'everything') {
        scenarioPricing = subscriptionPricing.everything;
      } else if (selectedScenario === 'core') {
        scenarioPricing = subscriptionPricing.core;
      } else {
        // For single scenario options
        scenarioPricing = subscriptionPricing.single;
      }
      
      basePricing = {
        upTo20Price: scenarioPricing.upTo20Cameras,
        additionalPrice: scenarioPricing.upTo100Cameras,
        volumeDiscountPrice: scenarioPricing.over100Cameras
      };
      
      infraCostPerCamera = subscriptionPricing.infrastructureCost;
    }
    
    // Calculate base price based on camera count and per-camera price
    const perCameraPerMonth = cameras <= 20 ? basePricing.upTo20Price :
      cameras <= 100 ? basePricing.additionalPrice : basePricing.volumeDiscountPrice;
    
    // Calculate annual base price
    const basePrice = perCameraPerMonth * cameras * 12;
    
    // Apply discount if any
    const discountedBasePrice = basePrice * (1 - discountPercentage / 100);
    const discountAmount = basePrice - discountedBasePrice;

    // Calculate infrastructure cost if using Visionify cloud
    const infrastructureCost = deploymentType === 'visionify' ? cameras * infraCostPerCamera * 12 : 0;

    // Calculate one-time costs
    const edgeServerTotal = includeEdgeServer ? edgeServerCost : 0;
    const implementationTotal = includeImplementation ? implementationCost : 0;
    const oneTimeCosts = edgeServerTotal + implementationTotal;

    // Calculate monthly and annual recurring costs
    const monthlyRecurring = (discountedBasePrice + infrastructureCost) / 12;
    const annualRecurring = discountedBasePrice + infrastructureCost;

    // Calculate contract length
    let contractLength = 0;
    if (subscriptionType === 'monthly') {
      contractLength = 1;
    } else if (subscriptionType === 'yearly') {
      contractLength = 12;
    } else if (subscriptionType === 'threeYear') {
      contractLength = 36;
    }

    return {
      basePrice,
      perCameraPerMonth,
      discountedBasePrice,
      discountAmount,
      infrastructureCost,
      infraCostPerCamera,
      edgeServerCost: edgeServerTotal,
      implementationCost: implementationTotal,
      oneTimeCosts,
      monthlyRecurring,
      annualRecurring,
      contractLength,
      totalContractValue: (annualRecurring * (contractLength / 12)) + oneTimeCosts
    };
  };
  
  // Generate quote
  const handleGenerateQuote = () => {
    const pricing = calculatePricing();
    const scenarioName = getScenarioName();
    
    // Create quote details object
    const quoteDetails = {
      clientInfo,
      cameras,
      subscriptionType,
      selectedScenario,
      scenarioName,
      deploymentType,
      includeEdgeServer,
      includeImplementation,
      discountPercentage,
      date: new Date().toISOString(),
      ...pricing,
      showSecondCurrency,
      secondaryCurrency: selectedCurrency,
      exchangeRate,
      lastUpdated
    };
    
    // Pass quote details to parent component
    onQuoteGenerated(quoteDetails);
  };
  
  return (
    <div className="space-y-4">
      {/* Client Information */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Client Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client-name">Client Name</Label>
                <Input
                  id="client-name"
                  value={clientInfo.name}
                  onChange={handleClientInfoChange('name')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={clientInfo.company}
                  onChange={handleClientInfoChange('company')}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={clientInfo.address}
                onChange={handleClientInfoChange('address')}
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={clientInfo.city}
                  onChange={handleClientInfoChange('city')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={clientInfo.state}
                  onChange={handleClientInfoChange('state')}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={clientInfo.zip}
                  onChange={handleClientInfoChange('zip')}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={clientInfo.email}
                onChange={handleClientInfoChange('email')}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Package Selection Section */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Package Selection</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="scenario-select" className="font-medium">Safety Scenario</Label>
              <Select 
                value={selectedScenario} 
                onValueChange={setSelectedScenario}
              >
                <SelectTrigger id="scenario-select" className="mt-1">
                  <SelectValue placeholder="Select scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everything">Everything Package</SelectItem>
                  <SelectItem value="core">Core Package - 3 Scenarios</SelectItem>
                  <SelectItem value="ppe">PPE Compliance Only</SelectItem>
                  <SelectItem value="mobile">Mobile Phone Compliance Only</SelectItem>
                  <SelectItem value="staircase">Staircase Safety Only</SelectItem>
                  <SelectItem value="spills">Spills & Leaks Detection Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="font-medium">Number of Cameras: {cameras}</Label>
              <Slider
                value={[cameras]}
                min={1}
                max={200}
                step={1}
                onValueChange={(values) => setCameras(values[0])}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>20</span>
                <span>50</span>
                <span>100</span>
                <span>200</span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="subscription-select" className="font-medium">Subscription Type</Label>
              <Select 
                value={subscriptionType} 
                onValueChange={setSubscriptionType}
              >
                <SelectTrigger id="subscription-select" className="mt-1">
                  <SelectValue placeholder="Select subscription" />
                </SelectTrigger>
                <SelectContent>
                  {pricingData.subscriptionTypes.map((type: any) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="font-medium">Deployment Type</Label>
              <ButtonGroup 
                value={deploymentType}
                onChange={setDeploymentType}
                options={[
                  { value: 'customer', label: 'Customer Cloud' },
                  { value: 'visionify', label: 'Visionify Cloud' }
                ]}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium">Additional Options</Label>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edge-server"
                    checked={includeEdgeServer}
                    onCheckedChange={setIncludeEdgeServer}
                  />
                  <Label htmlFor="edge-server">Include Edge Server</Label>
                </div>
                
                <div className="w-1/3">
                  <Input
                    type="number"
                    value={edgeServerCost}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setEdgeServerCost(value);
                      }
                    }}
                    disabled={!includeEdgeServer}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="implementation"
                    checked={includeImplementation}
                    onCheckedChange={setIncludeImplementation}
                  />
                  <Label htmlFor="implementation">Include Implementation</Label>
                </div>
                
                <div className="w-1/3">
                  <Input
                    type="number"
                    value={implementationCost}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setImplementationCost(value);
                      }
                    }}
                    disabled={!includeImplementation}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Additional Discount Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Additional Discount</h3>
            <div className="w-1/3">
              <Input
                type="number"
                value={discountPercentage}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (isNaN(value)) {
                    setDiscountPercentage(0);
                  } else if (value >= 0 && value <= 100) {
                    setDiscountPercentage(value);
                  }
                }}
                min={0}
                max={100}
                className="text-right"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Enter percentage discount to apply to the base price</p>
        </CardContent>
      </Card>
      
      {/* Currency Options Card */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Currency Options</h3>
          
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="show-second-currency"
              checked={showSecondCurrency}
              onCheckedChange={setShowSecondCurrency}
            />
            <Label htmlFor="show-second-currency">Include Secondary Currency</Label>
          </div>
          
          {showSecondCurrency && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <CurrencySelect
                    value={selectedCurrency}
                    onChange={(value) => {
                      setSelectedCurrency(value);
                      const rate = exchangeRates[value] || 
                        currencyOptions.find(c => c.value === value)?.rate || 1;
                      setExchangeRate(rate);
                    }}
                    options={currencyOptions}
                  />
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleFetchRates}
                  disabled={isLoadingRates}
                  className="whitespace-nowrap"
                >
                  {isLoadingRates ? 'Loading...' : 'Refresh Rates'}
                </Button>
              </div>
              
              <div className="flex justify-between text-sm">
                <p>
                  Exchange Rate: 1 USD = {exchangeRate.toFixed(2)} {selectedCurrency}
                </p>
                
                {lastUpdated && (
                  <p className="text-gray-500">
                    Last updated: {lastUpdated.toLocaleString()}
                  </p>
                )}
              </div>
              
              {rateError && (
                <p className="text-red-500 text-sm">{rateError}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Custom Pricing Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Custom Pricing Override</h3>
            <div className="flex items-center space-x-2">
              <Switch
                id="custom-pricing"
                checked={useCustomPricing}
                onCheckedChange={setUseCustomPricing}
              />
              <Label htmlFor="custom-pricing">Enable</Label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tier1-price">1-20 Cameras (per camera/month)</Label>
              <Input
                id="tier1-price"
                type="number"
                value={customPricing.tier1Price}
                onChange={handleCustomPricingChange('tier1Price')}
                disabled={!useCustomPricing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tier2-price">21-99 Cameras (per camera/month)</Label>
              <Input
                id="tier2-price"
                type="number"
                value={customPricing.tier2Price}
                onChange={handleCustomPricingChange('tier2Price')}
                disabled={!useCustomPricing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tier3-price">100+ Cameras (per camera/month)</Label>
              <Input
                id="tier3-price"
                type="number"
                value={customPricing.tier3Price}
                onChange={handleCustomPricingChange('tier3Price')}
                disabled={!useCustomPricing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="infra-cost">Infrastructure Cost (per camera/month)</Label>
              <Input
                id="infra-cost"
                type="number"
                value={customPricing.infrastructureCost}
                onChange={handleCustomPricingChange('infrastructureCost')}
                disabled={!useCustomPricing}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Generate Quote Button */}
      <Button 
        variant="default" 
        size="lg" 
        className="w-full py-6 mt-4 font-bold"
        onClick={handleGenerateQuote}
      >
        GENERATE QUOTE
      </Button>
    </div>
  );
};

export default PricingCalculator;