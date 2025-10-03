import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navbar } from "../components/navbar";
import { Footer } from "../components/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Camera,
  UserPlus,
  Target,
  AlertCircle,
} from "lucide-react";
import { PartnerProgressTracker } from "@/components/PartnerProgressTracker";
import { ExistingPartnerTermsCheck } from "@/components/ExistingPartnerTermsCheck";

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
  
  // Separate admin-assigned deals from self-created deals
  const adminAssignedDeals = deals.filter(deal => deal.assignedBy && deal.status === 'assigned');
  const selfCreatedDeals = deals.filter(deal => !deal.assignedBy);
  
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

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', label: 'New' },
      assigned: { color: 'bg-purple-100 text-purple-800', label: 'Assigned' },
      reassigned: { color: 'bg-orange-100 text-orange-800', label: 'Reassigned' },
      prospecting: { color: 'bg-yellow-100 text-yellow-800', label: 'Prospecting' },
      qualified: { color: 'bg-indigo-100 text-indigo-800', label: 'Qualified' },
      proposal: { color: 'bg-pink-100 text-pink-800', label: 'Proposal' },
      negotiation: { color: 'bg-amber-100 text-amber-800', label: 'Negotiation' },
      closed: { color: 'bg-green-100 text-green-800', label: 'Closed' },
      won: { color: 'bg-green-100 text-green-800', label: 'Won' },
      lost: { color: 'bg-red-100 text-red-800', label: 'Lost' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' },
    };
    
    const config = statusConfig[status] || statusConfig.new;
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <ExistingPartnerTermsCheck />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Partner Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.fullName}</p>
          </div>
          
          {/* Add the PartnerProgressTracker component here */}
          <div className="mb-10">
            <PartnerProgressTracker />
          </div>

          {/* Admin-Assigned Deals Alert */}
          {adminAssignedDeals.length > 0 && (
            <Card className="mb-8 border-purple-200 bg-purple-50">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <UserPlus className="h-6 w-6 text-purple-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900">
                      New Deals Assigned to You
                    </h3>
                    <p className="text-sm text-purple-700">
                      You have {adminAssignedDeals.length} deal{adminAssignedDeals.length !== 1 ? 's' : ''} assigned by admin requiring your attention
                    </p>
                  </div>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Target className="h-4 w-4 mr-2" />
                  View Assigned Deals
                </Button>
              </CardContent>
            </Card>
          )}
          
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
                <p className="text-sm text-gray-500">
                  Active Deals 
                  {adminAssignedDeals.length > 0 && (
                    <span className="text-purple-600 font-medium">
                      ({adminAssignedDeals.length} assigned)
                    </span>
                  )}
                </p>
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

          {/* Assigned Deals Section */}
          {adminAssignedDeals.length > 0 && (
            <Card className="mb-8 bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold flex items-center">
                  <UserPlus className="h-5 w-5 mr-2 text-purple-600" />
                  Deals Assigned by Admin
                </CardTitle>
                <CardDescription>
                  These deals have been assigned to you by the admin team for execution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminAssignedDeals.slice(0, 5).map(deal => (
                    <div key={deal._id} 
                         className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-purple-900">{deal.customerName}</h4>
                          <p className="text-sm text-purple-700">{deal.customerEmail}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-900">{formatCurrency(deal.opportunityAmount)}</div>
                          <div className="text-sm text-purple-600">
                            {deal.cameraCount && `${deal.cameraCount} cameras`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(deal.status)}
                          <Badge variant="outline" className="bg-white">
                            Expected: {formatDate(deal.expectedCloseDate)}
                          </Badge>
                        </div>
                        <div className="text-xs text-purple-600">
                          Assigned {formatDate(deal.createdAt)}
                        </div>
                      </div>
                      {deal.notes && (
                        <div className="mt-3 p-2 bg-white rounded text-sm text-gray-700 border">
                          <strong>Notes:</strong> {deal.notes}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {adminAssignedDeals.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                        View All {adminAssignedDeals.length} Assigned Deals
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Resources and Quotes */}
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