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
  Link as LinkIcon,
  Calendar,
  Camera
} from "lucide-react";

export default function AnalyticsDashboard() {
  const { user } = useUser();
  const deals = useQuery(api.deals.getDeals, { userId: user?.id }) || [];
  const learningMaterials = useQuery(api.learningMaterials.getAllMaterials) || [];
  const quotes = useQuery(api.quotes.getRecentQuotes, { userId: user?.id }) || [];

  // Enhanced metrics calculations
  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.opportunityAmount, 0);
  const totalCommission = deals.reduce((sum, deal) => 
    sum + (deal.opportunityAmount * (deal.commissionRate || 20) / 100), 0
  );
  
  // Calculate month-over-month growth
  const thisMonth = deals.filter(deal => new Date(deal.createdAt).getMonth() === new Date().getMonth()).length;
  const lastMonth = deals.filter(deal => new Date(deal.createdAt).getMonth() === new Date().getMonth() - 1).length;
  const growthRate = lastMonth ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  // Get recent resources
  const recentResources = learningMaterials
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Get recent quotes (last 7 days)
  const recentQuotes = quotes;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.fullName}</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/50 backdrop-blur-sm border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <span className={`text-sm font-medium ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {growthRate >= 0 ? '↑' : '↓'} {Math.abs(growthRate).toFixed(1)}%
                  </span>
                </div>
                <h3 className="text-3xl font-bold mb-1">{totalDeals}</h3>
                <p className="text-sm text-gray-500">Active Deals</p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-1">${totalValue.toLocaleString()}</h3>
                <p className="text-sm text-gray-500">Total Pipeline Value</p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Percent className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-1">${totalCommission.toLocaleString()}</h3>
                <p className="text-sm text-gray-500">Potential Commission</p>
              </CardContent>
            </Card>

            <Card className="bg-white/50 backdrop-blur-sm border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-1">{quotes.length}</h3>
                <p className="text-sm text-gray-500">Active Quotes</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Resources */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="col-span-2 bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Latest Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {recentResources.map(resource => (
                    <div key={resource._id} 
                         className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
                      <div className="flex items-center mb-3">
                        <div className={`p-2 rounded-lg mr-3 
                          ${resource.type === 'document' ? 'bg-blue-100' : 
                            resource.type === 'video' ? 'bg-purple-100' : 'bg-green-100'}`}>
                          {resource.type === 'document' && <FileText className="h-4 w-4 text-blue-600" />}
                          {resource.type === 'video' && <Video className="h-4 w-4 text-purple-600" />}
                          {resource.type === 'link' && <LinkIcon className="h-4 w-4 text-green-600" />}
                        </div>
                        <span className="font-medium">{resource.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{resource.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Quotes */}
            <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center">
                  <FileCheck className="h-5 w-5 mr-2 text-green-600" />
                  Recent Quotes (7 days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentQuotes.length > 0 ? (
                  <div className="space-y-3">
                    {recentQuotes.slice(0, 4).map(quote => (
                      <div key={quote._id} 
                          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{quote.companyName}</p>
                          <span className="text-sm font-medium text-green-600">
                            {formatCurrency(quote.totalAmount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(quote.createdAt)}
                          </div>
                          <div className="flex items-center">
                            <Camera className="h-3 w-3 mr-1" />
                            {quote.cameraCount} cameras
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No quotes in the last 7 days</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 