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
  Award
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
import { CountrySelect, countries } from "@/components/ui/country-select";
import { IndustrySelect } from "@/components/ui/industry-select";

export function PartnersTab() {
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("all");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleteError, setDeleteError] = useState("");
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    businessType: "",
    website: "",
    country: "",
    industryFocus: "",
    annualRevenue: "",
    partnerStatus: "active",
  });
  
  // Queries and mutations
  const partners = useQuery(api.admin.getAllPartners) || [];
  const updatePartner = useMutation(api.admin.updatePartner);
  const deletePartner = useMutation(api.admin.deletePartner);
  const togglePartnerStatus = useMutation(api.admin.togglePartnerStatus);
  
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
  
  // Get unique business types for filter
  const businessTypes = useMemo(() => {
    const types = new Set();
    partners.forEach(partner => {
      if (partner.application?.businessType) {
        types.add(partner.application.businessType);
      }
    });
    return Array.from(types);
  }, [partners]);
  
  // Helper functions
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>;
      case "disabled":
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><Ban className="h-3 w-3 mr-1" /> Disabled</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800"><AlertCircle className="h-3 w-3 mr-1" /> Unknown</Badge>;
    }
  };
  
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
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Event handlers
  const handleViewPartner = (partner) => {
    setSelectedPartner(partner);
    setIsProfileOpen(true);
  };
  
  const handleEditPartner = (partner) => {
    setEditFormData({
      name: partner.name || "",
      email: partner.email || "",
      phone: partner.phone || "",
      companyName: partner.companyName || "",
      businessType: partner.application?.businessType || "",
      website: partner.website || "",
      country: partner.country || "",
      industryFocus: partner.industryFocus || "",
      annualRevenue: partner.annualRevenue || "",
      partnerStatus: partner.partnerStatus || "active",
    });
    setSelectedPartner(partner);
    setIsEditOpen(true);
  };
  
  const handleDeletePartner = (partner) => {
    setPartnerToDelete(partner);
    setDeleteConfirmName("");
    setDeleteError("");
    setIsDeleteOpen(true);
  };
  
  const handleToggleStatus = async (partner) => {
    try {
      const disable = partner.partnerStatus === "active";
      await togglePartnerStatus({ 
        partnerId: partner.tokenIdentifier, 
        disable 
      });
      toast({
        title: disable ? "Partner Disabled" : "Partner Enabled",
        description: `${partner.companyName || partner.name} has been ${disable ? 'disabled' : 'enabled'}.`,
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: error.message || "There was an error updating the partner status.",
        variant: "destructive",
      });
    }
  };
  
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePartner({
        partnerId: selectedPartner.tokenIdentifier,
        ...editFormData,
      });
      toast({
        title: "Partner Updated",
        description: "The partner details have been updated successfully.",
      });
      setIsEditOpen(false);
      setSelectedPartner(null);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating the partner.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (!partnerToDelete) {
      setDeleteError("Partner information is missing. Please try again.");
      return;
    }
    
    if (deleteConfirmName !== partnerToDelete.companyName) {
      setDeleteError("Company name doesn't match. Please try again.");
      return;
    }
    
    try {
      await deletePartner({ userId: partnerToDelete.tokenIdentifier });
      toast({
        title: "Partner Deleted",
        description: "The partner has been successfully removed.",
      });
      setIsDeleteOpen(false);
      setPartnerToDelete(null);
      setDeleteConfirmName("");
      setDeleteError("");
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error.message || "There was an error deleting the partner.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Partners</h2>
          <p className="text-gray-600">Manage your partner network</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {filteredPartners.length} Partners
          </Badge>
        </div>
      </div>
      
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
                  {businessTypes.map((type: string) => (
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
                        <DropdownMenuItem onClick={() => handleEditPartner(partner)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Partner
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(partner)}>
                          {partner.partnerStatus === "active" ? (
                            <>
                              <Ban className="h-4 w-4 mr-2" />
                              Disable Partner
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Enable Partner
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeletePartner(partner)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Partner
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {partner.name || 'N/A'}</p>
                      <p><span className="font-medium">Email:</span> {partner.email || 'N/A'}</p>
                      {partner.phone && (
                        <p><span className="font-medium">Phone:</span> {partner.phone}</p>
                      )}
                      {partner.website && (
                        <p className="flex items-center">
                          <span className="font-medium mr-1">Website:</span>
                          <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                            <Globe className="h-3 w-3 mr-1" />
                            {partner.website}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Business Information */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <Briefcase className="h-4 w-4 mr-2" />
                      Business Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      {partner.country && (
                        <p className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {countries.find(c => c.code === partner.country)?.name || partner.country}
                        </p>
                      )}
                      {partner.industryFocus && (
                        <p><span className="font-medium">Industry:</span> {partner.industryFocus}</p>
                      )}
                      {partner.annualRevenue && (
                        <p><span className="font-medium">Revenue:</span> {partner.annualRevenue}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Performance Metrics */}
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Performance
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Deals:</span>
                        <Badge variant="outline">{partner.dealCounts?.total || 0}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Deals:</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {partner.dealCounts?.active || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Closed Deals:</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {partner.dealCounts?.closed || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Value:</span>
                        <span className="font-medium">{formatCurrency(partner.dealCounts?.totalValue || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Partners Found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all" || businessTypeFilter !== "all" 
                ? "No partners match your current filters."
                : "There are no partners to display."
              }
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Partner Profile Dialog */}
      {selectedPartner && (
        <UserProfileView
          user={selectedPartner}
          isOpen={isProfileOpen}
          onClose={() => {
            setIsProfileOpen(false);
            setSelectedPartner(null);
          }}
          isAdmin={true}
        />
      )}
      
      {/* Edit Partner Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Partner</DialogTitle>
            <DialogDescription>
              Update partner information and settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Contact Name</Label>
                  <Input
                    id="name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contact person name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email address"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={editFormData.companyName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={editFormData.website}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="partnerStatus">Status</Label>
                  <Select 
                    value={editFormData.partnerStatus} 
                    onValueChange={(value) => setEditFormData(prev => ({ ...prev, partnerStatus: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <CountrySelect
                    value={editFormData.country}
                    onChange={(value) => setEditFormData(prev => ({ ...prev, country: value }))}
                    placeholder="Select country"
                  />
                </div>
                <div>
                  <Label htmlFor="industryFocus">Industry Focus</Label>
                  <IndustrySelect
                    value={editFormData.industryFocus}
                    onChange={(value) => setEditFormData(prev => ({ ...prev, industryFocus: value }))}
                    placeholder="Select industry"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="annualRevenue">Annual Revenue</Label>
                <Select 
                  value={editFormData.annualRevenue} 
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, annualRevenue: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select revenue range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-1m">Under $1M</SelectItem>
                    <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                    <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                    <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                    <SelectItem value="50m-100m">$50M - $100M</SelectItem>
                    <SelectItem value="over-100m">Over $100M</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Partner</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The partner will be removed from the system and their role will be reset to a regular user.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              To confirm, please type the company name: <span className="font-bold">{partnerToDelete?.companyName}</span>
            </p>
            <Input
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder="Enter company name"
              className={deleteError ? "border-red-500" : ""}
            />
            {deleteError && <p className="text-red-500 text-sm mt-1">{deleteError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Partner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 