import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useLocation } from "wouter";
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, Eye, EyeOff, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { registerSchema } from "@shared/schema";
import { generateCaptcha, type CaptchaData } from "@/lib/captcha";
import type { z } from "zod";

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState<CaptchaData>(generateCaptcha());

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      captchaAnswer: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      // Add captcha validation to the request
      const requestData = {
        ...data,
        captchaAnswer: parseInt(data.captchaAnswer),
        captchaExpectedAnswer: captcha.answer,
      };
      const response = await apiRequest("POST", "/api/auth/register", requestData);
      return response.json();
    },
    onSuccess: (data) => {
      setSuccess(data.message);
      setError("");
      form.reset();
      setCaptcha(generateCaptcha()); // Generate new captcha
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
    },
    onError: (error: any) => {
      // Convert technical error messages to user-friendly ones
      let userMessage = "Registration failed. Please try again.";
      
      if (error.message) {
        const errorText = error.message.toLowerCase();
        if (errorText.includes("email already exists") || errorText.includes("409")) {
          userMessage = "An account with this email already exists. Please try logging in instead.";
        } else if (errorText.includes("invalid email")) {
          userMessage = "Please enter a valid email address.";
        } else if (errorText.includes("password") && errorText.includes("weak")) {
          userMessage = "Password is too weak. Please choose a stronger password.";
        } else if (errorText.includes("network") || errorText.includes("fetch")) {
          userMessage = "Connection error. Please check your internet connection and try again.";
        } else if (errorText.includes("server") || errorText.includes("500")) {
          userMessage = "Server error. Please try again in a few moments.";
        }
      }
      
      setError(userMessage);
      setSuccess("");
      setCaptcha(generateCaptcha()); // Generate new captcha on error
    },
  });

  const onSubmit = (data: RegisterForm) => {
    setError("");
    setSuccess("");
    registerMutation.mutate(data);
  };

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    form.setValue("captchaAnswer", "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="glass-morphism border-orange-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-orange-500" />
            </div>
            <CardTitle className="font-cinzel text-2xl text-orange-500">
              Join The Paint Forge
            </CardTitle>
            <p className="text-muted-foreground">
              Create your account to start managing your paint inventory
            </p>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-500/20 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-500/20 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>First Name</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
                            className="bg-background/50 text-black placeholder:text-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>Last Name</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
                            className="bg-background/50 text-black placeholder:text-gray-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                          placeholder="john@example.com"
                          className="bg-background/50 text-black placeholder:text-gray-500"
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
                            className="bg-background/50 text-black pr-10 placeholder:text-muted-foreground"
                            style={{ color: '#000000' }}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <Eye className="h-4 w-4 text-gray-500" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="captchaAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Are you human?</span>
                      </FormLabel>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-background/30 border border-orange-500/20 rounded-md p-3 text-center font-mono text-lg">
                          {captcha.question}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={refreshCaptcha}
                          className="border-orange-500/20"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter your answer"
                          className="bg-background/50 text-black placeholder:text-gray-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-black font-semibold"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-orange-500 hover:text-orange-400 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}