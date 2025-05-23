import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PalletPricingCalculator from '@/components/PalletPricingCalculator';
import PalletQuotePreview from '@/components/PalletQuotePreview';
import { palletPricingData } from '@/data/pallet-pricing';

export default function PalletQuoteGenerator() {
  const [quoteDetails, setQuoteDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('calculator');
  
  const handleQuoteGenerated = (details: any) => {
    setQuoteDetails(details);
    setActiveTab('preview');
  };
  
  const branding = palletPricingData.branding || {
    companyName: "Visionify",
    logo: "/logo-color.png",
    primaryColor: "#1976d2",
    secondaryColor: "#ffffff",
    fontFamily: "'Inter', sans-serif"
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Quote Generator (Pallet)</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="preview" disabled={!quoteDetails}>Quote Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle>Pallet Productivity Analytics Calculator</CardTitle>
              <CardDescription>
                Configure your pallet industry quote parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PalletPricingCalculator 
                pricingData={palletPricingData} 
                onQuoteGenerated={handleQuoteGenerated} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview">
          {quoteDetails && (
            <PalletQuotePreview 
              quoteDetails={quoteDetails} 
              branding={branding}
              pricingData={palletPricingData}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 