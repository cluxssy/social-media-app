import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { UserWithStats } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Grid, LayoutGrid, Bookmark, UserCircle } from "lucide-react";

interface ProfileProps {
  username: string;
}

export default function Profile({ username }: ProfileProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("posts");

  // Fetch profile data
  const { 
    data: profile, 
    isLoading, 
    error 
  } = useQuery<UserWithStats>({ 
    queryKey: [`/api/users/${username}`],
    enabled: !!username
  });

  // Follow/Unfollow mutations
  const followMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/users/${username}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${username}`] });
      toast({
        title: "Success",
        description: `You are now following ${username}`,
      });
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/users/${username}/follow`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${username}`] });
      toast({
        title: "Success",
        description: `You have unfollowed ${username}`,
      });
    }
  });

  // Handle follow/unfollow
  const handleFollowToggle = () => {
    if (!profile) return;
    
    if (profile.isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  // Show error toast on query failure
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Check if viewing own profile
  const isOwnProfile = user?.username === username;

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <Header />

      {/* Profile Content */}
      <div className="container mx-auto max-w-screen-lg px-4 pb-16 md:pb-8">
        {/* Profile Header */}
        <div className="pt-8 pb-10">
          {isLoading ? (
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-1/3 flex justify-center md:justify-start">
                <Skeleton className="w-24 h-24 md:w-36 md:h-36 rounded-full" />
              </div>
              <div className="w-full md:w-2/3 mt-4 md:mt-0">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-10 w-32 mb-4" />
                <div className="flex space-x-8 my-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-5 w-36 mb-2" />
                <Skeleton className="h-4 w-full max-w-md mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ) : profile ? (
            <div className="flex flex-col md:flex-row">
              {/* Profile Picture */}
              <div className="w-full md:w-1/3 flex justify-center md:justify-start">
                {profile.profileImage ? (
                  <img 
                    src={profile.profileImage} 
                    alt={profile.username} 
                    className="w-24 h-24 md:w-36 md:h-36 rounded-full object-cover" 
                  />
                ) : (
                  <div className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-gray-200 flex items-center justify-center">
                    <UserCircle className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="w-full md:w-2/3 mt-4 md:mt-0">
                <div className="flex flex-col md:flex-row md:items-center">
                  <h1 className="text-xl font-light mb-4 md:mb-0 md:mr-4">{profile.username}</h1>
                  {isOwnProfile ? (
                    <Button 
                      variant="outline" 
                      className="bg-transparent border border-[#DBDBDB] text-[#262626] font-semibold py-1 px-3 rounded text-sm mb-3 md:mb-0 md:mr-2"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Button 
                      variant={profile.isFollowing ? "outline" : "default"}
                      className={`font-semibold py-1 px-4 rounded text-sm mb-3 md:mb-0 md:mr-2 ${
                        profile.isFollowing 
                          ? "bg-transparent border border-[#DBDBDB] text-[#262626]" 
                          : "bg-[#0095F6] text-white"
                      }`}
                      onClick={handleFollowToggle}
                      disabled={followMutation.isPending || unfollowMutation.isPending}
                    >
                      {profile.isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                </div>
                
                {/* Stats */}
                <div className="flex space-x-8 my-4">
                  <div><span className="font-semibold">{profile.postCount}</span> posts</div>
                  <div><span className="font-semibold">{profile.followerCount}</span> followers</div>
                  <div><span className="font-semibold">{profile.followingCount}</span> following</div>
                </div>
                
                {/* Bio */}
                <div>
                  <div className="font-semibold">{profile.fullName}</div>
                  {profile.bio && <p>{profile.bio}</p>}
                </div>
              </div>
            </div>
          ) : null}
        </div>
        
        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-t border-[#DBDBDB]">
            <TabsList className="w-full flex justify-center">
              <TabsTrigger 
                value="posts" 
                className="px-4 py-3 text-sm font-semibold flex items-center"
              >
                <LayoutGrid className="mr-1 h-4 w-4" /> POSTS
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="px-4 py-3 text-sm font-semibold flex items-center"
              >
                <Bookmark className="mr-1 h-4 w-4" /> SAVED
              </TabsTrigger>
              <TabsTrigger 
                value="tagged" 
                className="px-4 py-3 text-sm font-semibold flex items-center"
              >
                <UserCircle className="mr-1 h-4 w-4" /> TAGGED
              </TabsTrigger>
            </TabsList>
          </div>
            
          <TabsContent value="posts">
            {isLoading ? (
              <div className="grid grid-cols-3 gap-1 md:gap-5 mt-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-square w-full" />
                ))}
              </div>
            ) : profile?.posts && profile.posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 md:gap-5 mt-1">
                {profile.posts.map((post) => (
                  <div 
                    key={post.id}
                    className="relative pb-[100%] bg-gray-100 cursor-pointer"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <img 
                      src={post.imageUrl} 
                      alt="Post" 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black bg-opacity-30 transition-opacity">
                      <div className="flex items-center mr-3 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                        <span>-</span>
                      </div>
                      <div className="flex items-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <span>-</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <Grid className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Posts Yet</h2>
                <p className="text-[#8E8E8E] text-center max-w-md">
                  {isOwnProfile 
                    ? "When you share photos, they will appear on your profile."
                    : `When ${profile?.username} shares photos, they will appear here.`
                  }
                </p>
                {isOwnProfile && (
                  <Button 
                    className="mt-4 bg-[#0095F6] hover:bg-[#0095F6]/90 text-white"
                  >
                    Share Your First Photo
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
            
          <TabsContent value="saved">
            <div className="flex flex-col items-center justify-center py-10">
              <Bookmark className="h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Only You Can See What You've Saved</h2>
              <p className="text-[#8E8E8E] text-center max-w-md">
                Save photos and videos that you want to see again. No one is notified, and only you can see what you've saved.
              </p>
            </div>
          </TabsContent>
            
          <TabsContent value="tagged">
            <div className="flex flex-col items-center justify-center py-10">
              <UserCircle className="h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Photos</h2>
              <p className="text-[#8E8E8E] text-center max-w-md">
                When people tag you in photos, they'll appear here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
