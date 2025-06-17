import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QuoteGeneratorV2 from '@/components/QuoteGeneratorV2';

export default function QuoteGenerator() {
  const [quoteDetails, setQuoteDetails] = useState<any>(null);
  
  const handleQuoteGenerated = (details: any) => {
    setQuoteDetails(details);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Quote Generator</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Generate Quote</CardTitle>
          <CardDescription>
            Create professional quotes for your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuoteGeneratorV2 
            onQuoteGenerated={handleQuoteGenerated} 
          />
        </CardContent>
      </Card>
    </div>
  );
} 