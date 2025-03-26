import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ImageIcon, X } from "lucide-react";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [step, setStep] = useState<"upload" | "caption">("upload");

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: () => 
      apiRequest("POST", "/api/posts", { imageUrl, caption, location }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      if (user) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user.username}`] });
      }
      
      toast({
        title: "Success",
        description: "Your post has been shared.",
      });
      
      // Reset form and close modal
      resetForm();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setCaption("");
    setLocation("");
    setImageUrl("");
    setStep("upload");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNextStep = () => {
    if (step === "upload" && imageUrl) {
      setStep("caption");
    } else if (step === "caption") {
      createPostMutation.mutate();
    }
  };

  const handleBackStep = () => {
    if (step === "caption") {
      setStep("upload");
    }
  };

  const sampleImageOptions = [
    "https://images.unsplash.com/photo-1543039625-14cbd3802e7d",
    "https://images.unsplash.com/photo-1516762689617-e1cffcef479d",
    "https://images.unsplash.com/photo-1522276498395-f4f68f7f8454",
    "https://images.unsplash.com/photo-1513104890138-7c749659a591",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f"
  ];

  const selectSampleImage = (url: string) => {
    setImageUrl(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-[#DBDBDB] pb-2">
          <Button variant="ghost" onClick={handleBackStep} disabled={step === "upload"}>
            {step === "caption" ? "Back" : ""}
          </Button>
          <DialogTitle>Create New Post</DialogTitle>
          <Button 
            variant="ghost" 
            onClick={handleNextStep}
            disabled={
              (step === "upload" && !imageUrl) || 
              createPostMutation.isPending
            }
            className="text-[#0095F6]"
          >
            {step === "upload" ? "Next" : "Share"}
          </Button>
        </DialogHeader>

        {step === "upload" ? (
          <div className="p-4">
            {imageUrl ? (
              <div className="relative">
                <img 
                  src={imageUrl} 
                  alt="Selected" 
                  className="w-full h-auto max-h-80 object-contain rounded" 
                />
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={() => setImageUrl("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="border-2 border-dashed border-[#DBDBDB] rounded-lg p-8 flex flex-col items-center justify-center mb-4">
                  <ImageIcon className="h-16 w-16 text-[#8E8E8E] mb-4" />
                  <p className="text-lg mb-3 text-center">Upload a photo</p>
                  <Input
                    type="text"
                    placeholder="Or paste image URL"
                    className="max-w-xs mb-4"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Or select a sample image:</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {sampleImageOptions.map((url, index) => (
                      <div 
                        key={index}
                        className="cursor-pointer border rounded overflow-hidden h-20"
                        onClick={() => selectSampleImage(url)}
                      >
                        <img 
                          src={url} 
                          alt={`Sample ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="flex items-start mb-4">
              {user?.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.username} 
                  className="w-8 h-8 rounded-full mr-3" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
              )}
              <span className="font-semibold">{user?.username}</span>
            </div>
            
            <Textarea
              placeholder="Write a caption..."
              className="w-full mb-4 min-h-[120px]"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            
            <Input
              placeholder="Add location"
              className="mb-4"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            
            <div className="mb-4">
              <img 
                src={imageUrl} 
                alt="Post" 
                className="w-full h-auto max-h-60 object-contain rounded" 
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
