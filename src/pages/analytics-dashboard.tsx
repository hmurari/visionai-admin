import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  FileText,
  DollarSign,
  Percent,
  Clock,
  ArrowRight,
  BookOpen,
  FileCheck,
  Video,
  Link as LinkIcon
} from "lucide-react";

export default function AnalyticsDashboard() {
  const { user } = useUser();
  const deals = useQuery(api.deals.getDeals) || [];
  const learningMaterials = useQuery(api.learningMaterials.getAllMaterials) || [];
  const quotes = useQuery(api.quotes.getRecentQuotes) || [];

  // Calculate deal metrics
  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.opportunityAmount, 0);
  const totalCommission = deals.reduce((sum, deal) => 
    sum + (deal.opportunityAmount * (deal.commissionRate || 20) / 100), 0
  );

  // Get recent resources
  const recentResources = learningMaterials
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD]">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.fullName}</p>
          </div>

          {/* Deals Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Deals</CardTitle>
                <CardDescription>Current opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{totalDeals}</h3>
                    <p className="text-sm text-gray-500">Total deals in pipeline</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Total Value: ${totalValue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <Percent className="h-4 w-4 mr-2 text-green-500" />
                      <span>Potential Commission: ${totalCommission.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => window.location.href = '/deal-registration'}>
                    <BarChart3 className="mr-2 h-4 w-4" /> View All Deals
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Resources */}
            <Card className="col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">New Resources</CardTitle>
                <CardDescription>Recently added materials</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {recentResources.map(resource => (
                    <div key={resource._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        {resource.type === 'document' && <FileText className="h-4 w-4 text-blue-500 mr-2" />}
                        {resource.type === 'video' && <Video className="h-4 w-4 text-purple-500 mr-2" />}
                        {resource.type === 'link' && <LinkIcon className="h-4 w-4 text-green-500 mr-2" />}
                        <span className="text-sm font-medium">{resource.title}</span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{resource.description}</p>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4" onClick={() => window.location.href = '/dashboard'}>
                  <BookOpen className="mr-2 h-4 w-4" /> View All Resources
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Quotes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Quotes</CardTitle>
              <CardDescription>Latest generated quotes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quotes.map(quote => (
                  <div key={quote._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{quote.customerName}</p>
                      <p className="text-sm text-gray-500">${quote.totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(quote.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/quotes'}>
                  <FileCheck className="mr-2 h-4 w-4" /> View All Quotes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
} 