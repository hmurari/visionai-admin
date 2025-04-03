import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { pricingDataV2 } from '@/data/pricing_v2';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import QuotePreviewV2 from './QuotePreviewV2';
import { CustomerForm } from "@/components/CustomerForm";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

// Import the new shared components
import { ClientInformation } from '@/components/quote/ClientInformation';
import { PackageSelection } from '@/components/quote/PackageSelection';
import { DiscountSection } from '@/components/quote/DiscountSection';
import { CurrencyOptions } from '@/components/quote/CurrencyOptions';

interface QuoteGeneratorV2Props {
  onQuoteGenerated?: (quoteDetails: any) => void;
}

const QuoteGeneratorV2 = ({ onQuoteGenerated }: QuoteGeneratorV2Props) => {
  const { toast } = useToast();
  
  // Client information
  const [clientInfo, setClientInfo] = useState({
    name: '',
    company: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  // Package configuration
  const [subscriptionType, setSubscriptionType] = useState('yearly');
  const [totalCameras, setTotalCameras] = useState(5); // Start with 5 cameras
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>(
    pricingDataV2.scenarios.slice(0, 3)
  );
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [quoteDetails, setQuoteDetails] = useState<any>(null);
  
  // Currency options
  const [showSecondCurrency, setShowSecondCurrency] = useState(false);
  const [secondaryCurrency, setSecondaryCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState(83.5); // USD to INR
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Customer form
  const [customerFormOpen, setCustomerFormOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Save quote mutation
  const saveQuote = useMutation(api.quotes.saveQuote);

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
  
  // Handle new customer creation success
  const handleCustomerCreated = (customer: any) => {
    setCustomerFormOpen(false);
    handleCustomerSelect(customer);
    toast({
      title: "Customer created",
      description: `${customer.companyName} was successfully created.`,
    });
  };

  // Handle scenario selection
  const handleScenarioChange = (scenario: string) => {
    if (selectedScenarios.includes(scenario)) {
      // Remove scenario if already selected
      setSelectedScenarios(selectedScenarios.filter(s => s !== scenario));
    } else {
      // Add scenario if not already selected
      if (selectedScenarios.length < 3) {
        setSelectedScenarios([...selectedScenarios, scenario]);
      } else {
        // Use toast.error instead of toast.info
        toast({
          title: "Maximum scenarios reached",
          description: "You can select up to 3 scenarios. Remove one to add another.",
          variant: "destructive"
        });
      }
    }
  };

  // Calculate pricing with updated logic
  const calculatePricing = () => {
    const starterPackage = pricingDataV2.packages.find(p => p.id === 'starter')!;
    const baseCost = starterPackage.baseCost;
    const includedCameras = starterPackage.includedCameras;
    const additionalCameras = Math.max(0, totalCameras - includedCameras);
    
    // Get additional camera cost based on subscription type
    const additionalCameraCost = pricingDataV2.additionalCameraCost[subscriptionType as keyof typeof pricingDataV2.additionalCameraCost];
    
    // Calculate monthly recurring cost for additional cameras
    const additionalCamerasMonthlyRecurring = additionalCameras * additionalCameraCost;
    
    // Calculate total monthly recurring (base package + additional cameras)
    const monthlyRecurring = baseCost / 12 + additionalCamerasMonthlyRecurring;
    
    // Calculate annual recurring based on subscription type
    let contractLength = 0;
    if (subscriptionType === 'monthly') {
      contractLength = 1;
    } else if (subscriptionType === 'yearly') {
      contractLength = 12;
    } else if (subscriptionType === 'threeYear') {
      contractLength = 36;
    }
    
    // Calculate annual recurring cost
    const annualRecurring = monthlyRecurring * 12;
    
    // Apply discount if any
    const discountedAnnualRecurring = annualRecurring * (1 - discountPercentage / 100);
    const discountAmount = annualRecurring - discountedAnnualRecurring;
    
    // Total contract value (no separate one-time costs)
    const totalContractValue = discountedAnnualRecurring * (contractLength / 12);
    
    return {
      baseCost,
      totalCameras,
      additionalCameras,
      additionalCameraCost,
      monthlyRecurring,
      annualRecurring,
      discountedAnnualRecurring,
      discountAmount,
      contractLength,
      totalContractValue,
      selectedScenarios
    };
  };

  // Generate quote
  const handleGenerateQuote = () => {
    const pricing = calculatePricing();
    
    // Create quote details object
    const quoteDetails = {
      clientInfo: {
        ...clientInfo,
        // Add the customer ID if a customer was selected
        customerId: selectedCustomer?._id || null
      },
      subscriptionType,
      totalCameras,
      selectedScenarios,
      discountPercentage,
      date: new Date().toISOString(),
      ...pricing,
      showSecondCurrency,
      secondaryCurrency,
      exchangeRate,
      lastUpdated: lastUpdated?.toISOString() || null
    };
    
    // Set the quote details for preview
    setQuoteDetails(quoteDetails);
    
    // Pass quote details to parent component if callback provided
    if (onQuoteGenerated) {
      onQuoteGenerated(quoteDetails);
    }
  };
  
  // Save quote
  const handleSaveQuote = async () => {
    if (!quoteDetails) return;
    
    try {
      // Prepare the quote data for saving
      const quoteData = {
        customerName: quoteDetails.clientInfo.name,
        companyName: quoteDetails.clientInfo.company,
        email: quoteDetails.clientInfo.email,
        address: quoteDetails.clientInfo.address,
        city: quoteDetails.clientInfo.city,
        state: quoteDetails.clientInfo.state,
        zip: quoteDetails.clientInfo.zip,
        customerId: quoteDetails.clientInfo.customerId,
        packageName: "Starter Package",
        cameraCount: quoteDetails.totalCameras,
        subscriptionType: quoteDetails.subscriptionType,
        deploymentType: "visionify", // Default to Visionify Cloud
        totalAmount: quoteDetails.discountedAnnualRecurring,
        quoteData: quoteDetails,
      };
      
      // Save the quote
      const savedQuote = await saveQuote(quoteData);
      
      // Show success message
      toast({
        title: "Quote saved successfully",
        description: "The quote has been saved to your account.",
      });
      
      // Call the onSave callback if provided
      if (onQuoteGenerated) {
        onQuoteGenerated(savedQuote);
      }
    } catch (error) {
      console.error("Error saving quote:", error);
      toast({
        title: "Error saving quote",
        description: "There was an error saving your quote. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Check if client info is complete
  const isClientInfoComplete = () => {
    return clientInfo.name && clientInfo.company && clientInfo.email;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left side: Configuration */}
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
              
              {/* Package Selection - Updated to use totalCameras */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Package Selection</h3>
                
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
                      {pricingDataV2.subscriptionTypes.map((type: any) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name} ({type.description})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="font-medium">Total Cameras</Label>
                    <span className="text-lg font-semibold">{totalCameras}</span>
                  </div>
                  
                  {/* Update the preset buttons for common camera counts */}
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {[5, 10, 20, 40, 100].map(value => (
                      <Button
                        key={value}
                        type="button"
                        variant={totalCameras === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTotalCameras(value)}
                        className="py-1 px-2 h-auto"
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                  
                  <Slider
                    value={[totalCameras]}
                    min={5}
                    max={100}
                    step={1}
                    onValueChange={(value) => setTotalCameras(value[0])}
                    className="mt-2"
                  />
                  
                  <p className="text-sm text-gray-500">
                    Base package: 5 cameras. Additional cameras: {Math.max(0, totalCameras - 5)}
                  </p>
                </div>
              </div>
              
              {/* Scenario Selection */}
              <div className="space-y-2">
                <Label className="font-medium">Select 3 Scenarios</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {pricingDataV2.scenarios.map((scenario) => (
                    <div key={scenario} className="flex items-center space-x-2">
                      <Checkbox
                        id={`scenario-${scenario}`}
                        checked={selectedScenarios.includes(scenario)}
                        onCheckedChange={() => handleScenarioChange(scenario)}
                      />
                      <Label
                        htmlFor={`scenario-${scenario}`}
                        className="text-sm cursor-pointer"
                      >
                        {scenario}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Discount Section */}
              <DiscountSection
                discountPercentage={discountPercentage}
                onDiscountChange={setDiscountPercentage}
                maxDiscount={30}
              />
              
              {/* Currency Options */}
              <CurrencyOptions
                showSecondCurrency={showSecondCurrency}
                onShowSecondCurrencyChange={setShowSecondCurrency}
                selectedCurrency={secondaryCurrency}
                onCurrencyChange={setSecondaryCurrency}
                exchangeRate={exchangeRate}
                onExchangeRateChange={setExchangeRate}
                lastUpdated={lastUpdated}
                onLastUpdatedChange={setLastUpdated}
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
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Right side: Quote Preview */}
      <div className="lg:col-span-8">
        {quoteDetails ? (
          <QuotePreviewV2 
            quoteDetails={quoteDetails} 
            branding={pricingDataV2.branding}
            onSave={handleSaveQuote}
          />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
              <h3 className="text-xl font-semibold mb-2">Quote Preview</h3>
              <p className="text-gray-500 mb-4">
                Configure your quote parameters on the left and click "Generate Quote" to see a preview here.
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

export default QuoteGeneratorV2; 