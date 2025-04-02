import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Building, 
  Users, 
  Briefcase, 
  MapPin, 
  BarChart3, 
  FileText 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CountrySelect, countries } from "@/components/ui/country-select";
import { IndustrySelect, industries } from "@/components/ui/industry-select";

export function UserProfileView({ 
  user, 
  isOpen, 
  onClose, 
  isAdmin = false, 
  onDelete = null,
  isEditable = false 
}) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: user?.name || "",
    companyName: user?.companyName || "",
    companySize: user?.companySize || "",
    industryFocus: user?.industryFocus || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    zip: user?.zip || "",
    country: user?.country || "",
    website: user?.website || "",
    annualRevenue: user?.annualRevenue || "",
    reasonForPartnership: user?.reasonForPartnership || "",
  });
  
  const updateProfile = useMutation(api.users.updateProfile);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (field, value) => {
    setProfileFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileFormData);
      toast({
        title: "Profile Updated",
        description: "Profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating the profile.",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = () => {
    if (onDelete && user) {
      const displayName = user.name || user.companyName || "this user";
      onDelete(user.tokenIdentifier, displayName);
      setIsDeleteConfirmOpen(false);
      onClose();
    } else {
      toast({
        title: "Delete Failed",
        description: "Missing user information. Please try again.",
        variant: "destructive",
      });
      setIsDeleteConfirmOpen(false);
    }
  };
  
  // Get country name from code
  const countryInfo = user?.country
    ? countries.find(c => c.code === user.country)
    : null;
    
  const countryDisplay = countryInfo 
    ? `${countryInfo.flag} ${countryInfo.name}` 
    : null;
    
  // Get industry name from id
  const industryInfo = user?.industry
    ? industries.find(i => i.id === user.industry)
    : null;
    
  const industryDisplay = industryInfo
    ? industryInfo.name
    : null;
    
  // Get industry focus name from id
  const industryFocusInfo = user?.industryFocus
    ? industries.find(i => i.id === user.industryFocus)
    : null;
    
  const industryFocusDisplay = industryFocusInfo
    ? industryFocusInfo.name
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Profile" : "User Profile"}</DialogTitle>
          {!isEditing && (
            <DialogDescription>
              View user profile information and details.
            </DialogDescription>
          )}
        </DialogHeader>
        
        {isEditing ? (
          <form onSubmit={handleProfileSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={profileFormData.name}
                  onChange={handleProfileChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="companyName" className="text-right">
                  Company
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={profileFormData.companyName}
                  onChange={handleProfileChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="companySize" className="text-right">
                  Company Size
                </Label>
                <Input
                  id="companySize"
                  name="companySize"
                  value={profileFormData.companySize}
                  onChange={handleProfileChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="industryFocus" className="text-right">
                  Industry Focus
                </Label>
                <div className="col-span-3">
                  <IndustrySelect
                    value={profileFormData.industryFocus}
                    onChange={(value) => handleSelectChange("industryFocus", value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="annualRevenue" className="text-right">
                  Annual Revenue
                </Label>
                <Input
                  id="annualRevenue"
                  name="annualRevenue"
                  value={profileFormData.annualRevenue}
                  onChange={handleProfileChange}
                  className="col-span-3"
                  placeholder="e.g. $1-5 million"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={profileFormData.phone}
                  onChange={handleProfileChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="website" className="text-right">
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  value={profileFormData.website}
                  onChange={handleProfileChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  name="address"
                  value={profileFormData.address}
                  onChange={handleProfileChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city" className="text-right">
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={profileFormData.city}
                  onChange={handleProfileChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="state" className="text-right">
                  State
                </Label>
                <Input
                  id="state"
                  name="state"
                  value={profileFormData.state}
                  onChange={handleProfileChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="zip" className="text-right">
                  Zip
                </Label>
                <Input
                  id="zip"
                  name="zip"
                  value={profileFormData.zip}
                  onChange={handleProfileChange}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="country" className="text-right">
                  Country
                </Label>
                <div className="col-span-3">
                  <CountrySelect
                    value={profileFormData.country}
                    onChange={(value) => handleSelectChange("country", value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="reasonForPartnership" className="text-right pt-2">
                  Partnership Reason
                </Label>
                <Textarea
                  id="reasonForPartnership"
                  name="reasonForPartnership"
                  value={profileFormData.reasonForPartnership}
                  onChange={handleProfileChange}
                  className="col-span-3"
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        ) : (
          <div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user?.name}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  {user?.companyName && (
                    <div className="flex items-start">
                      <span className="flex items-center text-muted-foreground min-w-32">
                        <Building className="h-4 w-4 mr-2" />
                        <span className="mr-2">Company:</span>
                      </span>
                      <p className="text-gray-700">{user.companyName}</p>
                    </div>
                  )}
                  
                  {user?.companySize && (
                    <div className="flex items-start">
                      <span className="flex items-center text-muted-foreground min-w-32">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="mr-2">Company Size:</span>
                      </span>
                      <p className="text-gray-700">{user.companySize}</p>
                    </div>
                  )}
                  
                  {industryDisplay && (
                    <div className="flex items-start">
                      <span className="flex items-center text-muted-foreground min-w-32">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <span className="mr-2">Industry:</span>
                      </span>
                      <p className="text-gray-700">{industryDisplay}</p>
                    </div>
                  )}
                  
                  {industryFocusDisplay && (
                    <div className="flex items-start">
                      <span className="flex items-center text-muted-foreground min-w-32">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <span className="mr-2">Industry Focus:</span>
                      </span>
                      <p className="text-gray-700">{industryFocusDisplay}</p>
                    </div>
                  )}
                  
                  {user?.annualRevenue && (
                    <div className="flex items-start">
                      <span className="flex items-center text-muted-foreground min-w-32">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        <span className="mr-2">Annual Revenue:</span>
                      </span>
                      <p className="text-gray-700">{user.annualRevenue}</p>
                    </div>
                  )}
                  
                  {user?.phone && (
                    <div className="flex items-start">
                      <span className="flex items-center text-muted-foreground min-w-32">
                        <Phone className="h-4 w-4 mr-2" />
                        <span className="mr-2">Phone:</span>
                      </span>
                      <p className="text-gray-700">{user.phone}</p>
                    </div>
                  )}
                  
                  {user?.website && (
                    <div className="flex items-start">
                      <span className="flex items-center text-muted-foreground min-w-32">
                        <Globe className="h-4 w-4 mr-2" />
                        <span className="mr-2">Website:</span>
                      </span>
                      <p className="text-gray-700">
                        <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-blue-600 hover:underline">
                          {user.website}
                        </a>
                      </p>
                    </div>
                  )}
                  
                  {(user?.address || user?.city || user?.state || user?.zip || countryDisplay) && (
                    <div className="flex items-start">
                      <span className="flex items-center text-muted-foreground min-w-32">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="mr-2">Address:</span>
                      </span>
                      <div className="text-gray-700">
                        {user?.address && <p>{user.address}</p>}
                        <p>
                          {[
                            user?.city,
                            user?.state,
                            user?.zip
                          ].filter(Boolean).join(", ")}
                        </p>
                        {countryDisplay && <p>{countryDisplay}</p>}
                      </div>
                    </div>
                  )}
                  
                  {user?.reasonForPartnership && (
                    <div className="flex items-start">
                      <span className="flex items-center text-muted-foreground min-w-32">
                        <Users className="h-4 w-4 mr-2" />
                        <span className="mr-2">Partnership Reason:</span>
                      </span>
                      <p className="text-gray-700">{user.reasonForPartnership}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center mt-4">
                    <span className="font-medium mr-2">Role:</span>
                    <Badge variant={user?.role === "admin" ? "destructive" : user?.role === "partner" ? "default" : "outline"}>
                      {user?.role || "user"}
                    </Badge>
                  </div>
                  
                  {user?.partnerStatus && (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Partner Status:</span>
                      <Badge variant={user?.partnerStatus === "active" ? "default" : "outline"}>
                        {user?.partnerStatus}
                      </Badge>
                    </div>
                  )}
                  
                  {user?.joinDate && (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Join Date:</span>
                      <span>{new Date(user.joinDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <DialogFooter className="flex justify-between mt-4">
              <div>
                {isAdmin && (
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsDeleteConfirmOpen(true)}
                  >
                    Delete User
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                {isEditable && (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
      
      {/* Delete confirmation dialog */}
      {isDeleteConfirmOpen && (
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete User</DialogTitle>
              <DialogDescription>
                This action cannot be undone. The user will need to sign up again and reapply to become a partner.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-4">Are you sure you want to delete this user?</p>
              <p className="font-medium">{user?.name || user?.companyName}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
} 