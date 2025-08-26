import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { OrderFormDetails, QuoteDetailsV2, KeyTerms } from '@/types/quote';
import { toast } from 'sonner';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import OrderFormPreview from './OrderFormPreview';
import { Separator } from '@/components/ui/separator';

interface OrderFormGeneratorProps {
  initialQuoteDetails?: QuoteDetailsV2;
  onOrderFormGenerated?: (orderFormDetails: OrderFormDetails) => void;
}

const DEFAULT_SUCCESS_CRITERIA = `- Onboard cameras and configure selected AI scenarios
- Performance: 90% accuracy, 10s latency, 99% uptime
- Webapp: New site for client, onboard up to 100 users
- Reporting: Daily, Weekly, Monthly Reports
- Alerts & Notifications: Email, MS Teams, WhatsApp, Mobile app
- On-prem integrations: Speakers, PLC, API`;

const DEFAULT_TERMS_CONDITIONS = `1. **Warranty.** AI Servers and Speakers are warranted for a period of three (3) years from delivery.
2. **Comprehensive** **Pricing.** The fees set forth herein are all-inclusive; no additional or hidden charges shall apply.
3. **Payment** **Terms.** Hardware fees shall be payable one hundred percent (100%) in advance. Subscription charges shall be payable in advance, subject to Net Thirty (30) days.
4. **Money-Back** **Guarantee.** Customer may, within sixty (60) days of delivery, request a full refund if the product is deemed unsuitable for its use case, provided that all AI Servers and Speakers are returned in good condition.
5. **OTA** **Upgrades.** Customer shall be entitled to over-the-air ("OTA") software and model upgrades during the term of any active subscription.
6. **Customer** **Single** **Point** **of** **Contact.** Customer shall designate a single point of contact ("SPOC") for the project, who shall be responsible for attending project meetings, conducting spills and leaks simulations, monitoring system performance, and providing timely feedback.
7. **Reasonable** **Access.** Customer shall provide reasonable access to premises, cameras, and internet connectivity as necessary for deployment.
8. **Delays.** Any delay attributable to Customer's failure to provide access or responsiveness shall extend the pilot timeline accordingly.`;

