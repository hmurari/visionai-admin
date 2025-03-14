import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  Loader2, 
  Lock, 
  FileText, 
  Video, 
  BarChart3, 
  Award, 
  CheckCircle, 
  Clock,
  BookOpen,
  Presentation,
  FileSpreadsheet,
  FileCheck,
  Users,
  Building,
  Briefcase,
  Globe
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CountrySelect, countries } from "@/components/ui/country-select";

export default function PartnerApplication() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    businessType: "var",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    website: "",
    reasonForPartnership: "",
    region: "", // Single country code
  });
  
  // Get application status
  const applicationStatus = useQuery(api.partners.getApplicationStatus);
  const submitApplication = useMutation(api.partners.submitApplication);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitApplication({
        ...formData,
        contactName: formData.contactName || user?.fullName || "",
        contactEmail: formData.contactEmail || user?.primaryEmailAddress?.emailAddress || "",
      });
      
      toast({
        title: "Application Submitted",
        description: "Your partner application has been submitted successfully.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your application.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render application status if already submitted
  if (applicationStatus) {
    // Get country name from code
    const regionInfo = applicationStatus.region
      ? countries.find(c => c.code === applicationStatus.region)
      : null;
      
    const regionDisplay = regionInfo 
      ? `${regionInfo.flag} ${regionInfo.name}` 
      : "Not specified";
      
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Partner Application Status</CardTitle>
                <CardDescription>
                  Your application to join our partner program is being reviewed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-4">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{applicationStatus.companyName}</h3>
                      <p className="text-sm text-gray-500">{applicationStatus.businessType}</p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Application Status</h3>
                    <div className="flex items-center">
                      {applicationStatus.status === "pending" ? (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Under Review
                        </Badge>
                      ) : applicationStatus.status === "approved" ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-1">Contact Information</h3>
                      <p className="text-sm text-gray-500">{applicationStatus.contactName}</p>
                      <p className="text-sm text-gray-500">{applicationStatus.contactEmail}</p>
                      <p className="text-sm text-gray-500">{applicationStatus.contactPhone}</p>
                    </div>
                    
                    {applicationStatus.website && (
                      <div>
                        <h3 className="text-sm font-medium mb-1">Website</h3>
                        <p className="text-sm text-gray-500">{applicationStatus.website}</p>
                      </div>
                    )}
                    
                    {applicationStatus.region && (
                      <div>
                        <h3 className="text-sm font-medium mb-1">Region</h3>
                        <p className="text-sm text-gray-500">{regionDisplay}</p>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium mb-1">Partnership Reason</h3>
                      <p className="text-sm text-gray-500">{applicationStatus.reasonForPartnership}</p>                    
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">What happens next?</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Our team is reviewing your application. This typically takes 1-3 business days.
                    You'll receive an email notification once a decision has been made.
                  </p>
                  <div className="flex items-center text-sm text-blue-600">
                    <Users className="h-4 w-4 mr-2" />
                    <a href="mailto:sales@visionify.ai" className="hover:underline">
                      Have questions? Contact our partner team
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="max-w-2xl mx-auto mt-8">
              <h2 className="text-xl font-semibold mb-4">Partner Resources Preview</h2>
              <ResourcePreview />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Render application form
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Partner Application</h1>
                <p className="text-gray-600 mb-6">
                  Join our partner program to access exclusive resources and grow your business
                </p>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>
                      Tell us about your business and how we can work together
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Company Name</label>
                        <Input
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Enter your company name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Business Type</label>
                        <Select
                          name="businessType"
                          value={formData.businessType}
                          onValueChange={(value) => 
                            setFormData((prev) => ({ ...prev, businessType: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="var">Value-Added Reseller</SelectItem>
                            <SelectItem value="msp">Managed Service Provider</SelectItem>
                            <SelectItem value="si">System Integrator</SelectItem>
                            <SelectItem value="consultant">Consultant</SelectItem>
                            <SelectItem value="distributor">Distributor</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Name</label>
                        <Input
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleChange}
                          placeholder={user?.fullName || "Enter contact name"}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Email</label>
                        <Input
                          name="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={handleChange}
                          placeholder={user?.primaryEmailAddress?.emailAddress || "Enter contact email"}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Contact Phone</label>
                        <Input
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleChange}
                          placeholder="Enter contact phone number"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Website (Optional)</label>
                        <Input
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://example.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Primary Region</label>
                        <CountrySelect
                          value={formData.region}
                          onChange={(value) => 
                            setFormData((prev) => ({ ...prev, region: value }))
                          }
                          placeholder="Select your primary region"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Why do you want to join our partner program?</label>
                        <Textarea
                          name="reasonForPartnership"
                          value={formData.reasonForPartnership}
                          onChange={handleChange}
                          placeholder="Tell us about your goals and how our partnership can help you achieve them"
                          rows={4}
                          required
                        />
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
                          "Submit Application"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <ResourcePreview />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ResourcePreview() {
  return (
    <div className="space-y-4">
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-800">Partner Benefits</h3>
              <p className="text-sm text-blue-600">
                Unlock exclusive resources and support
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">What you'll get access to:</h3>
        
        {/* Sales Enablement */}
        <Card className="bg-gray-100 opacity-75 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-black/50 rounded-full p-2">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="filter blur-[1px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sales Enablement</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <BarChart3 className="h-4 w-4 mr-1" />
                <span>5 resources</span>
              </div>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Competitive Battlecards</li>
                <li>• Sales Presentation</li>
                <li>• ROI Calculator</li>
                <li>• Product Comparison</li>
                <li>• Pricing Guide</li>
              </ul>
            </CardContent>
          </div>
        </Card>
        
        {/* Technical Documentation */}
        <Card className="bg-gray-100 opacity-75 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-black/50 rounded-full p-2">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="filter blur-[1px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Technical Documentation</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <BookOpen className="h-4 w-4 mr-1" />
                <span>7 resources</span>
              </div>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Implementation Guide</li>
                <li>• API Documentation</li>
                <li>• Security Whitepaper</li>
                <li>• Architecture Diagrams</li>
                <li>• Best Practices Guide</li>
              </ul>
            </CardContent>
          </div>
        </Card>
        
        {/* Training Videos */}
        <Card className="bg-gray-100 opacity-75 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-black/50 rounded-full p-2">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="filter blur-[1px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Training Videos</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Video className="h-4 w-4 mr-1" />
                <span>8 videos</span>
              </div>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Product Overview (12:34)</li>
                <li>• Advanced Features (18:45)</li>
                <li>• Implementation Walkthrough (25:10)</li>
                <li>• Admin Console Tutorial (15:22)</li>
                <li>• Troubleshooting Guide (20:05)</li>
              </ul>
            </CardContent>
          </div>
        </Card>
        
        {/* Case Studies */}
        <Card className="bg-gray-100 opacity-75 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-black/50 rounded-full p-2">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="filter blur-[1px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Success Stories</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Briefcase className="h-4 w-4 mr-1" />
                <span>6 case studies</span>
              </div>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Enterprise Retail Deployment</li>
                <li>• Healthcare Provider Solution</li>
                <li>• Financial Services Integration</li>
                <li>• Manufacturing Optimization</li>
                <li>• SMB Success Story</li>
              </ul>
            </CardContent>
          </div>
        </Card>
      </div>
      
      <div className="pt-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Join Our Partner Program</h3>
                <p className="text-sm text-blue-600">
                  Apply now to unlock all these resources and more!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}