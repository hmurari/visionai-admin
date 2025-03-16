import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import StaticPricingTable from '@/components/StaticPricingTable';
import { pricingData } from '@/data/pricing';
import { currencyOptions } from '@/utils/currencyUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function Quotes() {
  const { isSignedIn, user } = useUser();
  const [primaryCurrency, setPrimaryCurrency] = useState('USD');
  const [showSecondCurrency, setShowSecondCurrency] = useState(false);
  const [activeTab, setActiveTab] = useState('pricing');
  const pricingTableRef = useRef<HTMLDivElement>(null);
  
  // Redirect if not signed in
  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }
  
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

  // Export to PDF function using image capture
  const exportToPDF = async () => {
    if (!pricingTableRef.current) return;
    
    try {
      // Add a class for styling during capture
      pricingTableRef.current.classList.add('printing');
      
      // Capture the table as an image
      const canvas = await html2canvas(pricingTableRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200, // Set a fixed width for consistent rendering
        onclone: (document, element) => {
          // Ensure footer text doesn't wrap in the cloned element
          const footerElements = element.querySelectorAll('.footer-section p');
          footerElements.forEach(el => {
            (el as HTMLElement).style.whiteSpace = 'normal';
            (el as HTMLElement).style.width = '100%';
            (el as HTMLElement).style.marginBottom = '10px';
          });
          
          // Add extra padding at the bottom to ensure footer is fully visible
          const footerSection = element.querySelector('.footer-section');
          if (footerSection) {
            (footerSection as HTMLElement).style.paddingBottom = '60px';
          }
          
          // Ensure the popular card is properly styled
          const popularCard = element.querySelector('.popular-card');
          if (popularCard) {
            (popularCard as HTMLElement).style.border = '2px solid #3B82F6';
          }
        }
      });
      
      // Remove the class after capture
      pricingTableRef.current.classList.remove('printing');
      
      // Calculate dimensions to fit on A4 page
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // A4 dimensions: 210 x 297 mm
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate the image dimensions to fit the page with margins
      const margin = 10; // 10mm margin
      const imgWidth = pdfWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`Visionify_Pricing_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quotes</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
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
                        <SelectValue placeholder="Select currency">
                          {currencyOptions.find(c => c.value === primaryCurrency)?.label || 'US Dollar ($)'}
                        </SelectValue>
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
                
                <div ref={pricingTableRef} className="pricing-table-container">
                  <StaticPricingTable 
                    pricingData={pricingData}
                    showSecondCurrency={showSecondCurrency}
                    primaryCurrency={primaryCurrency}
                    exchangeRate={getExchangeRate(primaryCurrency)}
                    currencySymbol={getCurrencySymbol(primaryCurrency)}
                    showThreeYear={false}
                  />
                </div>
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
    </div>
  );
} 