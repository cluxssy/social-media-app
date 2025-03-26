import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { FcGoogle } from "react-icons/fc";
import { SiX } from "react-icons/si";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await login(data.username, data.password);
      navigate("/");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to login";
      toast({
        title: "Login failed",
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 justify-center"
                onClick={() => {
                  toast({
                    title: "Google Sign In",
                    description: "Google authentication is coming soon!",
                  });
                }}
              >
                <FcGoogle className="h-5 w-5" />
                <span>Continue with Google</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 justify-center bg-black text-white hover:bg-black/90"
                onClick={() => {
                  toast({
                    title: "X Sign In",
                    description: "X/Twitter authentication is coming soon!",
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
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <Label>Username</Label>
                      <FormControl>
                        <Input placeholder="Enter your username" {...field} />
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
                      <Label>Password</Label>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
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
                  {isLoading ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              <span className="text-[#8E8E8E]">Don't have an account? </span>
              <Button
                variant="link"
                className="p-0 text-[#0095F6]"
                onClick={() => navigate("/register")}
              >
                Sign up
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
