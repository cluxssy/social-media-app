import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { 
  Home, 
  Search, 
  PlusSquare, 
  Heart, 
  Compass,
  Send,
  LogOut,
  User as UserIcon,
} from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  // Search users query
  const { 
    data: searchResults,
    isFetching,
  } = useQuery<User[]>({ 
    queryKey: ["/api/users/search", searchQuery],
    enabled: searchQuery.length > 0 && showSearch,
  });

  // Navigation items
  const navItems = [
    {
      icon: <Home className="h-6 w-6" />,
      label: "Home",
      onClick: () => navigate("/"),
    },
    {
      icon: <Send className="h-6 w-6" />,
      label: "Messages",
      onClick: () => {},
    },
    {
      icon: <PlusSquare className="h-6 w-6" />,
      label: "Create",
      onClick: () => {},
    },
    {
      icon: <Compass className="h-6 w-6" />,
      label: "Explore",
      onClick: () => {},
    },
    {
      icon: <Heart className="h-6 w-6" />,
      label: "Notifications",
      onClick: () => {},
    },
  ];

  return (
    <header className="bg-white border-b border-[#DBDBDB] sticky top-0 z-10 hidden md:block">
      <div className="container mx-auto max-w-screen-lg flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <div 
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate("/")}
        >
          InstaClone
        </div>
        
        {/* Search */}
        <div className="w-64">
          <Popover open={showSearch} onOpenChange={setShowSearch}>
            <PopoverTrigger asChild>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search"
                  className="bg-gray-100 rounded-lg px-4 py-1 w-full focus:outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearch(true)}
                />
                <Search className="absolute right-3 top-2 h-4 w-4 text-gray-500" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="center">
              {searchQuery ? (
                <div className="py-2">
                  {isFetching ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Searching...
                    </div>
                  ) : searchResults && searchResults.length > 0 ? (
                    <div>
                      {searchResults.map((result) => (
                        <div 
                          key={result.id}
                          className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            navigate(`/profile/${result.username}`);
                            setShowSearch(false);
                          }}
                        >
                          {result.profileImage ? (
                            <img 
                              src={result.profileImage} 
                              alt={result.username} 
                              className="w-8 h-8 rounded-full mr-2" 
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                              <UserIcon className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-sm">{result.username}</div>
                            <div className="text-xs text-gray-500">{result.fullName}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No results found.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">
                  Search for users.
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center space-x-5">
          {navItems.map((item, index) => (
            <Button 
              key={index}
              variant="ghost" 
              size="icon"
              className="text-gray-800 hover:bg-transparent hover:text-black"
              onClick={item.onClick}
            >
              {item.icon}
            </Button>
          ))}
          
          {/* User profile menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.username} 
                      className="w-7 h-7 rounded-full cursor-pointer" 
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/profile/${user.username}`)}>
                  <UserIcon className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
