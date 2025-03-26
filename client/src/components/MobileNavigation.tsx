import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreatePostModal from "./CreatePostModal";

export default function MobileNavigation() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [createPostOpen, setCreatePostOpen] = useState(false);

  // Navigation items
  const navItems = [
    {
      icon: <Home className="h-6 w-6" />,
      isActive: location === "/",
      action: () => navigate("/"),
    },
    {
      icon: <Search className="h-6 w-6" />,
      isActive: false,
      action: () => {},
    },
    {
      icon: <PlusSquare className="h-6 w-6" />,
      isActive: false,
      action: () => setCreatePostOpen(true),
    },
    {
      icon: <Heart className="h-6 w-6" />,
      isActive: false,
      action: () => {},
    },
    {
      icon: user && user.profileImage ? (
        <Avatar className="h-7 w-7">
          <AvatarImage src={user.profileImage} alt={user.username} />
          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
      ) : (
        <User className="h-6 w-6" />
      ),
      isActive: location.startsWith("/profile"),
      action: () => user && navigate(`/profile/${user.username}`),
    },
  ];

  return (
    <>
      <nav className="md:hidden bg-white border-t border-[#DBDBDB] fixed bottom-0 left-0 right-0 z-10">
        <div className="flex justify-around items-center h-14">
          {navItems.map((item, i) => (
            <button
              key={i}
              className={`flex items-center justify-center ${
                item.isActive ? "text-black" : "text-gray-600"
              }`}
              onClick={item.action}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </nav>
      
      <CreatePostModal 
        isOpen={createPostOpen} 
        onClose={() => setCreatePostOpen(false)} 
      />
    </>
  );
}
