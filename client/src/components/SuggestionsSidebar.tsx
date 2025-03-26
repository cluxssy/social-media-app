import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuggestionsSidebar() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Fetch users for suggestions
  const { data: users, isLoading } = useQuery<User[]>({ 
    queryKey: ["/api/users/search", ""],
    enabled: !!user,
  });

  // Filter out current user and limit to 5 suggestions
  const suggestions = users
    ?.filter(u => u.id !== user?.id)
    .slice(0, 5);

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: (username: string) => 
      apiRequest("POST", `/api/users/${username}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/search"] });
    }
  });

  const handleFollow = (username: string) => {
    if (!followMutation.isPending) {
      followMutation.mutate(username);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="hidden md:block md:w-4/12 pt-4">
      {/* User Profile */}
      <div className="flex items-center mb-6">
        <Avatar className="w-14 h-14 mr-4">
          <AvatarImage src={user.profileImage} alt={user.username} />
          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <div 
            className="font-semibold cursor-pointer"
            onClick={() => navigate(`/profile/${user.username}`)}
          >
            {user.username}
          </div>
          <div className="text-[#8E8E8E] text-sm">{user.fullName}</div>
        </div>
        <Button 
          variant="link" 
          className="ml-auto text-[#0095F6] text-xs font-semibold"
          onClick={() => navigate("/login")}
        >
          Switch
        </Button>
      </div>
      
      {/* Suggestions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-[#8E8E8E] font-semibold text-sm">Suggestions For You</span>
          <Button variant="link" className="text-xs font-semibold p-0 h-auto">
            See All
          </Button>
        </div>
        
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Skeleton className="w-8 h-8 rounded-full mr-3" />
                <div>
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-2 w-32" />
                </div>
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))
        ) : suggestions && suggestions.length > 0 ? (
          suggestions.map((suggestion) => (
            <div key={suggestion.id} className="flex items-center justify-between mb-3">
              <div 
                className="flex items-center cursor-pointer"
                onClick={() => navigate(`/profile/${suggestion.username}`)}
              >
                <Avatar className="w-8 h-8 mr-3">
                  <AvatarImage src={suggestion.profileImage} alt={suggestion.username} />
                  <AvatarFallback>{suggestion.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold">{suggestion.username}</div>
                  <div className="text-xs text-[#8E8E8E]">Suggested for you</div>
                </div>
              </div>
              <Button
                variant="link"
                className="text-[#0095F6] text-xs font-semibold p-0 h-auto"
                onClick={() => handleFollow(suggestion.username)}
                disabled={followMutation.isPending}
              >
                Follow
              </Button>
            </div>
          ))
        ) : (
          <div className="text-sm text-[#8E8E8E] mb-4">
            No suggestions available.
          </div>
        )}
        
        {/* Footer Links */}
        <div className="text-xs text-[#8E8E8E]">
          <div className="mb-4">
            <a href="#" className="mr-2">About</a> · 
            <a href="#" className="mx-2">Help</a> · 
            <a href="#" className="mx-2">Press</a> · 
            <a href="#" className="mx-2">API</a> · 
            <a href="#" className="mx-2">Jobs</a> · 
            <a href="#" className="mx-2">Privacy</a> · 
            <a href="#" className="mx-2">Terms</a> · 
            <a href="#" className="mx-2">Locations</a> · 
            <a href="#" className="mx-2">Language</a>
          </div>
          <div>
            © 2023 INSTACLONE
          </div>
        </div>
      </div>
    </div>
  );
}
