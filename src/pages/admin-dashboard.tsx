import { useUser } from "@clerk/clerk-react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Footer } from "../components/footer";
import { Navbar } from "../components/navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DownloadIcon,
  CreditCard,
  Calendar,
  Tag,
  Settings,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  PlusCircle,
  Trash,
  Edit,
  Link as LinkIcon,
  XCircle,
  Clock,
  Loader2,
  Users,
  Building,
  Plus,
  BarChart3,
  Presentation,
  Video,
  Briefcase,
  Star,
  Play,
  ExternalLink,
  Pencil,
  Trash2,
  X,
  Search,
  Filter,
  SearchX,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { CamerasTab } from "./admin-dashboard-tabs/cameras-tab";
import { AnalyticsTab } from "./admin-dashboard-tabs/analytics-tab";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Checkbox,
} from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DealCard } from "../components/DealCard";
import { SearchWithResults } from "../components/SearchWithResults";

export default function AdminDashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const userData = useQuery(
    api.users.getUserByToken,
    user?.id ? { tokenIdentifier: user.id } : "skip",
  );
  const subscription = useQuery(api.subscriptions.getUserSubscription);
  const getDashboardUrl = useAction(api.subscriptions.getUserDashboardUrl);

  // Check if user is admin
  if (userData?.role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBFBFD]">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Admin Access Required</CardTitle>
              <CardDescription>
                You need admin privileges to access this dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFD]">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Manage partner applications, learning materials, and deal registrations
            </p>
          </div>
          
          <Tabs defaultValue="applications">
            <TabsList className="mb-6">
              <TabsTrigger value="applications">Partner Applications</TabsTrigger>
              <TabsTrigger value="materials">Learning Materials</TabsTrigger>
              <TabsTrigger value="deals">Deal Registrations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="applications">
              <PartnerApplicationsTab />
            </TabsContent>
            
            <TabsContent value="materials">
              <LearningMaterialsTab />
            </TabsContent>
            
            <TabsContent value="deals">
              <DealRegistrationsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PartnerApplicationsTab() {
  const { toast } = useToast();
  const applications = useQuery(api.admin.getPartnerApplications) || [];
  const approveApplication = useMutation(api.admin.approvePartnerApplication);
  const rejectApplication = useMutation(api.admin.rejectPartnerApplication);
  
  const handleApprove = async (applicationId) => {
    try {
      await approveApplication({ applicationId });
      toast({
        title: "Application Approved",
        description: "The partner application has been approved.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: error.message || "There was an error approving the application.",
        variant: "destructive",
      });
    }
  };
  
  const handleReject = async (applicationId) => {
    try {
      await rejectApplication({ applicationId });
      toast({
        title: "Application Rejected",
        description: "The partner application has been rejected.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: error.message || "There was an error rejecting the application.",
        variant: "destructive",
      });
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      {applications.length > 0 ? (
        applications.map(app => (
          <Card key={app._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{app.companyName}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Building className="h-4 w-4 mr-1" />
                    {app.businessType}
                  </CardDescription>
                </div>
                <div>
                  {getStatusBadge(app.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Contact Information</h3>
                  <p className="mb-1"><span className="font-medium">Name:</span> {app.contactName}</p>
                  <p className="mb-1"><span className="font-medium">Email:</span> {app.contactEmail}</p>
                  {app.contactPhone && (
                    <p className="mb-1"><span className="font-medium">Phone:</span> {app.contactPhone}</p>
                  )}
                  {app.website && (
                    <p className="mb-1"><span className="font-medium">Website:</span> {app.website}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Application Details</h3>
                  <p className="mb-1"><span className="font-medium">Submitted:</span> {new Date(app.submittedAt).toLocaleDateString()}</p>
                  <p className="mb-3"><span className="font-medium">Reason for Partnership:</span></p>
                  <p className="text-gray-600 italic bg-gray-50 p-3 rounded-md">"{app.reasonForPartnership}"</p>
                </div>
              </div>
              
              {app.status === "pending" && (
                <div className="flex gap-3 mt-6 justify-end">
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleReject(app._id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(app._id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="mb-4">
            <Users className="h-12 w-12 mx-auto text-gray-300" />
          </div>
          <h3 className="text-lg font-medium mb-2">No pending applications</h3>
          <p className="text-gray-500">
            There are currently no partner applications to review
          </p>
        </div>
      )}
    </div>
  );
}

function LearningMaterialsTab() {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  
  const learningMaterials = useQuery(api.learningMaterials.getAllMaterials) || [];
  const addMaterial = useMutation(api.learningMaterials.addMaterial);
  const updateMaterial = useMutation(api.learningMaterials.updateMaterial);
  const deleteMaterial = useMutation(api.learningMaterials.deleteMaterial);
  
  // Function to get the appropriate icon and color based on resource type
  const getResourceTypeInfo = (type) => {
    switch (type) {
      case "presentation":
        return { 
          icon: <Presentation className="h-5 w-5 text-orange-500" />,
          bgColor: "bg-orange-50",
          textColor: "text-orange-700"
        };
      case "document":
        return { 
          icon: <FileText className="h-5 w-5 text-blue-500" />,
          bgColor: "bg-blue-50",
          textColor: "text-blue-700"
        };
      case "video":
        return { 
          icon: <Video className="h-5 w-5 text-purple-500" />,
          bgColor: "bg-purple-50",
          textColor: "text-purple-700"
        };
      case "link":
        return { 
          icon: <LinkIcon className="h-5 w-5 text-green-500" />,
          bgColor: "bg-green-50",
          textColor: "text-green-700"
        };
      case "case-study":
        return { 
          icon: <Briefcase className="h-5 w-5 text-amber-500" />,
          bgColor: "bg-amber-50",
          textColor: "text-amber-700"
        };
      default:
        return { 
          icon: <FileText className="h-5 w-5 text-gray-500" />,
          bgColor: "bg-gray-50",
          textColor: "text-gray-700"
        };
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert tags string to array
      const tagsArray = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag !== "");
      
      await addMaterial({
        title: formData.title,
        description: formData.description,
        link: formData.link,
        type: formData.type,
        tags: tagsArray,
        featured: formData.featured
      });
      
      toast({
        title: "Material Added",
        description: "The learning material has been added successfully.",
        variant: "success",
      });
      
      // Reset form and close add form
      setFormData({
        title: "",
        description: "",
        link: "",
        type: "",
        tags: "",
        featured: false
      });
      setIsAdding(false);
      
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error adding the material.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (materialId) => {
    try {
      await deleteMaterial({ id: materialId });
      toast({
        title: "Material Deleted",
        description: "The learning material has been deleted successfully.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Action Failed",
        description: error.message || "There was an error deleting the material.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Learning Materials</h2>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </div>
      
      {/* Material list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningMaterials.length > 0 ? (
          learningMaterials.map(material => {
            const typeInfo = getResourceTypeInfo(material.type);
            
            return (
              <Card key={material._id} className="transition-all duration-200 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${typeInfo.bgColor} ${typeInfo.textColor} text-xs font-medium`}>
                      {typeInfo.icon}
                      <span className="capitalize">{material.type}</span>
                    </div>
                    {material.featured && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{material.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{material.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3 line-clamp-3">{material.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {material.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                  {material.type === "video" && (
                    <div className="text-xs text-gray-500 flex items-center mb-3">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{material.duration || "Unknown duration"}</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    <span>Added: {new Date(material.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <a 
                    href={material.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 mr-2"
                  >
                    <Button variant="outline" className="w-full gap-2 hover:bg-gray-50">
                      {material.type === "video" ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                      {material.type === "video" ? "Watch" : "Open"}
                    </Button>
                  </a>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setEditingMaterial(material);
                        setIsEditing(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this material?")) {
                          try {
                            await deleteMaterial({ id: material._id });
                            toast({
                              title: "Material deleted",
                              description: "The learning material has been deleted successfully.",
                            });
                          } catch (error) {
                            toast({
                              title: "Error",
                              description: error.message || "Failed to delete material",
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <p className="text-gray-500 mb-4">
              Add your first learning material for partners to access
            </p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </div>
        )}
      </div>
      
      {/* Add Material Dialog */}
      {isAdding && (
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Learning Material</DialogTitle>
              <DialogDescription>
                Add a new learning material for partners to access.
              </DialogDescription>
            </DialogHeader>
            <AddMaterialForm 
              onSubmit={async (data) => {
                try {
                  await addMaterial(data);
                  setIsAdding(false);
                  toast({
                    title: "Material added",
                    description: "The learning material has been added successfully.",
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: error.message || "Failed to add material",
                    variant: "destructive",
                  });
                }
              }}
              onCancel={() => setIsAdding(false)}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Edit Material Dialog */}
      {isEditing && editingMaterial && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Learning Material</DialogTitle>
              <DialogDescription>
                Update the learning material details.
              </DialogDescription>
            </DialogHeader>
            <AddMaterialForm 
              initialData={editingMaterial}
              onSubmit={async (data) => {
                try {
                  await updateMaterial({
                    id: editingMaterial._id,
                    ...data,
                  });
                  setIsEditing(false);
                  toast({
                    title: "Material updated",
                    description: "The learning material has been updated successfully.",
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: error.message || "Failed to update material",
                    variant: "destructive",
                  });
                }
              }}
              onCancel={() => setIsEditing(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function AddMaterialForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    link: initialData?.link || "",
    type: initialData?.type || "document",
    tags: initialData?.tags || [],
    featured: initialData?.featured || false,
  });
  
  const [tagInput, setTagInput] = useState("");
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  
  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput],
      });
      setTagInput("");
    }
  };
  
  const removeTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  // Function to get the appropriate icon and color based on resource type
  const getResourceTypeInfo = (type) => {
    switch (type) {
      case "presentation":
        return { 
          icon: <Presentation className="h-5 w-5 text-orange-500" />,
          bgColor: "bg-orange-50",
          textColor: "text-orange-700"
        };
      case "document":
        return { 
          icon: <FileText className="h-5 w-5 text-blue-500" />,
          bgColor: "bg-blue-50",
          textColor: "text-blue-700"
        };
      case "video":
        return { 
          icon: <Video className="h-5 w-5 text-purple-500" />,
          bgColor: "bg-purple-50",
          textColor: "text-purple-700"
        };
      case "link":
        return { 
          icon: <LinkIcon className="h-5 w-5 text-green-500" />,
          bgColor: "bg-green-50",
          textColor: "text-green-700"
        };
      case "case-study":
        return { 
          icon: <Briefcase className="h-5 w-5 text-amber-500" />,
          bgColor: "bg-amber-50",
          textColor: "text-amber-700"
        };
      default:
        return { 
          icon: <FileText className="h-5 w-5 text-gray-500" />,
          bgColor: "bg-gray-50",
          textColor: "text-gray-700"
        };
    }
  };
  
  const typeInfo = getResourceTypeInfo(formData.type);
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="h-32 resize-y"
                placeholder="Enter a detailed description of the resource"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                name="link"
                value={formData.link}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                name="type"
                value={formData.type}
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="presentation">Presentation</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="case-study">Case Study</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="ml-2"
                  onClick={addTag}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                name="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => 
                  setFormData({...formData, featured: checked})
                }
              />
              <Label htmlFor="featured">Featured resource</Label>
            </div>
          </div>
          
          {/* Preview Card */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-3">Preview</h3>
            <Card className="transition-all duration-200 hover:shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${typeInfo.bgColor} ${typeInfo.textColor} text-xs font-medium`}>
                    {typeInfo.icon}
                    <span className="capitalize">{formData.type}</span>
                  </div>
                  {formData.featured && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                      Featured
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{formData.title || "Resource Title"}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {formData.description || "Resource description will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-4">
                  {formData.tags.length > 0 ? (
                    formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No tags added</span>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full gap-2 hover:bg-gray-50" disabled>
                  {formData.type === "video" ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                  {formData.type === "video" ? "Watch Video" : "Open Resource"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update" : "Add"} Material
        </Button>
      </DialogFooter>
    </form>
  );
}

function DealRegistrationsTab() {
  const { toast } = useToast();
  const deals = useQuery(api.admin.getAllDeals) || [];
  const approveDeal = useMutation(api.admin.approveDeal);
  const rejectDeal = useMutation(api.admin.rejectDeal);
  const closeDeal = useMutation(api.admin.closeDeal);
  
  // Add this to fetch all users to map partner IDs to names
  const users = useQuery(api.admin.getAllUsers) || [];
  
  // Add state for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState([]);
  
  // Add state for editing
  const [editingDeal, setEditingDeal] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  
  // Add these state variables for delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleteError, setDeleteError] = useState("");
  
  // Create a map of partner IDs to partner names
  const partnerMap = useMemo(() => {
    const map = {};
    users.forEach(user => {
      if (user.tokenIdentifier) {
        map[user.tokenIdentifier] = {
          name: user.name || "Unknown",
          companyName: user.companyName || "Unknown Company"
        };
      }
    });
    return map;
  }, [users]);
  
  // Get partner display name
  const getPartnerName = (partnerId) => {
    if (partnerMap[partnerId]) {
      return partnerMap[partnerId].companyName || partnerMap[partnerId].name;
    }
    return "Unknown Partner";
  };
  
  // Get unique partners from deals
  const uniquePartners = useMemo(() => {
    const partners = new Set();
    deals.forEach(deal => {
      partners.add(deal.partnerId);
    });
    return Array.from(partners).map(partnerId => ({
      id: partnerId,
      type: 'partner'
    }));
  }, [deals]);
  
  // Get unique customers from deals
  const uniqueCustomers = useMemo(() => {
    const customers = new Set();
    deals.forEach(deal => {
      customers.add(deal.customerName);
    });
    return Array.from(customers).map(customerName => ({
      name: customerName,
      type: 'customer'
    }));
  }, [deals]);
  
  // Filter deals based on selected filters
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      if (selectedFilters.length === 0) return true;
      
      return selectedFilters.some(filter => {
        if (filter.type === 'partner' && deal.partnerId === filter.id) {
          return true;
        } else if (filter.type === 'customer' && deal.customerName === filter.name) {
          return true;
        }
        return false;
      });
    });
  }, [deals, selectedFilters]);
  
  // Get search results
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    
    const partnerResults = uniquePartners.filter(partner => 
      getPartnerName(partner.id).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const customerResults = uniqueCustomers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return [...partnerResults, ...customerResults];
  }, [searchTerm, uniquePartners, uniqueCustomers, getPartnerName]);
  
  // Handle selection from search
  const handleSearchSelect = (item) => {
    // Check if already selected
    const isAlreadySelected = selectedFilters.some(filter => {
      if (filter.type === 'partner' && item.type === 'partner') {
        return filter.id === item.id;
      } else if (filter.type === 'customer' && item.type === 'customer') {
        return filter.name === item.name;
      }
      return false;
    });
    
    if (!isAlreadySelected) {
      setSelectedFilters([...selectedFilters, item]);
    }
  };
  
  // Clear selection
  const clearSelection = (item, clearAll = false) => {
    if (clearAll) {
      setSelectedFilters([]);
    } else {
      setSelectedFilters(selectedFilters.filter(filter => {
        if (filter.type === 'partner' && item.type === 'partner') {
          return filter.id !== item.id;
        } else if (filter.type === 'customer' && item.type === 'customer') {
          return filter.name !== item.name;
        }
        return true;
      }));
    }
  };
  
  // Get label for search result
  const getResultLabel = (item) => {
    if (item.type === 'partner') {
      return getPartnerName(item.id);
    } else if (item.type === 'customer') {
      return item.name;
    }
    return "";
  };
  
  // Get type of search result
  const getResultType = (item) => item.type;
  
  // Define the deal stages for our new workflow
  const dealStages = [
    { key: "new", label: "New" },
    { key: "registered", label: "Registered" },
    { key: "client_approval", label: "Client Approval" },
    { key: "won", label: "Won" },
    { key: "lost", label: "Lost" }
  ];
  
  // Function to update deal status
  const updateDealStatus = useMutation(api.admin.updateDealStatus);
  
  // Handle status change
  const handleStatusChange = async (dealId, newStatus) => {
    try {
      await updateDealStatus({ dealId, status: newStatus });
      toast({
        title: "Status updated",
        description: `Deal status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update deal status",
        variant: "destructive",
      });
      console.error(error);
    }
  };
  
  // Open edit dialog
  const openEditDialog = (deal) => {
    setEditingDeal(deal);
    setEditFormData({
      customerName: deal.customerName,
      customerEmail: deal.customerEmail,
      customerPhone: deal.customerPhone || "",
      customerAddress: deal.customerAddress || "",
      opportunityAmount: deal.opportunityAmount,
      expectedCloseDate: new Date(deal.expectedCloseDate).toISOString().split('T')[0],
      notes: deal.notes || "",
      status: deal.status,
      cameraCount: deal.cameraCount || 0,
      interestedUsecases: deal.interestedUsecases || [],
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle edit submit
  const updateDeal = useMutation(api.admin.updateDeal);
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDeal({
        dealId: editingDeal._id,
        ...editFormData,
        opportunityAmount: Number(editFormData.opportunityAmount),
        expectedCloseDate: new Date(editFormData.expectedCloseDate).getTime(),
        cameraCount: Number(editFormData.cameraCount),
      });
      
      setIsEditDialogOpen(false);
      toast({
        title: "Deal updated",
        description: "The deal has been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update deal",
        variant: "destructive",
      });
      console.error(error);
    }
  };
  
  // Update the renderStatusTimeline function to fix the hover tooltips
  const renderStatusTimeline = (currentStatus) => {
    // Find the index of the current status
    const currentIndex = dealStages.findIndex(stage => stage.key === currentStatus);
    
    return (
      <div className="relative flex items-center h-6">
        {/* The line connecting all circles */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0"></div>
        
        {/* Status circles */}
        <div className="relative flex justify-between w-full">
          {dealStages.map((stage, index) => {
            // Determine if this stage is active, completed, or upcoming
            const isActive = stage.key === currentStatus;
            const isCompleted = currentIndex > index;
            
            // Set the appropriate color based on status
            let bgColor = "bg-gray-200"; // default for upcoming
            let borderColor = "border-gray-200";
            
            if (isActive) {
              bgColor = "bg-blue-500";
              borderColor = "border-blue-500";
            } else if (isCompleted) {
              bgColor = "bg-green-500";
              borderColor = "border-green-500";
            }
            
            // Special case for "Lost" status
            if (stage.key === "lost" && currentStatus === "lost") {
              bgColor = "bg-red-500";
              borderColor = "border-red-500";
            }
            
            return (
              <div key={stage.key} className="relative group">
                {/* Circle - positioned on the line with border to ensure visibility */}
                <div 
                  className={`w-3 h-3 rounded-full ${bgColor} border-2 ${borderColor} z-10`}
                ></div>
                
                {/* Tooltip content - visible on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                  {stage.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Helper function to get status badge with appropriate color
  const getStatusBadge = (status) => {
    let color = "";
    let label = "";
    
    switch(status) {
      case "new":
        color = "bg-gray-100 text-gray-800 border-gray-200";
        label = "New";
        break;
      case "registered":
        color = "bg-blue-100 text-blue-800 border-blue-200";
        label = "Registered";
        break;
      case "client_approval":
        color = "bg-amber-100 text-amber-800 border-amber-200";
        label = "Client Approval";
        break;
      case "won":
        color = "bg-green-100 text-green-800 border-green-200";
        label = "Won";
        break;
      case "lost":
        color = "bg-red-100 text-red-800 border-red-200";
        label = "Lost";
        break;
      default:
        color = "bg-gray-100 text-gray-800 border-gray-200";
        label = status.charAt(0).toUpperCase() + status.slice(1);
    }
    
    return <Badge className={color}>{label}</Badge>;
  };
  
  // Function to register a deal (change status from New to Registered)
  const registerDeal = async (dealId) => {
    try {
      await updateDealStatus({ dealId, status: "registered" });
      toast({
        title: "Deal registered",
        description: "The deal has been successfully registered",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register deal",
        variant: "destructive",
      });
      console.error(error);
    }
  };
  
  // Add delete deal mutation
  const deleteDeal = useMutation(api.admin.deleteDeal);
  
  // Function to open delete confirmation dialog
  const openDeleteDialog = (deal) => {
    setDealToDelete(deal);
    setDeleteConfirmName("");
    setDeleteError("");
    setIsDeleteDialogOpen(true);
  };
  
  // Function to handle deal deletion
  const handleDeleteDeal = async () => {
    if (!dealToDelete) return;
    
    // Check if confirmation name matches
    if (deleteConfirmName !== dealToDelete.customerName) {
      setDeleteError("Customer name doesn't match. Please try again.");
      return;
    }
    
    try {
      await deleteDeal({ dealId: dealToDelete._id });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Deal deleted",
        description: "The deal has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete deal",
        variant: "destructive",
      });
      console.error(error);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Add search and filter section */}
      <div className="bg-white p-4 rounded-lg border mb-4">
        <SearchWithResults
          placeholder="Search by partner or customer..."
          onSearch={setSearchTerm}
          onSelect={handleSearchSelect}
          selectedItems={selectedFilters}
          getResultLabel={getResultLabel}
          getResultType={getResultType}
          results={searchResults}
          resultGroups={[
            { 
              type: 'partner', 
              label: 'Partners', 
              icon: <Building className="h-4 w-4 mr-2 text-gray-500" /> 
            },
            { 
              type: 'customer', 
              label: 'Customers', 
              icon: <Users className="h-4 w-4 mr-2 text-gray-500" /> 
            }
          ]}
          clearSelection={clearSelection}
        />
        
        {/* Show partner quick filters */}
        {uniquePartners.length > 0 && selectedFilters.length === 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-500 mb-2">Quick filters:</p>
            <div className="flex flex-wrap gap-2">
              {uniquePartners.map(partner => (
                <Badge 
                  key={partner.id}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 cursor-pointer"
                  onClick={() => handleSearchSelect(partner)}
                >
                  {getPartnerName(partner.id)}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Display filtered deals count */}
      <div className="text-sm text-gray-500 mb-2">
        Showing {filteredDeals.length} of {deals.length} deals
        {selectedFilters.length > 0 && " with selected filters"}
      </div>
      
      {filteredDeals.length > 0 ? (
        filteredDeals.map(deal => (
          <DealCard 
            key={deal._id}
            deal={deal}
            isAdmin={true}
            onPartnerClick={handleSearchSelect}
            getPartnerName={getPartnerName}
            refreshDeals={() => {}} // You can implement a refresh function if needed
          />
        ))
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="mb-4">
            <SearchX className="h-12 w-12 mx-auto text-gray-300" />
          </div>
          <h3 className="text-lg font-medium mb-2">No deals found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || selectedFilters.length > 0 
              ? "Try adjusting your search or filters" 
              : "No deals have been registered yet"}
          </p>
          {(searchTerm || selectedFilters.length > 0) && (
            <Button onClick={clearSelection}>
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string | undefined }) {
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "active":
        return "bg-[#E3F3E3] text-[#1D7D1D]";
      case "canceled":
        return "bg-[#FFE7E7] text-[#D70015]";
      case "past_due":
        return "bg-[#FFF4E5] text-[#FF9500]";
      default:
        return "bg-[#F5F5F7] text-[#86868B]";
    }
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(status)}`}
    >
      {status || "No status"}
    </span>
  );
}

function formatDate(timestamp: number | undefined) {
  if (!timestamp) return "—";
  return new Date(timestamp * 1000).toLocaleDateString();
}

function formatCurrency(amount: number | undefined, currency: string = "USD") {
  if (amount === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount / 100);
}

function getPercentageTimeElapsed(
  startTimestamp: number | undefined,
  endTimestamp: number | undefined,
) {
  if (!startTimestamp || !endTimestamp) return 0;

  const start = startTimestamp * 1000;
  const end = endTimestamp * 1000;
  const now = Date.now();

  if (now <= start) return 0;
  if (now >= end) return 100;

  const totalDuration = end - start;
  const elapsed = now - start;

  return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
}

function PlanOption({
  name,
  price,
  interval,
  features,
  current,
  discount,
}: {
  name: string;
  price: string;
  interval: string;
  features: string[];
  current?: boolean;
  discount?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border rounded-lg p-6 ${current ? "border-[#0066CC]" : ""}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-medium">{name}</h3>
            {current && (
              <Badge className="ml-2 bg-[#0066CC]/10 text-[#0066CC] border-[#0066CC]/20">
                Current Plan
              </Badge>
            )}
            {discount && !current && (
              <Badge className="ml-2 bg-[#0066CC]/10 text-[#0066CC] border-[#0066CC]/20">
                {discount}
              </Badge>
            )}
          </div>
          <p className="text-2xl font-bold mt-2">
            {price}
            <span className="text-sm font-normal text-[#86868B]">
              /{interval}
            </span>
          </p>
        </div>
        <Button variant={current ? "outline" : "default"} disabled={current}>
          {current ? "Current Plan" : "Switch Plan"}
        </Button>
      </div>

      <div className="mt-4">
        <Button
          variant="link"
          className="p-0 h-auto text-[#0066CC]"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide" : "Show"} details
          {expanded ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          )}
        </Button>

        {expanded && (
          <ul className="mt-4 space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="h-4 w-4 text-[#0066CC] mr-2" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
