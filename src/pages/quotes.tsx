import { useState, useRef, useEffect } from 'react';
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
import PricingCalculator from '@/components/PricingCalculator';
import QuotePreview from '@/components/QuotePreview';
import { generatePDF } from '@/utils/pdfUtils';

export default function Quotes() {
    const { isSignedIn, user } = useUser();
    const [primaryCurrency, setPrimaryCurrency] = useState('USD');
    const [showSecondCurrency, setShowSecondCurrency] = useState(false);
    const [activeTab, setActiveTab] = useState('pricing');
    const pricingTableRef = useRef<HTMLDivElement>(null);
    const [quoteDetails, setQuoteDetails] = useState<any>(null);
    
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
  
    // Update the exportToPDF function to handle both pricing table and quote preview
    const exportToPDF = async () => {
      // For pricing table tab
      if (activeTab === 'pricing' && pricingTableRef.current) {
        try {
          // Add a class for styling during capture
          pricingTableRef.current.classList.add('printing');
          
          // Capture the table as an image with optimized settings
          const canvas = await html2canvas(pricingTableRef.current, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 1200,
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
            format: 'a4',
            compress: true
          });
          
          // A4 dimensions: 210 x 297 mm
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          // Calculate margins
          const margin = 10;
          
          // Calculate image width and height to fit the page with margins
          const imgWidth = pdfWidth - (margin * 2);
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add the image to the PDF
          pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
          
          // Set PDF properties for better optimization
          pdf.setProperties({
            title: 'Visionify Pricing',
            subject: 'Visionify Pricing Information',
            creator: 'Visionify Inc.',
            author: 'info@visionify.ai'
          });
          
          // Save the PDF with optimized settings
          pdf.save(`Visionify_Pricing_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
          console.error('Error generating pricing table PDF:', error);
          alert('There was an error generating the PDF. Please try again.');
        }
      }
      
      // For quote generator tab
      if (activeTab === 'generator' && quoteDetails) {
        try {
          const quoteElement = document.querySelector('.quote-preview-container');
          if (!quoteElement) return;
          
          await generatePDF(
            quoteElement as HTMLElement,
            {
              filename: `Visionify_Quote_${quoteDetails.clientInfo.company}_${new Date().toISOString().split('T')[0]}`,
              title: `Visionify Quote - ${quoteDetails.clientInfo.company}`,
              subject: 'Safety Analytics Quote',
              author: 'Visionify Inc.',
              keywords: 'quote, safety analytics, visionify',
              creator: 'Visionify Quote Generator'
            }
          );
        } catch (error) {
          console.error('Error generating quote PDF:', error);
          alert('There was an error generating the PDF. Please try again.');
        }
      }
    };
  
    // Handle quote generation
    const handleQuoteGenerated = (details: any) => {
      setQuoteDetails(details);
    };
  
    // Get branding info for quote preview
    const branding = {
      companyName: "Visionify",
      logo: "/logo-color.png",
      primaryColor: "#3B82F6",
      secondaryColor: "#ffffff",
      fontFamily: "'Inter', sans-serif"
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left side: Quote Calculator - now narrower */}
                <div className="lg:col-span-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quote Generator</CardTitle>
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
                </div>
                
                {/* Right side: Quote Preview - now wider */}
                <div className="lg:col-span-8">
                  {quoteDetails ? (
                    <QuotePreview 
                      quoteDetails={quoteDetails} 
                      branding={branding}
                      pricingData={pricingData}
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
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
}