import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Link, useLocation } from "wouter";
import { Shield, Mail, Lock, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { loginSchema } from "@shared/schema";
import type { z } from "zod";

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "true") {
      setSuccess("Email verified successfully! You can now log in.");
    } else if (params.get("error") === "invalid_token") {
      setError("Invalid or expired verification link.");
    } else if (params.get("error") === "verification_failed") {
      setError("Email verification failed. Please try again.");
    }
  }, []);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });
      
      setLocation("/");
    },
    onError: (error: any) => {
      // Convert technical error messages to user-friendly ones
      let userMessage = "Login failed. Please try again.";
      
      if (error.message) {
        const errorText = error.message.toLowerCase();
        // Check for email verification message first (before generic 401 handling)
        if (errorText.includes("verify your email") || errorText.includes("please verify your email")) {
          userMessage = "Please verify your email before logging in. Check your inbox for the verification link.";
        } else if (errorText.includes("invalid email or password") || errorText.includes("401")) {
          userMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (errorText.includes("network") || errorText.includes("fetch")) {
          userMessage = "Connection error. Please check your internet connection and try again.";
        } else if (errorText.includes("server") || errorText.includes("500")) {
          userMessage = "Server error. Please try again in a few moments.";
        }
      }
      
      setError(userMessage);
    },
  });

  const onSubmit = (data: LoginForm) => {
    setError("");
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="glass-morphism border-orange-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-orange-500" />
            </div>
            <CardTitle className="font-cinzel text-2xl text-orange-500">
              Welcome Back to The Paint Forge
            </CardTitle>
            <p className="text-muted-foreground">
              Sign in to your account to access your inventory
            </p>
          </CardHeader>

          <CardContent>
            {success && (
              <Alert className="mb-6 border-green-500/20 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">
                  {success}
                </AlertDescription>
              </Alert>
            )}
            
            {error && (
              <Alert className="mb-6 border-red-500/20 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Email Address</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@email.com"
                          className="bg-white text-black placeholder:text-gray-400"
                          {...field}
                        />
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
                      <FormLabel className="flex items-center space-x-2">
                        <Lock className="w-4 h-4" />
                        <span>Password</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="At least 8 characters"
                            className="bg-white text-black pr-10 placeholder:text-gray-400 password-field"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-orange-500 hover:text-orange-400 font-medium">
                  Create one here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
