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
import { Shield, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "../lib/queryClient";
import { resetPasswordSchema } from "@shared/schema";
import type { z } from "zod";

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      password: "",
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get("token");
    if (resetToken) {
      setToken(resetToken);
      // Set the token in the form as well
      form.setValue("token", resetToken);
    } else {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [form]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordForm) => {
      const response = await apiRequest("POST", "/api/auth/reset-password", data);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess(data.message);
      setError("");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    },
    onError: (error: any) => {
      setError(error.message || "Failed to reset password. Please try again.");
      setSuccess("");
    },
  });

  const onSubmit = (data: ResetPasswordForm) => {
    setError("");
    setSuccess("");
    
    // Debug: Log form errors if any
    if (Object.keys(form.formState.errors).length > 0) {
      console.error("Form validation errors:", form.formState.errors);
      return;
    }
    
    resetPasswordMutation.mutate({ password: data.password, token });
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
              Create New Password
            </CardTitle>
            <p className="text-muted-foreground">
              Enter your new password below
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

            {token && !success && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2">
                          <Lock className="w-4 h-4" />
                          <span>New Password</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="At least 8 characters"
                              className="bg-white text-black pr-10 placeholder:text-gray-400"
                              data-testid="input-password"
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
                    disabled={resetPasswordMutation.isPending}
                    data-testid="button-reset-password"
                  >
                    {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </Form>
            )}

            {!token && (
              <div className="text-center">
                <Link href="/forgot-password" className="text-sm text-orange-500 hover:text-orange-400 font-medium">
                  Request a new reset link
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
