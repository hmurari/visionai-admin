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
import { ChevronDown, FileText, BarChart3, UserPlus, Settings } from "lucide-react";

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
  
  // Only query if the function exists
  const applicationStatus = useQuery(
    hasPartnersAPI ? api.partners.getApplicationStatus : null
  );
  
  const isAdmin = userData?.role === "admin";
  const isPartner = userData?.role === "partner";
  
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
              <NavLink to="/dashboard" current={location.pathname === "/dashboard"}>
                Resources
              </NavLink>
              
              {isPartner && (
                <NavLink to="/deal-registration" current={location.pathname === "/deal-registration"}>
                  Deal Registration
                </NavLink>
              )}
              
              {!isPartner && !applicationStatus && (
                <NavLink to="/partner-application" current={location.pathname === "/partner-application"}>
                  Apply as Partner
                </NavLink>
              )}
              
              {isAdmin && (
                <NavLink to="/admin" current={location.pathname === "/admin"}>
                  Admin Dashboard
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
                <div className="px-2 py-1.5 text-sm font-medium">
                  {userData?.companyName && (
                    <div className="text-gray-500 text-xs mb-1">{userData.companyName}</div>
                  )}
                  <div>{user.fullName || user.username}</div>
                  <div className="text-gray-500 text-xs">{user.primaryEmailAddress?.emailAddress}</div>
                </div>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center cursor-pointer">
                    <FileText className="mr-2 h-4 w-4" />
                    Resources
                  </Link>
                </DropdownMenuItem>
                
                {isPartner && (
                  <DropdownMenuItem asChild>
                    <Link to="/deal-registration" className="flex items-center cursor-pointer">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Deal Registration
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {!isPartner && !applicationStatus && (
                  <DropdownMenuItem asChild>
                    <Link to="/partner-application" className="flex items-center cursor-pointer">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Apply as Partner
                    </Link>
                  </DropdownMenuItem>
                )}
                
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Dashboard
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
