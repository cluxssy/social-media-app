import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Stories() {
  const [, navigate] = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  // Fetch all users for stories
  // In a real app, this would fetch only users with active stories
  const { data: users, isLoading } = useQuery<User[]>({ 
    queryKey: ["/api/users/search", ""],
  });

  // Handle scroll buttons
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftButton(scrollLeft > 20);
      setShowRightButton(scrollLeft + clientWidth < scrollWidth - 20);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white border border-[#DBDBDB] rounded-lg my-4 overflow-hidden md:mb-6 relative">
      {/* Scroll buttons */}
      {showLeftButton && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md z-10 h-8 w-8"
          onClick={scrollLeft}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      
      {showRightButton && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md z-10 h-8 w-8"
          onClick={scrollRight}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      )}
      
      {/* Stories container */}
      <div 
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto px-4 py-4 scrollbar-hide"
        onScroll={handleScroll}
      >
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-1 flex-shrink-0">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))
        ) : users && users.length > 0 ? (
          users.map((user) => (
            <div 
              key={user.id} 
              className="flex flex-col items-center space-y-1 flex-shrink-0 cursor-pointer"
              onClick={() => navigate(`/profile/${user.username}`)}
            >
              <div className="story-ring bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCB045] p-[2px] rounded-full">
                <div className="bg-white p-[2px] rounded-full">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={user.profileImage} alt={user.username} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs text-[#262626]">{user.username}</span>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center w-full py-2">
            <p className="text-sm text-gray-500">No stories available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
