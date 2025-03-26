import { useState } from "react";
import { useLocation } from "wouter";
import { format, formatDistanceToNow } from "date-fns";
import { PostWithDetails } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostProps {
  post: PostWithDetails;
}

export default function Post({ post }: PostProps) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [comment, setComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [isDoubleTapLiked, setIsDoubleTapLiked] = useState(false);

  // Like/unlike mutations
  const likeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/posts/${post.id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}`] });
    }
  });

  const unlikeMutation = useMutation({
    mutationFn: () => apiRequest("DELETE", `/api/posts/${post.id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}`] });
    }
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: (content: string) => 
      apiRequest("POST", `/api/posts/${post.id}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}`] });
      setComment("");
    }
  });

  // Handle like toggle
  const handleLikeToggle = () => {
    if (post.isLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  // Handle double tap like
  const handleDoubleTap = () => {
    if (!post.isLiked) {
      likeMutation.mutate();
      setIsDoubleTapLiked(true);
      setTimeout(() => setIsDoubleTapLiked(false), 1000);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = () => {
    if (comment.trim() && !commentMutation.isPending) {
      commentMutation.mutate(comment);
    }
  };

  // Format post date
  const formatPostDate = (dateString: Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;
    
    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: false }).toUpperCase();
    } else {
      return format(date, "MMMM d, yyyy");
    }
  };

  // Get display comments (show 2 most recent by default)
  const displayComments = showAllComments
    ? post.comments
    : post.comments.slice(-2);

  return (
    <article className="bg-white border border-[#DBDBDB] rounded-lg overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-3">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate(`/profile/${post.user.username}`)}
        >
          <Avatar>
            <AvatarImage src={post.user.profileImage} alt={post.user.username} />
            <AvatarFallback>{post.user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <span className="font-semibold text-sm mr-1">{post.user.username}</span>
            </div>
            {post.location && (
              <span className="text-xs text-[#8E8E8E]">{post.location}</span>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user && post.user.id === user.id ? (
              <DropdownMenuItem className="text-red-500">Delete Post</DropdownMenuItem>
            ) : (
              <DropdownMenuItem>Report</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Post Image */}
      <div 
        className="relative"
        onDoubleClick={handleDoubleTap}
      >
        <img 
          src={post.imageUrl} 
          alt="Post" 
          className="w-full object-cover max-h-[600px]" 
        />
        {isDoubleTapLiked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10">
            <Heart className="h-24 w-24 text-white animate-pulse" fill="white" />
          </div>
        )}
      </div>
      
      {/* Post Actions */}
      <div className="p-3">
        <div className="flex justify-between mb-3">
          <div className="flex space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-[#262626]"
              onClick={handleLikeToggle}
            >
              <Heart 
                className={`h-6 w-6 ${post.isLiked ? "text-red-500 fill-red-500" : ""}`} 
              />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-[#262626]"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-[#262626]"
            >
              <Send className="h-6 w-6" />
            </Button>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-[#262626]"
          >
            <Bookmark className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Likes */}
        <div className="mb-2">
          <span className="font-semibold text-sm">{post.likes} likes</span>
        </div>
        
        {/* Caption */}
        <div className="mb-2">
          <span className="font-semibold text-sm mr-1">{post.user.username}</span>
          <span className="text-sm">{post.caption}</span>
        </div>
        
        {/* View all comments */}
        {post.comments.length > 2 && !showAllComments && (
          <button 
            className="text-[#8E8E8E] text-sm mb-2"
            onClick={() => setShowAllComments(true)}
          >
            View all {post.comments.length} comments
          </button>
        )}
        
        {/* Comments */}
        {displayComments.map((comment) => (
          <div key={comment.id} className="flex justify-between mb-1">
            <div>
              <span 
                className="font-semibold text-sm mr-1 cursor-pointer"
                onClick={() => navigate(`/profile/${comment.user.username}`)}
              >
                {comment.user.username}
              </span>
              <span className="text-sm">{comment.content}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-[#262626]"
            >
              <Heart className="h-3 w-3" />
            </Button>
          </div>
        ))}
        
        {/* Timestamp */}
        <div className="text-xs text-[#8E8E8E] mt-2">
          {formatPostDate(post.createdAt)}
        </div>
      </div>
      
      {/* Comment Input */}
      <div className="flex items-center border-t border-[#DBDBDB] px-3 py-2">
        <Textarea
          placeholder="Add a comment..."
          className="min-h-0 border-none shadow-none resize-none flex-grow text-sm"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={1}
        />
        <Button
          variant="ghost"
          className="text-[#0095F6] font-semibold text-sm ml-3"
          disabled={!comment.trim() || commentMutation.isPending}
          onClick={handleCommentSubmit}
        >
          Post
        </Button>
      </div>
    </article>
  );
}
