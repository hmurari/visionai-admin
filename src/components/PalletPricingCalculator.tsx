import { useState, useEffect, useRef } from 'react';
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
  Separator 
} from '@/components/ui/separator';
import { 
  Server 
} from 'lucide-react';
import { CustomerForm } from "@/components/CustomerForm";
import { useToast } from "@/components/ui/use-toast";
import { ClientInformation } from '@/components/quote/ClientInformation';
import { CurrencyOptions } from '@/components/quote/CurrencyOptions';
import { DiscountSection } from '@/components/quote/DiscountSection';
import { fetchExchangeRates } from '@/utils/currencyUtils';
import PalletQuotePreview from '@/components/PalletQuotePreview';

interface ClientInfo {
  name: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
}

interface PalletPricingCalculatorProps {
  pricingData: any;
  onQuoteGenerated: (quoteDetails: any) => void;
}

const PalletPricingCalculator = ({ pricingData, onQuoteGenerated }: PalletPricingCalculatorProps) => {
  const { toast } = useToast();
  
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
  const [cameras, setCameras] = useState(8); // Minimum 8 cameras
  const [subscriptionType, setSubscriptionType] = useState('yearly');
  
  // Edge servers - same as safety quotes
  const [serverCount, setServerCount] = useState(1);
  const [includeEdgeServer, setIncludeEdgeServer] = useState(true);
  
  // Discount
  const [discountPercentage, setDiscountPercentage] = useState(0);
  
  // Currency options - same as safety quotes
  const [showSecondCurrency, setShowSecondCurrency] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState(83.12);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  
  // Customer form
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // Quote details for preview
  const [quoteDetails, setQuoteDetails] = useState<any>(null);
  
  // Handle client info changes
  const handleClientInfoChange = (field: string, value: string) => {
    setClientInfo({
      ...clientInfo,
      [field]: value
    });
  };
  
  // Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    // Pre-fill the form with customer data
    setClientInfo({
      name: customer.name,
      company: customer.companyName,
      email: customer.email,
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      zip: customer.zip || "",
    });
  };
  
  // Handle new customer creation
  const handleCustomerCreated = (customer: any) => {
    setCustomerFormOpen(false);
    handleCustomerSelect(customer);
    toast({
      title: "Customer Created",
      description: `${customer.companyName} was successfully created.`,
    });
  };
  
  // Fetch exchange rates - same as safety quotes
  const handleFetchRates = async () => {
    setIsLoadingRates(true);
    try {
      const { rates, lastUpdated, error } = await fetchExchangeRates();
      if (rates && !error) {
        setExchangeRate(rates[selectedCurrency] || 83.12);
        setLastUpdated(lastUpdated);
      } else if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      toast({
        title: "Error",
        description: "Failed to fetch exchange rates",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRates(false);
    }
  };
  
  // Fetch exchange rates when currency changes
  useEffect(() => {
    if (showSecondCurrency && selectedCurrency) {
      handleFetchRates();
    }
  }, [showSecondCurrency, selectedCurrency]);
  
  // Calculate required edge servers based on camera count
  const recommendedServerCount = Math.max(1, Math.ceil(cameras / pricingData.camerasPerEdgeServer));
  
  // Handle server count change - same as safety quotes
  const handleServerCountChange = (value: number) => {
    setServerCount(Math.max(0, value));
  };
  
  const handleCameraChange = (value: number[]) => {
    const newCameraCount = Math.max(pricingData.minCameras, value[0]);
    setCameras(newCameraCount);
  };
  
  const calculatePricing = () => {
    const pricing = pricingData.pricing[subscriptionType === 'pilot' ? 'monthly' : subscriptionType].core;
    
    let subscriptionCost = 0;
    
    // Calculate tiered pricing
    if (cameras <= 8) {
      subscriptionCost = cameras * pricing.upTo8Cameras;
    } else if (cameras <= 16) {
      // First 8 cameras at upTo8Cameras rate, remaining at upTo16Cameras rate
      subscriptionCost = (8 * pricing.upTo8Cameras) + ((cameras - 8) * pricing.upTo16Cameras);
    } else {
      // First 8 at upTo8Cameras, next 8 at upTo16Cameras, remaining at over16Cameras
      subscriptionCost = (8 * pricing.upTo8Cameras) + (8 * pricing.upTo16Cameras) + ((cameras - 16) * pricing.over16Cameras);
    }
    
    // Apply subscription type multiplier
    if (subscriptionType === 'yearly') {
      subscriptionCost = subscriptionCost * 12; // Annual pricing
    } else if (subscriptionType === 'pilot') {
      subscriptionCost = subscriptionCost * 3; // 3-month pilot
    }
    // Monthly stays as is
    
    const edgeServerCost = includeEdgeServer ? serverCount * pricingData.additionalCosts.edgeServer.cost : 0;
    
    const subtotal = subscriptionCost + edgeServerCost;
    const discountAmount = (subtotal * discountPercentage) / 100;
    const total = subtotal - discountAmount;
    
    return {
      subscriptionCost,
      edgeServerCost,
      subtotal,
      discountAmount,
      total,
      totalInSecondCurrency: showSecondCurrency ? total * exchangeRate : 0
    };
  };
  
  const handleGenerateQuote = () => {
    if (!isClientInfoComplete()) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all client information fields.",
        variant: "destructive",
      });
      return;
    }
    
    const pricing = calculatePricing();
    const quoteDetailsData = {
      clientInfo,
      packageType: 'core',
      cameras,
      subscriptionType,
      deploymentType: 'visionify',
      includeEdgeServer,
      edgeServerCount: serverCount,
      discountPercentage,
      pricing,
      showSecondCurrency,
      selectedCurrency,
      exchangeRate,
      productType: 'pallet'
    };
    
    setQuoteDetails(quoteDetailsData);
    onQuoteGenerated(quoteDetailsData);
  };
  
  const isClientInfoComplete = () => {
    return clientInfo.name && clientInfo.company && clientInfo.email;
  };
  
  const pricing = calculatePricing();
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left side: Configuration (1/3) */}
      <div className="lg:col-span-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Client Information */}
              <ClientInformation
                clientInfo={clientInfo}
                onClientInfoChange={handleClientInfoChange}
                selectedCustomer={selectedCustomer}
                onCustomerSelect={handleCustomerSelect}
                onCreateCustomer={() => setCustomerFormOpen(true)}
              />

              <Separator className="my-4" />
              
              {/* Package Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Package Selection</h3>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <h4 className="font-medium text-blue-900">Core Package - Pallet Productivity Tracking</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Includes all pallet productivity tracking scenarios
                  </p>
                  <ul className="text-sm text-blue-600 mt-2 space-y-1">
                    {pricingData.selectedScenarios.map((scenario: string) => (
                      <li key={scenario}>• {scenario}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-medium">Number of Cameras</Label>
                    <span className="text-lg font-semibold">{cameras}</span>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {[8, 16, 32, 64, 100].map(value => (
                      <Button
                        key={value}
                        type="button"
                        variant={cameras === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCameras(value)}
                        className="py-1 px-2 h-auto"
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                  
                  <Slider
                    value={[cameras]}
                    onValueChange={handleCameraChange}
                    max={pricingData.maxCameras}
                    min={pricingData.minCameras}
                    step={1}
                    className="w-full"
                  />
                  
                  <div className="text-sm text-gray-500">
                    Minimum {pricingData.minCameras} cameras required
                  </div>
                </div>
                
                <div>
                  <Label className="font-medium">Subscription Type</Label>
                  <Select value={subscriptionType} onValueChange={setSubscriptionType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
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
              </div>

              <Separator className="my-4" />
              
              {/* Edge Servers - same as safety quotes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium flex items-center">
                      <Server className="h-4 w-4 mr-2 text-gray-500" />
                      Number of Edge Servers
                    </Label>
                    <p className="text-sm text-gray-500">
                      Recommended: {recommendedServerCount} server{recommendedServerCount > 1 ? 's' : ''} 
                      (1 server per {pricingData.camerasPerEdgeServer} cameras)
                    </p>
                  </div>
                  <span className="text-lg font-semibold">{serverCount}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    size="sm" 
                    onClick={() => handleServerCountChange(serverCount - 1)}
                    disabled={serverCount <= 0}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="0"
                    value={serverCount}
                    onChange={(e) => handleServerCountChange(parseInt(e.target.value) || 0)}
                    className="w-16 text-center"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleServerCountChange(serverCount + 1)}
                  >
                    +
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleServerCountChange(recommendedServerCount)}
                    className="ml-2"
                  >
                    Use Recommended
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={includeEdgeServer}
                    onCheckedChange={setIncludeEdgeServer}
                  />
                  <Label>Include Edge Servers in Quote</Label>
                </div>
                
                {serverCount === 0 && (
                  <div className="text-sm text-amber-600 mt-1">
                    <span className="font-medium">Note:</span> Customer will provide their own servers.
                  </div>
                )}
                
                {serverCount > 0 && includeEdgeServer && (
                  <div className="text-sm text-gray-700 mt-1">
                    One-time cost: ${(serverCount * pricingData.additionalCosts.edgeServer.cost).toLocaleString()} (${pricingData.additionalCosts.edgeServer.cost.toLocaleString()} per server)
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              {/* Discount Section */}
              <DiscountSection
                discountPercentage={discountPercentage}
                onDiscountChange={setDiscountPercentage}
                maxDiscount={50}
              />

              <Separator className="my-4" />

              {/* Currency Options - same as safety quotes */}
              <CurrencyOptions
                showSecondCurrency={showSecondCurrency}
                onShowSecondCurrencyChange={setShowSecondCurrency}
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
                exchangeRate={exchangeRate}
                onExchangeRateChange={setExchangeRate}
                lastUpdated={lastUpdated}
                onLastUpdatedChange={setLastUpdated}
                onFetchRates={handleFetchRates}
                isLoadingRates={isLoadingRates}
              />

              {/* Generate Quote Button */}
              <Button 
                onClick={handleGenerateQuote} 
                className="w-full mt-4" 
                size="lg"
                disabled={!isClientInfoComplete()}
              >
                {!isClientInfoComplete() ? 'Please Complete Customer Information' : 'Generate Quote'}
              </Button>
              
              {/* Pricing Summary */}
              <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-md">
                <h4 className="font-medium">Pricing Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subscription ({cameras} cameras):</span>
                    <span>
                      ${pricing.subscriptionCost.toLocaleString()}
                      {subscriptionType === 'monthly' ? '/month' : 
                       subscriptionType === 'pilot' ? ' for 3 months' : '/year'}
                    </span>
                  </div>
                  {includeEdgeServer && serverCount > 0 && (
                    <div className="flex justify-between">
                      <span>Edge Servers ({serverCount} × ${pricingData.additionalCosts.edgeServer.cost.toLocaleString()}):</span>
                      <span>${pricing.edgeServerCost.toLocaleString()} one-time</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${pricing.subtotal.toLocaleString()}</span>
                  </div>
                  {discountPercentage > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discountPercentage}%):</span>
                      <span>-${pricing.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${pricing.total.toLocaleString()}</span>
                  </div>
                  {showSecondCurrency && pricing.totalInSecondCurrency > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Total in {selectedCurrency}:</span>
                      <span>{selectedCurrency === 'INR' ? '₹' : '$'}{pricing.totalInSecondCurrency.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Right side: Quote Preview (2/3) */}
      <div className="lg:col-span-8">
        {quoteDetails ? (
          <PalletQuotePreview 
            quoteDetails={quoteDetails} 
            branding={pricingData.branding}
            pricingData={pricingData}
          />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
              <h3 className="text-xl font-semibold mb-2">Quote Preview</h3>
              <p className="text-gray-500 mb-4">
                Configure your pallet quote parameters on the left and click "Generate Quote" to see a preview here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Customer Form Dialog */}
      {customerFormOpen && (
        <CustomerForm
          isOpen={customerFormOpen}
          onClose={() => setCustomerFormOpen(false)}
          onSuccess={handleCustomerCreated}
        />
      )}
    </div>
  );
};

export default PalletPricingCalculator; 