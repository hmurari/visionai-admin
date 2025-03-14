import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  PlusCircle, 
  Calendar, 
  DollarSign, 
  Building, 
  Mail, 
  Phone, 
  MapPin,
  Loader2,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

export default function DealRegistration() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    opportunityAmount: "",
    expectedCloseDate: "",
    notes: ""
  });
  
  const registerDeal = useMutation(api.deals.registerDeal);
  const deals = useQuery(api.deals.getPartnerDeals) || [];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert amount to number and date to timestamp
      const amount = parseFloat(formData.opportunityAmount);
      const closeDate = new Date(formData.expectedCloseDate).getTime();
      
      if (isNaN(amount)) {
        throw new Error("Please enter a valid opportunity amount");
      }
      
      if (isNaN(closeDate)) {
        throw new Error("Please enter a valid expected close date");
      }
      
      await registerDeal({
        ...formData,
        opportunityAmount: amount,
        expectedCloseDate: closeDate
      });
      
      toast({
        title: "Deal Registered",
        description: "Your deal has been successfully registered.",
        variant: "success",
      });
      
      // Reset form
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        opportunityAmount: "",
        expectedCloseDate: "",
        notes: ""
      });
      
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error registering your deal.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case "closed":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CheckCircle className="h-3 w-3 mr-1" /> Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD]">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Deal Registration</h1>
            <p className="text-gray-600">
              Register and track your deals with Visionify
            </p>
          </div>
          
          <Tabs defaultValue="deals">
            <TabsList className="mb-6">
              <TabsTrigger value="deals">My Deals</TabsTrigger>
              <TabsTrigger value="register">Register New Deal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="deals">
              <div className="grid gap-6">
                {deals.length > 0 ? (
                  deals.map(deal => (
                    <Card key={deal._id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{deal.customerName}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Building className="h-4 w-4 mr-1" />
                              {deal.customerAddress || "No address provided"}
                            </CardDescription>
                          </div>
                          <div>
                            {getStatusBadge(deal.status)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Contact Information</p>
                            <div className="flex items-center mb-1">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{deal.customerEmail}</span>
                            </div>
                            {deal.customerPhone && (
                              <div className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                <span>{deal.customerPhone}</span>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Opportunity Details</p>
                            <div className="flex items-center mb-1">
                              <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                              <span>${deal.opportunityAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span>Expected close: {new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Registration Info</p>
                            <div className="text-sm">
                              <p>Created: {new Date(deal.createdAt).toLocaleDateString()}</p>
                              {deal.notes && (
                                <p className="mt-2 text-gray-600 italic">"{deal.notes}"</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <div className="mb-4">
                      <PlusCircle className="h-12 w-12 mx-auto text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No deals registered yet</h3>
                    <p className="text-gray-500 mb-4">Register your first deal to start tracking opportunities</p>
                    <Button onClick={() => document.querySelector('[data-value="register"]').click()}>
                      Register Your First Deal
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Register New Deal</CardTitle>
                  <CardDescription>
                    Submit details about your new opportunity with a customer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Customer Name *</label>
                        <Input
                          name="customerName"
                          value={formData.customerName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Customer Email *</label>
                        <Input
                          name="customerEmail"
                          type="email"
                          value={formData.customerEmail}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Customer Phone</label>
                          <Input
                            name="customerPhone"
                            value={formData.customerPhone}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Opportunity Amount ($) *</label>
                          <Input
                            name="opportunityAmount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.opportunityAmount}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Customer Address</label>
                        <Input
                          name="customerAddress"
                          value={formData.customerAddress}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Expected Close Date *</label>
                        <Input
                          name="expectedCloseDate"
                          type="date"
                          value={formData.expectedCloseDate}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <Textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder="Additional details about this opportunity..."
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Register Deal"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
} 