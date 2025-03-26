import { Link, useLocation } from "react-router-dom";
import { SignInButton, SignOutButton, useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, FileText, BarChart3, UserPlus, Settings, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { isSignedIn, user } = useUser();
  const location = useLocation();
  
  // Check if the API functions exist before trying to use them
  const hasPartnersAPI = !!api.partners?.getApplicationStatus;
  const hasUsersAPI = !!api.users?.getUserByToken;
  
  const userData = useQuery(
    hasUsersAPI ? api.users.getUserByToken : null,
    hasUsersAPI && user?.id ? { tokenIdentifier: user.id } : "skip"
  );
  
  // Only query if the function exists and ensure we get a string value
  const applicationStatusData = useQuery(
    hasPartnersAPI ? api.partners.getApplicationStatus : null
  );
  
  // Convert application status to a string to avoid rendering objects
  const applicationStatus = typeof applicationStatusData === 'string' 
    ? applicationStatusData 
    : applicationStatusData && applicationStatusData.status 
      ? applicationStatusData.status 
      : 'pending';
  
  const isAdmin = userData?.role === "admin";
  const isPartner = userData?.role === "partner";
  const isPendingPartner = applicationStatus && applicationStatus !== "approved";
  const isApprovedPartner = isPartner && applicationStatus === "approved";
  
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex flex-col items-center">
            <img src="/Logo.svg" alt="Logo" className="h-8 w-auto" />
            <span className="text-sm font-medium text-gray-800">Partner Portal</span>
          </Link>
          
          {isSignedIn && (
            <nav className="ml-10 hidden md:flex space-x-6">
              {/* Only show these links if user is an approved partner or admin */}
              {(isApprovedPartner || isAdmin) && (
                <>
                  <NavLink to="/dashboard" current={location.pathname === "/dashboard"}>
                    Resources
                  </NavLink>
                  
                  <NavLink to="/customers" current={location.pathname === "/customers"}>
                    Customers
                  </NavLink>
                  
                  <NavLink to="/deal-registration" current={location.pathname === "/deal-registration"}>
                    Deals
                  </NavLink>
                  
                  <NavLink to="/quotes" current={location.pathname === "/quotes"}>
                    Quotes
                  </NavLink>
                </>
              )}
              
              {/* Show application status for pending partners */}
              {isPendingPartner && (
                <NavLink to="/partner-application" current={location.pathname === "/partner-application"}>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-amber-500" />
                    Application {typeof applicationStatus === 'string' ? applicationStatus : 'pending'}
                  </div>
                </NavLink>
              )}
              
              {/* Show apply link for non-partners */}
              {!isPartner && !applicationStatus && (
                <NavLink to="/partner-application" current={location.pathname === "/partner-application"}>
                  Apply as Partner
                </NavLink>
              )}
              
              {/* Always show admin dashboard for admins */}
              {isAdmin && (
                <NavLink to="/admin" current={location.pathname === "/admin"}>
                  Admin
                </NavLink>
              )}
            </nav>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.imageUrl} alt={user.fullName || ""} />
                    <AvatarFallback>
                      {user.fullName?.charAt(0) || user.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user.fullName || user.username}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <div className="text-sm font-medium">{user.fullName || user.username}</div>
                  <div className="text-xs text-gray-500">{user.primaryEmailAddress?.emailAddress}</div>
                  {isAdmin && (
                    <div className="mt-1">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                        Admin
                      </span>
                    </div>
                  )}
                  {isPartner && (
                    <div className="mt-1">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                        Partner
                      </span>
                    </div>
                  )}
                  {isPendingPartner && (
                    <div className="mt-1">
                      <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded">
                        Application {typeof applicationStatus === 'string' ? applicationStatus : 'pending'}
                      </span>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                
                {/* Only show these menu items if user is an approved partner or admin */}
                {(isApprovedPartner || isAdmin) && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        Resources
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/customers" className="flex items-center cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        Customers
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link to="/deal-registration" className="flex items-center cursor-pointer">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Deals
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/quotes" className="flex items-center cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        Quotes
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                {/* Show application status for pending partners */}
                {isPendingPartner && (
                  <DropdownMenuItem asChild>
                    <Link to="/partner-application" className="flex items-center cursor-pointer">
                      <Clock className="mr-2 h-4 w-4 text-amber-500" />
                      Application Status
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {/* Show apply link for non-partners */}
                {!isPartner && !applicationStatus && (
                  <DropdownMenuItem asChild>
                    <Link to="/partner-application" className="flex items-center cursor-pointer">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Apply as Partner
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {/* Always show admin dashboard for admins */}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <SignOutButton>
                    <div className="w-full cursor-pointer">Sign out</div>
                  </SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, current, children }) {
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors hover:text-[#0066CC] ${
        current ? "text-[#0066CC]" : "text-gray-600"
      }`}
    >
      {children}
    </Link>
  );
}
