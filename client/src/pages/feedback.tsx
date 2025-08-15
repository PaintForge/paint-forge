import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAuthToken } from "../hooks/useAuth";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { insertFeedbackSchema, type InsertFeedback, type Feedback } from "../../../shared/schema";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { MessageSquare, Bug, Lightbulb, Send, History } from "lucide-react";
import { useLocation } from "wouter";

export default function FeedbackPage() {
  const { toast } = useToast();
  const [showHistory, setShowHistory] = useState(false);
  const [, setLocation] = useLocation();
  const isAuthenticated = !!getAuthToken();

  // Fetch user data if authenticated
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: isAuthenticated,
  });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Show loading while user data loads
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 text-white flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-orange-500 mx-auto mb-4 animate-pulse" />
          <p className="text-stone-300">Loading...</p>
        </div>
      </div>
    );
  }

  const form = useForm<InsertFeedback>({
    resolver: zodResolver(insertFeedbackSchema),
    defaultValues: {
      type: "general",
      subject: "",
      message: "",
    },
  });

  const { data: previousFeedback } = useQuery({
    queryKey: ["/api/feedback"],
    enabled: showHistory,
  });

  const feedbackMutation = useMutation({
    mutationFn: async (data: InsertFeedback) => {
      await apiRequest("/api/feedback", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! We'll review it and get back to you soon.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit feedback",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertFeedback) => {
    feedbackMutation.mutate(data);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "feature":
        return <Lightbulb className="h-4 w-4" />;
      case "bug":
        return <Bug className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "feature":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "bug":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "closed":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <MessageSquare className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl font-bold">Feedback & Suggestions</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feedback Form */}
            <Card className="bg-stone-800 border-stone-700">
              <CardHeader>
                <CardTitle className="text-white">Share Your Thoughts</CardTitle>
                <CardDescription className="text-stone-300">
                  Help us improve The Paint Forge by sharing your ideas, reporting bugs, or providing general feedback.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Feedback Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-stone-700 border-stone-600 text-white">
                                <SelectValue placeholder="Select feedback type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-stone-800 border-stone-600">
                              <SelectItem value="general" className="text-white">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  General Feedback
                                </div>
                              </SelectItem>
                              <SelectItem value="feature" className="text-white">
                                <div className="flex items-center gap-2">
                                  <Lightbulb className="h-4 w-4" />
                                  Feature Request
                                </div>
                              </SelectItem>
                              <SelectItem value="bug" className="text-white">
                                <div className="flex items-center gap-2">
                                  <Bug className="h-4 w-4" />
                                  Bug Report
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Subject</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Brief description of your feedback"
                              className="bg-stone-700 border-stone-600 text-white placeholder:text-stone-400"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please provide detailed feedback. For bugs, include steps to reproduce the issue. For features, describe what you'd like to see."
                              className="bg-stone-700 border-stone-600 text-white placeholder:text-stone-400 min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={feedbackMutation.isPending}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      {feedbackMutation.isPending ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Feedback
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* User Info & History */}
            <div className="space-y-6">
              {/* User Info */}
              <Card className="bg-stone-800 border-stone-700">
                <CardHeader>
                  <CardTitle className="text-white">Your Information</CardTitle>
                  <CardDescription className="text-stone-300">
                    This information will be included with your feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-stone-400">Email</p>
                    <p className="text-white">{user?.email}</p>
                  </div>
                  {(user?.firstName || user?.lastName) && (
                    <div>
                      <p className="text-sm text-stone-400">Name</p>
                      <p className="text-white">{user?.firstName} {user?.lastName}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Feedback History */}
              <Card className="bg-stone-800 border-stone-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Your Feedback History
                  </CardTitle>
                  <CardDescription className="text-stone-300">
                    View your previously submitted feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full border-stone-600 text-stone-300 hover:bg-stone-700"
                  >
                    {showHistory ? "Hide History" : "Show History"}
                  </Button>

                  {showHistory && (
                    <div className="mt-4 space-y-3">
                      {previousFeedback?.length === 0 ? (
                        <p className="text-stone-400 text-center py-4">
                          No previous feedback submitted
                        </p>
                      ) : (
                        previousFeedback?.map((feedback: Feedback) => (
                          <div key={feedback.id} className="border border-stone-600 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(feedback.type)}
                                <span className="font-medium text-white">{feedback.subject}</span>
                              </div>
                              <div className="flex gap-2">
                                <Badge className={getTypeColor(feedback.type)}>
                                  {feedback.type}
                                </Badge>
                                <Badge className={getStatusColor(feedback.status)}>
                                  {feedback.status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-stone-300 text-sm mb-2">{feedback.message}</p>
                            <p className="text-stone-400 text-xs">
                              Submitted {new Date(feedback.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}