import { useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Ban,
  RefreshCw,
  Users,
  TrendingUp,
  Award,
  Clock,
  UserCheck,
  UserX,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserProfileView } from "@/components/UserProfileView";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function PartnersTab() {
  const { toast } = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState("applications");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isApplicationDetailOpen, setIsApplicationDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Queries and mutations
  const partners = useQuery(api.admin.getAllPartners) || [];
  const partnerApplications = useQuery(api.admin.getPartnerApplications) || [];
  const approvePartnerApplication = useMutation(api.admin.approvePartnerApplication);
  const rejectPartnerApplication = useMutation(api.admin.rejectPartnerApplication);

  // Filter and search partners
  const filteredPartners = useMemo(() => {
    return partners.filter(partner => {
      const matchesSearch = !searchTerm || 
        partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || partner.partnerStatus === statusFilter;
      
      const matchesBusinessType = businessTypeFilter === "all" || 
        partner.application?.businessType === businessTypeFilter;
      
      return matchesSearch && matchesStatus && matchesBusinessType;
    });
  }, [partners, searchTerm, statusFilter, businessTypeFilter]);

  // Filter and search partner applications
  const filteredApplications = useMemo(() => {
    return partnerApplications.filter(application => {
      const matchesSearch = !searchTerm || 
        application.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        application.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || application.status === statusFilter;
      
      const matchesBusinessType = businessTypeFilter === "all" || 
        application.businessType === businessTypeFilter;
      
      return matchesSearch && matchesStatus && matchesBusinessType;
    });
  }, [partnerApplications, searchTerm, statusFilter, businessTypeFilter]);
  
  // Get unique business types for filter
  const businessTypes = useMemo(() => {
    const types = new Set();
    partners.forEach(partner => {
      if (partner.application?.businessType) {
        types.add(partner.application.businessType);
      }
    });
    partnerApplications.forEach(application => {
      if (application.businessType) {
        types.add(application.businessType);
      }
    });
    return Array.from(types);
  }, [partners, partnerApplications]);
  
  // Helper functions
  const getBusinessTypeDisplay = (type) => {
    switch (type?.toLowerCase()) {
      case "var":
        return "Value Added Reseller";
      case "si":
        return "System Integrator";
      case "integrator":
        return "System Integrator";
      case "distributor":
        return "Distributor";
      case "consultant":
        return "Consultant";
      case "technology":
        return "Technology Partner";
      default:
        return type || "Partner";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case "disabled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Disabled</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Application event handlers
  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setIsApplicationDetailOpen(true);
  };

  const handleApproveApplication = async (application) => {
    setIsSubmitting(true);
    try {
      await approvePartnerApplication({ applicationId: application._id });
      toast({
        title: "Application Approved",
        description: `${application.companyName} has been approved as a partner.`,
      });
      setIsApplicationDetailOpen(false);
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: error.message || "There was an error approving the application.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectApplication = async (application, reason = "") => {
    setIsSubmitting(true);
    try {
      await rejectPartnerApplication({ 
        applicationId: application._id,
        rejectionReason: reason 
      });
      toast({
        title: "Application Rejected",
        description: `${application.companyName}'s application has been rejected.`,
      });
      setIsApplicationDetailOpen(false);
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: error.message || "There was an error rejecting the application.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewPartner = (partner) => {
    setSelectedPartner(partner);
    setIsProfileOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Partners Management</h2>
          <p className="text-gray-600">Manage partner applications and existing partners</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            {filteredApplications.filter(app => app.status === 'pending').length} Pending Applications
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {filteredPartners.length} Active Partners
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Applications ({partnerApplications.filter(app => app.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="partners" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Partners ({partners.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search applications by name, company, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Business Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {getBusinessTypeDisplay(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Applications List */}
            {filteredApplications.length > 0 ? (
              <div className="grid gap-4">
                {filteredApplications.map(application => (
                  <Card key={application._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-100 p-2 rounded-full">
                            <FileText className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{application.companyName}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <span>{getBusinessTypeDisplay(application.businessType)}</span>
                              <span>•</span>
                              <span>{application.contactName}</span>
                              <span>•</span>
                              <span>Applied {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Unknown'}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(application.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewApplication(application)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {application.status === 'pending' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleApproveApplication(application)}
                                    className="text-green-600"
                                  >
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleRejectApplication(application)}
                                    className="text-red-600"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{application.contactEmail}</span>
                        </div>
                        {application.contactPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{application.contactPhone}</span>
                          </div>
                        )}
                        {application.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <span>{application.website}</span>
                          </div>
                        )}
                      </div>
                      {application.reasonForPartnership && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600 line-clamp-2">
                            <strong>Partnership Reason:</strong> {application.reasonForPartnership}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                    <p className="text-gray-500">
                      {searchTerm || statusFilter !== "all" || businessTypeFilter !== "all"
                        ? "No applications match your current filters."
                        : "No partner applications have been submitted yet."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="partners">
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search partners by name, company, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Business Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {getBusinessTypeDisplay(type)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Partners Grid */}
            {filteredPartners.length > 0 ? (
              <div className="grid gap-6">
                {filteredPartners.map(partner => (
                  <Card key={partner._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Building className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{partner.companyName || partner.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <span>{getBusinessTypeDisplay(partner.application?.businessType)}</span>
                              <span>•</span>
                              <span>Joined {partner.joinDate ? new Date(partner.joinDate).toLocaleDateString() : 'N/A'}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(partner.partnerStatus)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewPartner(partner)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{partner.email}</span>
                        </div>
                        {partner.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{partner.phone}</span>
                          </div>
                        )}
                        {partner.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{partner.website}</span>
                          </div>
                        )}
                        {partner.country && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{partner.country}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Performance Metrics */}
                      {partner.dealCounts && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Briefcase className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium">Total Deals</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{partner.dealCounts.total || 0}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium">Active</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{partner.dealCounts.active || 0}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Award className="h-4 w-4 text-purple-500" />
                              <span className="text-sm font-medium">Closed</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">{partner.dealCounts.closed || 0}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <DollarSign className="h-4 w-4 text-amber-500" />
                              <span className="text-sm font-medium">Pipeline</span>
                            </div>
                            <p className="text-2xl font-bold text-amber-600">
                              {formatCurrency(partner.dealCounts.totalValue || 0)}
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No partners found</h3>
                    <p className="text-gray-500">
                      {searchTerm || statusFilter !== "all" || businessTypeFilter !== "all"
                        ? "No partners match your current filters."
                        : "No partners have been approved yet."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Profile View Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Partner Profile</DialogTitle>
            <DialogDescription>
              View detailed partner information and performance metrics
            </DialogDescription>
          </DialogHeader>
          {selectedPartner && (
            <UserProfileView 
              user={selectedPartner} 
              isOpen={true}
              onClose={() => setIsProfileOpen(false)}
              isAdmin={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Application Detail Dialog */}
      <Dialog open={isApplicationDetailOpen} onOpenChange={setIsApplicationDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Partner Application Details</DialogTitle>
            <DialogDescription>
              Review and approve or reject this partner application
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Company Name</Label>
                  <p className="text-sm text-gray-600">{selectedApplication.companyName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Business Type</Label>
                  <p className="text-sm text-gray-600">{getBusinessTypeDisplay(selectedApplication.businessType)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Contact Name</Label>
                  <p className="text-sm text-gray-600">{selectedApplication.contactName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Contact Email</Label>
                  <p className="text-sm text-gray-600">{selectedApplication.contactEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Contact Phone</Label>
                  <p className="text-sm text-gray-600">{selectedApplication.contactPhone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Website</Label>
                  <p className="text-sm text-gray-600">{selectedApplication.website || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Region</Label>
                  <p className="text-sm text-gray-600">{selectedApplication.region || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Annual Revenue</Label>
                  <p className="text-sm text-gray-600">{selectedApplication.annualRevenue || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Industry Focus</Label>
                  <p className="text-sm text-gray-600">{selectedApplication.industryFocus || 'Not provided'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Application Status</Label>
                  {getStatusBadge(selectedApplication.status)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Reason for Partnership</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedApplication.reasonForPartnership}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Submitted</Label>
                <p className="text-sm text-gray-600">
                  {selectedApplication.createdAt ? new Date(selectedApplication.createdAt).toLocaleString() : 'Unknown'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            {selectedApplication?.status === 'pending' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => handleRejectApplication(selectedApplication)}
                  className="text-red-600 hover:text-red-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => handleApproveApplication(selectedApplication)}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 