import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { PostWithDetails } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

import Header from "@/components/Header";
import Stories from "@/components/Stories";
import Post from "@/components/Post";
import SuggestionsSidebar from "@/components/SuggestionsSidebar";
import MobileNavigation from "@/components/MobileNavigation";

import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch feed posts
  const { 
    data: posts, 
    isLoading, 
    error 
  } = useQuery<PostWithDetails[]>({ 
    queryKey: ["/api/feed"],
    enabled: !!user
  });

  // Show error toast on query failure
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <Header />

      {/* Main Content */}
      <main className="flex-grow container mx-auto max-w-screen-lg px-0 md:px-4 flex flex-col md:flex-row">
        {/* Feed Section */}
        <div className="w-full md:w-8/12 md:pr-8">
          {/* Stories */}
          <Stories />

          {/* Posts */}
          <div className="flex flex-col space-y-4 md:space-y-6 pb-16 md:pb-8">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i} 
                  className="bg-white border border-[#DBDBDB] rounded-lg overflow-hidden"
                >
                  <div className="flex items-center p-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="ml-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="w-full h-[400px]" />
                  <div className="p-3">
                    <Skeleton className="h-6 w-32 mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))
            ) : posts && posts.length > 0 ? (
              posts.map((post) => (
                <Post key={post.id} post={post} />
              ))
            ) : (
              <div className="bg-white border border-[#DBDBDB] rounded-lg p-8 text-center">
                <p className="text-lg text-[#8E8E8E]">No posts to show.</p>
                <p className="text-sm text-[#8E8E8E] mt-2">
                  Follow more users to see their posts in your feed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <SuggestionsSidebar />
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
