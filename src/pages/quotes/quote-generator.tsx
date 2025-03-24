import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PricingCalculator from '@/components/PricingCalculator';
import QuotePreview from '@/components/QuotePreview';
import { pricingData } from '@/data/pricing';

export default function QuoteGenerator() {
  const [quoteDetails, setQuoteDetails] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('calculator');
  
  const handleQuoteGenerated = (details: any) => {
    setQuoteDetails(details);
    setActiveTab('preview');
  };
  
  const branding = pricingData.branding || {
    companyName: "Visionify",
    logo: "/logo-color.png",
    primaryColor: "#1976d2",
    secondaryColor: "#ffffff",
    fontFamily: "'Inter', sans-serif"
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Quote Generator</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="preview" disabled={!quoteDetails}>Quote Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Calculator</CardTitle>
              <CardDescription>
                Configure your quote parameters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PricingCalculator 
                pricingData={pricingData} 
                onQuoteGenerated={handleQuoteGenerated} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview">
          {quoteDetails && (
            <QuotePreview 
              quoteDetails={quoteDetails} 
              branding={branding}
              pricingData={pricingData}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 