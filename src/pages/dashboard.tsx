import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Lock, BookOpen, Briefcase, Users, FileCheck, FileSpreadsheet, 
  Presentation, BarChart3, Video, FileText
} from "lucide-react";
import { ResourceCardList } from "@/components/ResourceCardList";
import { ExistingPartnerTermsCheck } from "@/components/ExistingPartnerTermsCheck";

export default function Dashboard() {
  const { user } = useUser();
  const userData = useQuery(api.users.getUserByToken,
    user?.id ? { tokenIdentifier: user.id } : "skip"
  );
  const subscription = useQuery(api.subscriptions.getUserSubscription);
  
  const learningMaterials = useQuery(api.learningMaterials.getAllMaterials) || [];
  
  // Check if user is a partner
  const isPartner = userData?.role === "partner";
  const applicationStatus = useQuery(api.partners.getApplicationStatus);
 
  if (!isPartner && !applicationStatus) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBFBFD]">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Partner Resources</h1>
              <p className="text-gray-600 mb-6">
                Join our partner program to access exclusive learning materials and resources
              </p>
              
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Partner Access Required</CardTitle>
                  <CardDescription>
                    Apply for our partner program to unlock these valuable resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      As a Visionify partner, you'll get access to exclusive materials to help you succeed:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                      <li>Sales enablement kits and competitive battlecards</li>
                      <li>Technical documentation and implementation guides</li>
                      <li>Training videos and certification materials</li>
                      <li>Case studies and success stories</li>
                      <li>Deal registration and partner benefits</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => window.location.href = "/partner-application"}
                  >
                    Apply Now
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Resource Preview */}
              <h2 className="text-xl font-semibold mb-4">Resource Preview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Sales Enablement */}
                <Card className="bg-gray-100 opacity-75 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-black/50 rounded-full p-2">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="filter blur-[1px]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Sales Enablement Kit</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <FileText className="h-4 w-4 mr-1" />
                        <span>5 documents</span>
                      </div>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Product Comparison Guide</li>
                        <li>• Competitive Battlecard</li>
                        <li>• ROI Calculator</li>
                        <li>• Customer Pitch Deck</li>
                        <li>• Objection Handling Guide</li>
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
        </main>
        <Footer />
      </div>
    );
  }
  
  if (applicationStatus && applicationStatus.status === "pending") {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBFBFD]">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto mb-8">
              <CardHeader>
                <CardTitle>Application Pending</CardTitle>
                <CardDescription>
                  Your partner application is currently under review. We'll notify you once it's approved.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mb-6">
                  <p className="text-yellow-800">
                    Application submitted on {new Date(applicationStatus.submittedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <h3 className="text-lg font-medium mb-4">Resources you'll get access to:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sales Enablement */}
                  <Card className="bg-gray-100 opacity-75 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="bg-black/50 rounded-full p-2">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="filter blur-[1px]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Sales Enablement Kit</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>5 documents</span>
                        </div>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• Product Comparison Guide</li>
                          <li>• Competitive Battlecard</li>
                          <li>• ROI Calculator</li>
                          <li>• Customer Pitch Deck</li>
                          <li>• Objection Handling Guide</li>
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
                  
                  {/* Deployment Guides */}
                  <Card className="bg-gray-100 opacity-75 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="bg-black/50 rounded-full p-2">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="filter blur-[1px]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Deployment Guides</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <FileCheck className="h-4 w-4 mr-1" />
                          <span>6 resources</span>
                        </div>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• Installation Walkthrough</li>
                          <li>• Network Configuration</li>
                          <li>• Camera Setup Guide</li>
                          <li>• System Requirements</li>
                          <li>• Troubleshooting Tips</li>
                        </ul>
                      </CardContent>
                    </div>
                  </Card>
                  
                  {/* Pricing & Discounts */}
                  <Card className="bg-gray-100 opacity-75 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="bg-black/50 rounded-full p-2">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="filter blur-[1px]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Pricing & Discounts</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <FileSpreadsheet className="h-4 w-4 mr-1" />
                          <span>4 resources</span>
                        </div>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• Partner Price List</li>
                          <li>• Volume Discount Tiers</li>
                          <li>• Promotional Offers</li>
                          <li>• Margin Structure Guide</li>
                        </ul>
                      </CardContent>
                    </div>
                  </Card>
                  
                  {/* Quote Generation Tool */}
                  <Card className="bg-gray-100 opacity-75 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="bg-black/50 rounded-full p-2">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="filter blur-[1px]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Quote Generation Tool</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Presentation className="h-4 w-4 mr-1" />
                          <span>Interactive Tool</span>
                        </div>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• Custom Quote Builder</li>
                          <li>• Solution Configurator</li>
                          <li>• Pricing Calculator</li>
                          <li>• Proposal Templates</li>
                        </ul>
                      </CardContent>
                    </div>
                  </Card>
                  
                  {/* Deal Registration & Tracking */}
                  <Card className="bg-gray-100 opacity-75 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="bg-black/50 rounded-full p-2">
                        <Lock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="filter blur-[1px]">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Deal Registration & Tracking</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <BarChart3 className="h-4 w-4 mr-1" />
                          <span>Partner Portal</span>
                        </div>
                        <ul className="text-xs text-gray-500 space-y-1">
                          <li>• Deal Registration System</li>
                          <li>• Pipeline Management</li>
                          <li>• Status Tracking</li>
                          <li>• Commission Reports</li>
                        </ul>
                      </CardContent>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // For approved partners, show the resources with our new component
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD]">
      <Navbar />
      <ExistingPartnerTermsCheck />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Partner Resources</h1>
            <p className="text-gray-600">
              Access exclusive learning materials and resources for Visionify partners
            </p>
          </div>
          
          {/* Use our new ResourceCardList component */}
          <ResourceCardList 
            materials={learningMaterials}
            onCardClick={(material) => {
              if (material.link.startsWith('http')) {
                window.open(material.link, '_blank');
              } else {
                // Handle relative paths or other link types
                window.open(material.link, '_blank');
              }
            }}
            itemsPerPage={9}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Remove the ResourceCard function since we've moved it to its own component
// Remove the getIconForType function since it's now in the ResourceCard component

function DataCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[20px] shadow-sm p-8 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-semibold mb-6 text-[#1D1D1F]">{title}</h2>
      {children}
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between py-3 border-b border-[#E5E5E7] last:border-0">
      <span className="text-[#86868B]">{label}</span>
      <span className="text-[#1D1D1F] font-medium">{value || "—"}</span>
    </div>
  );
}

function formatDate(timestamp: number | undefined) {
  if (!timestamp) return "—";
  return new Date(timestamp).toLocaleDateString();
}

function formatCurrency(amount: number | undefined, currency: string = "USD") {
  if (amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount / 100);
}

function StatusBadge({ status }: { status: string | undefined }) {
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "active":
        return "bg-[#E3F3E3] text-[#1D7D1D]";
      case "canceled":
        return "bg-[#FFE7E7] text-[#D70015]";
      default:
        return "bg-[#F5F5F7] text-[#86868B]";
    }
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
      {status || "No status"}
    </span>
  );
}