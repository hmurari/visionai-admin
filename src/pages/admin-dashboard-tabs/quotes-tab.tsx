import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Printer, Share2 } from 'lucide-react';
import StaticPricingTable from '@/components/StaticPricingTable';
import { pricingData } from '@/data/pricing';
import { currencyOptions } from '@/utils/currencyUtils';

export function QuotesTab() {
  const [primaryCurrency, setPrimaryCurrency] = useState('USD');
  const [showSecondCurrency, setShowSecondCurrency] = useState(false);
  const [activeTab, setActiveTab] = useState('pricing');
  
  // Get currency symbol based on selected currency
  const getCurrencySymbol = (code: string) => {
    const currency = currencyOptions.find(c => c.value === code);
    return currency ? currency.symbol : '$';
  };
  
  // Get exchange rate based on selected currency
  const getExchangeRate = (code: string) => {
    const currency = currencyOptions.find(c => c.value === code);
    return currency ? currency.rate : 1;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Quotes</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pricing" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pricing">Pricing Table</TabsTrigger>
          <TabsTrigger value="generator">Quote Generator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Table</CardTitle>
              <CardDescription>
                View and customize the pricing table for Visionify products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Label htmlFor="currency-select">Currency</Label>
                  <Select 
                    value={primaryCurrency} 
                    onValueChange={setPrimaryCurrency}
                  >
                    <SelectTrigger id="currency-select">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="show-second-currency" 
                      checked={showSecondCurrency}
                      onCheckedChange={setShowSecondCurrency}
                    />
                    <Label htmlFor="show-second-currency">Show USD equivalent</Label>
                  </div>
                </div>
              </div>
              
              <StaticPricingTable 
                pricingData={pricingData}
                showSecondCurrency={showSecondCurrency}
                primaryCurrency={primaryCurrency}
                exchangeRate={getExchangeRate(primaryCurrency)}
                currencySymbol={getCurrencySymbol(primaryCurrency)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quote Generator</CardTitle>
              <CardDescription>
                Generate custom quotes for clients (Coming Soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Quote Generator Coming Soon</h3>
                  <p className="text-sm text-gray-500">
                    This feature is currently under development and will be available soon.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default QuotesTab; 