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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

// Import the new shared components
import { ClientInformation } from '@/components/quote/ClientInformation';
import { PackageSelection } from '@/components/quote/PackageSelection';
import { DiscountSection } from '@/components/quote/DiscountSection';
import { CurrencyOptions } from '@/components/quote/CurrencyOptions';
import { Separator } from '@/components/ui/separator';

interface QuoteGeneratorV2Props {
  onQuoteGenerated?: (quoteDetails: any) => void;
}

const QuoteGeneratorV2 = ({ onQuoteGenerated }: QuoteGeneratorV2Props) => {
  
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
    toast.success(`${customer.companyName} was successfully created.`);
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
        toast.error("You can select up to 3 scenarios. Remove one to add another.");
      }
    }
  };

  // Calculate pricing with updated logic
  const calculatePricing = () => {
    // Get base package details
    const basePackage = pricingDataV2.basePackage;
    const oneTimeBaseCost = 2000; // New one-time base cost
    const baseCost = basePackage.price;
    const includedCameras = basePackage.includedCameras;
    const additionalCameras = Math.max(0, totalCameras - includedCameras);
    
    // Determine if using core package or everything package
    const isEverythingPackage = selectedScenarios.length > 3;
    const pricingTiers = isEverythingPackage 
      ? pricingDataV2.additionalCameraPricing.everythingPackage 
      : pricingDataV2.additionalCameraPricing.corePackage;
    
    // Get subscription details
    const subscription = pricingDataV2.subscriptionTypes.find(
      sub => sub.id === subscriptionType
    ) || pricingDataV2.subscriptionTypes[0];

    // Initialize variables for camera cost calculations
    let additionalCameraCost = 0;
    let additionalCamerasMonthlyRecurring = 0;
    let monthlyRecurring = 0; // Start with 0 for monthly recurring (no base package monthly cost)
    
    // Calculate costs for all cameras (not just additional ones)
    let remainingCameras = totalCameras;
    
    // Tier 1: 1-20 cameras
    const tier1Max = 20;
    const tier1Cameras = Math.min(remainingCameras, tier1Max);
    const tier1Cost = tier1Cameras * pricingTiers[0].pricePerMonth;
    remainingCameras -= tier1Cameras;
    
    // Tier 2: 21-100 cameras
    const tier2Max = 80; // Up to 100 total (80 in this tier)
    const tier2Cameras = Math.min(remainingCameras, tier2Max);
    const tier2Cost = tier2Cameras * pricingTiers[1].pricePerMonth;
    remainingCameras -= tier2Cameras;
    
    // Tier 3: 101+ cameras
    const tier3Cameras = remainingCameras;
    const tier3Cost = tier3Cameras * pricingTiers[2].pricePerMonth;
    
    // Calculate total monthly cost for all cameras
    const totalCameraCost = tier1Cost + tier2Cost + tier3Cost;
    
    // Apply subscription discount to camera cost
    additionalCamerasMonthlyRecurring = totalCameraCost * (1 - (subscription.discount || 0));
    
    // Calculate average cost per camera for display
    additionalCameraCost = totalCameras > 0 
      ? additionalCamerasMonthlyRecurring / totalCameras 
      : 0;
    
    // Add camera costs to monthly recurring
    monthlyRecurring += additionalCamerasMonthlyRecurring;
    
    // Calculate annual and contract values
    const annualRecurring = monthlyRecurring * 12;
    
    // Apply discount to monthly or annual recurring based on subscription type
    // For monthly subscription, calculate discount on monthly amount
    // For yearly/3-year subscription, calculate discount on annual amount
    const discountAmount = subscriptionType === 'monthly' 
      ? monthlyRecurring * (discountPercentage / 100)  // Monthly discount amount
      : annualRecurring * (discountPercentage / 100);  // Annual discount amount
    
    const discountedMonthlyRecurring = monthlyRecurring * (1 - discountPercentage / 100);
    const discountedAnnualRecurring = annualRecurring * (1 - discountPercentage / 100);
    
    const contractLength = subscription.multiplier;
    const totalContractValue = subscriptionType === 'monthly'
      ? oneTimeBaseCost + discountedMonthlyRecurring
      : oneTimeBaseCost + (discountedAnnualRecurring * (contractLength / 12));
    
    return {
      baseCost,
      oneTimeBaseCost,
      totalCameras,
      additionalCameras,
      additionalCameraCost,
      additionalCamerasMonthlyRecurring,
      isEverythingPackage,
      monthlyRecurring,
      discountedMonthlyRecurring,
      annualRecurring,
      discountedAnnualRecurring,
      discountAmount,  // This will be monthly or annual based on subscription type
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
      lastUpdated: lastUpdated?.toISOString() || null,
      _timestamp: Date.now()
    };
    
    // First set to null to force a complete re-render
    setQuoteDetails(null);
    
    // Then set the new quote details in the next tick
    setTimeout(() => {
      setQuoteDetails(quoteDetails);
      
      // Pass quote details to parent component if callback provided
      if (onQuoteGenerated) {
        onQuoteGenerated(quoteDetails);
      }
    }, 0);
  };
  
  // Handle save quote
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
      toast.success("Quote saved successfully");
      
      // Call the onSave callback if provided
      if (onQuoteGenerated) {
        onQuoteGenerated(savedQuote);
      }
    } catch (error) {
      console.error("Error saving quote:", error);
      toast.error("There was an error saving your quote. Please try again.");
    }
  };
  
  // Check if client info is complete
  const isClientInfoComplete = () => {
    return clientInfo.name && clientInfo.company && clientInfo.email;
  };

  // Handle quote update from preview
  const handleQuoteUpdate = (updatedQuote: any) => {
    setQuoteDetails(updatedQuote);
    
    // Update the form state to match the updated quote
    setSubscriptionType(updatedQuote.subscriptionType);
    
    // You might want to update other state variables as well
    // depending on what can be changed in the preview
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

            <Separator className="my-4" />

              
              {/* Package Selection */}
              <PackageSelection
                selectedScenario=""
                onScenarioChange={() => {}}
                cameras={totalCameras - 5} // Subtract base package cameras
                onCameraChange={(value) => setTotalCameras(value + 5)} // Add base package cameras
                subscriptionType={subscriptionType}
                onSubscriptionChange={setSubscriptionType}
                minCameras={0}
                maxCameras={195} // 200 total - 5 base
                pricingData={pricingDataV2}
                version="v2"
                selectedScenarios={selectedScenarios}
                onScenariosChange={setSelectedScenarios}
                onPackageTypeChange={(isEverything) => {
                  // If switching to Everything Package, select all scenarios
                  if (isEverything && selectedScenarios.length <= 3) {
                    setSelectedScenarios([...pricingDataV2.scenarios]);
                  }
                  // No need to handle the reverse case as it's managed by scenario selection
                }}
              />
              
              <Separator className="my-4" />

              {/* Discount Section */}
              <DiscountSection
                discountPercentage={discountPercentage}
                onDiscountChange={setDiscountPercentage}
                maxDiscount={30}
              />

              <Separator className="my-4" />

              
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
            onQuoteUpdate={handleQuoteUpdate}
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