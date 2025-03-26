import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { FcGoogle } from "react-icons/fc";
import { SiFacebook, SiX } from "react-icons/si";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// Extend the insert user schema with validation rules
const registerSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username must be at most 30 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  bio: z.string().optional(),
  profileImage: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      email: "",
      fullName: "",
      bio: "",
      profileImage: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // Set a default profile image if none provided
      if (!data.profileImage) {
        const profileImages = [
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6"
        ];
        data.profileImage = profileImages[Math.floor(Math.random() * profileImages.length)];
      }

      // Register the user
      await apiRequest("POST", "/api/auth/register", data);
      
      // Auto login after registration
      await login(data.username, data.password);
      
      toast({
        title: "Registration successful",
        description: "Welcome to InstaClone!",
      });
      
      navigate("/");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to register";
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] p-4">
      <div className="w-full max-w-md">
        <Card className="border border-[#DBDBDB]">
          <CardHeader className="space-y-1 items-center text-center">
            <CardTitle className="text-2xl font-bold">InstaClone</CardTitle>
            <p className="text-[#8E8E8E] text-sm">Sign up to see photos and videos from your friends.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 justify-center"
                onClick={() => {
                  toast({
                    title: "Google Sign Up",
                    description: "This feature requires Google API credentials",
                  });
                }}
              >
                <FcGoogle className="h-5 w-5" />
                <span>Continue with Google</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 justify-center bg-[#1877F2] text-white hover:bg-[#1877F2]/90"
                onClick={() => {
                  toast({
                    title: "Facebook Sign Up",
                    description: "This feature requires Facebook API credentials",
                  });
                }}
              >
                <SiFacebook className="h-5 w-5" />
                <span>Continue with Facebook</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 justify-center bg-black text-white hover:bg-black/90"
                onClick={() => {
                  toast({
                    title: "X Sign Up",
                    description: "This feature requires X API credentials",
                  });
                }}
              >
                <SiX className="h-4 w-4" />
                <span>Continue with X</span>
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or</span>
                </div>
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Choose a username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Create a password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio (optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us about yourself" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="profileImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profile Image URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter image URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button
                  type="submit"
                  className="w-full bg-[#0095F6] hover:bg-[#0095F6]/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing up..." : "Sign Up"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              <span className="text-[#8E8E8E]">Have an account? </span>
              <Button
                variant="link"
                className="p-0 text-[#0095F6]"
                onClick={() => navigate("/login")}
              >
                Log in
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