const OrderFormGenerator = ({ initialQuoteDetails, onOrderFormGenerated }: OrderFormGeneratorProps) => {
  
  // Order form state
  const [orderFormDetails, setOrderFormDetails] = useState<OrderFormDetails | null>(null);
  
  // Key terms state
  const [keyTerms, setKeyTerms] = useState<KeyTerms>({
    product: "Visionify Core Package",
    program: "1 year subscription",
    deployment: "Hybrid SaaS",
    initialTerm: "1 Year",
    startDate: "Sep 1, 2025",
    endDate: "Sep 1, 2026",
    licenses: "20 Cameras",
    renewal: "Auto-renews at the end of 1 year."
  });
  
  // Success criteria and terms
  const [successCriteria, setSuccessCriteria] = useState(DEFAULT_SUCCESS_CRITERIA);
  const [termsAndConditions, setTermsAndConditions] = useState(DEFAULT_TERMS_CONDITIONS);
  
  // Signature information
  const [visionifySignature, setVisionifySignature] = useState({
    company: 'Visionify Inc.',
    authorizedSignature: '',
    signeeName: '',
    signeeTitle: '',
    companyAddress: '1499, W 120th Ave, Ste 110\nWestminster, CO 80234',
    date: ''
  });
  
  const [customerSignature, setCustomerSignature] = useState({
    company: '',
    authorizedSignature: '',
    signeeName: '',
    signeeTitle: '',
    companyAddress: '',
    date: ''
  });
  
  // Order form number state
  const [orderFormNumber, setOrderFormNumber] = useState('1');

  // Initialize from quote details
  useEffect(() => {
    if (initialQuoteDetails) {
      // Pre-populate fields based on quote
      const packageName = initialQuoteDetails.isEverythingPackage ? "Everything Package" : "Core Package";
      const deployment = initialQuoteDetails.subscriptionType === 'monthly' ? 'Hybrid SaaS' : 
                        initialQuoteDetails.subscriptionType === 'threeMonth' ? 'Hybrid SaaS' : 'Hybrid Enterprise';
      
      setKeyTerms({
        product: `Visionify ${packageName}`,
        program: `${initialQuoteDetails.contractLength / 12} year subscription`,
        deployment: deployment,
        initialTerm: `${initialQuoteDetails.contractLength / 12} Year`,
        startDate: "Sep 1, 2025",
        endDate: "Sep 1, 2026",
        licenses: `${initialQuoteDetails.totalCameras} Cameras`,
        renewal: `Auto-renews at the end of ${initialQuoteDetails.contractLength / 12} year.`
      });
      
      // Update success criteria with actual camera count
      const customizedSuccessCriteria = `- Onboard ${initialQuoteDetails.totalCameras} cameras and configure selected AI scenarios
- Performance: 90% accuracy, 10s latency, 99% uptime
- Webapp: New site for client, onboard up to 100 users
- Reporting: Daily, Weekly, Monthly Reports
- Alerts & Notifications: Email, MS Teams, WhatsApp, Mobile app
- On-prem integrations: Speakers, PLC, API`;
      setSuccessCriteria(customizedSuccessCriteria);
      
      // Pre-populate customer signature with client info
      setCustomerSignature(prev => ({
        ...prev,
        company: initialQuoteDetails.clientInfo?.company || '',
        companyAddress: `${initialQuoteDetails.clientInfo?.address || ''}\n${initialQuoteDetails.clientInfo?.city || ''} ${initialQuoteDetails.clientInfo?.state || ''} ${initialQuoteDetails.clientInfo?.zip || ''}`.trim()
      }));
    }
  }, [initialQuoteDetails]);

  // Generate order form
  const handleGenerateOrderForm = () => {
    console.log('Generating order form with quote details:', initialQuoteDetails);
    
    if (!initialQuoteDetails) {
      toast.error('Quote details are required to generate an order form');
      return;
    }
    
    // Ensure we have the minimum required data
    if (!initialQuoteDetails.clientInfo) {
      toast.error('Customer information is required to generate an order form');
      return;
    }
    
    // Use the manually entered order form number
    const formattedOrderFormNumber = `ORDER-${orderFormNumber}`;
    
    // Create order form details object
    const orderFormData: OrderFormDetails = {
      quoteId: initialQuoteDetails._id || undefined, // Handle unsaved quotes
      clientInfo: initialQuoteDetails.clientInfo,
      date: new Date().toISOString(),
      orderFormNumber: formattedOrderFormNumber,
      keyTerms,
      successCriteria,
      termsAndConditions,
      quoteDetails: initialQuoteDetails,
      visionifySignature,
      customerSignature
    };
    
    // Set order form details to trigger preview
    setOrderFormDetails(orderFormData);
    
    // Pass to parent component if callback provided
    if (onOrderFormGenerated) {
      onOrderFormGenerated(orderFormData);
    }
    
    toast.success('Order form generated successfully!');
  };
  
  // Save order form mutation
  const saveOrderFormMutation = useMutation(api.orderForms.saveOrderForm);
  
  // Save order form
  const handleSaveOrderForm = async () => {
    if (!orderFormDetails) {
      toast.error('No order form to save');
      return;
    }
    
    try {
      await saveOrderFormMutation({
        quoteId: orderFormDetails.quoteId || undefined,
        customerName: orderFormDetails.clientInfo.name,
        companyName: orderFormDetails.clientInfo.company,
        email: orderFormDetails.clientInfo.email,
        address: orderFormDetails.clientInfo.address,
        city: orderFormDetails.clientInfo.city,
        state: orderFormDetails.clientInfo.state,
        zip: orderFormDetails.clientInfo.zip,
        customerId: orderFormDetails.clientInfo.customerId,
        keyTerms: orderFormDetails.keyTerms,
        successCriteria: orderFormDetails.successCriteria,
        termsAndConditions: orderFormDetails.termsAndConditions,
        orderFormData: orderFormDetails,
        createdAt: Date.now(),
      });
      toast.success('Order form saved successfully!');
    } catch (error) {
      console.error('Failed to save order form:', error);
      toast.error('Failed to save order form');
    }
  };

  return (
    <div className="flex gap-4 h-screen">
      {/* Left side - Generator */}
      <div className="w-1/3 p-4 overflow-y-auto">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Order Form Generator</h2>
            
            {/* Order Form Number Section */}
            <div className="mb-6">
              <Label htmlFor="orderFormNumber">Order Form Number</Label>
              <Input
                id="orderFormNumber"
                type="text"
                value={orderFormNumber}
                onChange={(e) => setOrderFormNumber(e.target.value)}
                placeholder="Enter order form number"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Will appear as "ORDER-{orderFormNumber}" in the document
              </p>
            </div>
            
            {/* Key Terms Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Key Terms</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="product">Product</Label>
                  <Select value={keyTerms.product} onValueChange={(value) => setKeyTerms(prev => ({...prev, product: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Visionify Core Package">Visionify Core Package</SelectItem>
                      <SelectItem value="Visionify Everything Package">Visionify Everything Package</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="program">Program</Label>
                  <Input
                    value={keyTerms.program}
                    onChange={(e) => setKeyTerms(prev => ({...prev, program: e.target.value}))}
                    placeholder="1 year subscription"
                  />
                </div>
                
                <div>
                  <Label htmlFor="deployment">Deployment</Label>
                  <Select value={keyTerms.deployment} onValueChange={(value) => setKeyTerms(prev => ({...prev, deployment: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hybrid SaaS">Hybrid SaaS</SelectItem>
                      <SelectItem value="Hybrid Enterprise">Hybrid Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      value={keyTerms.startDate}
                      onChange={(e) => setKeyTerms(prev => ({...prev, startDate: e.target.value}))}
                      placeholder="Sep 1, 2025"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      value={keyTerms.endDate}
                      onChange={(e) => setKeyTerms(prev => ({...prev, endDate: e.target.value}))}
                      placeholder="Sep 1, 2026"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="licenses">Licenses</Label>
                  <Input
                    value={keyTerms.licenses}
                    onChange={(e) => setKeyTerms(prev => ({...prev, licenses: e.target.value}))}
                    placeholder="20 Cameras"
                  />
                </div>
                
                <div>
                  <Label htmlFor="renewal">Renewal</Label>
                  <Input
                    value={keyTerms.renewal}
                    onChange={(e) => setKeyTerms(prev => ({...prev, renewal: e.target.value}))}
                    placeholder="Auto-renews at the end of 1 year."
                  />
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            {/* Success Criteria Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Success Criteria</h3>
              <Textarea
                value={successCriteria}
                onChange={(e) => setSuccessCriteria(e.target.value)}
                className="min-h-[200px]"
                placeholder="Enter success criteria..."
              />
            </div>
            
            <Separator className="my-6" />
            
            {/* Terms & Conditions Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Terms & Conditions</h3>
              <Textarea
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                className="min-h-[250px]"
                placeholder="Enter terms and conditions..."
              />
            </div>
            
            <Separator className="my-6" />
            
            {/* Generate Button */}
            <div className="flex gap-4">
              <Button onClick={handleGenerateOrderForm} className="flex-1">
                Generate Order Form
              </Button>
              {orderFormDetails && (
                <Button onClick={handleSaveOrderForm} variant="outline">
                  Save Order Form
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Right side - Preview */}
      <div className="w-2/3 border-l border-gray-200">
        {orderFormDetails ? (
          <OrderFormPreview orderFormDetails={orderFormDetails} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Order Form Preview</h3>
              <p>Generate an order form to see the preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderFormGenerator; 