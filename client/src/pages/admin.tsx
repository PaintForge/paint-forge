import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Switch } from "../components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { Users, Palette, FolderOpen, Calendar, TrendingUp, Activity, Shield, ShieldCheck, Trash2, Database, RefreshCw, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { useAuthState } from "../hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";

interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  totalPaints: number;
  totalProjects: number;
  recentSignups: { date: string; count: number }[];
  popularPaints: { name: string; brand: string; usage_count: number }[];
  systemHealth: {
    uptime: number;
    lastBackup: string;
    errorRate: number;
  };
}

interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isLoading: authLoading, isAuthenticated } = useAuthState();
  const [, setLocation] = useLocation();
  
  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user?.isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [authLoading, isAuthenticated, user, toast, setLocation]);

  const { data: stats, isLoading, error } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
    enabled: isAuthenticated && user?.isAdmin, // Only fetch if user is admin
  });

  const { data: users, isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.isAdmin, // Only fetch if user is admin
  });

  const toggleAdminMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/toggle-admin`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "User admin status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user admin status",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const importCatalogMutation = useMutation({
    mutationFn: async (forceRefresh: boolean) => {
      return await apiRequest("POST", "/api/admin/import-catalog", { forceRefresh });
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/catalog/brands"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Catalog Import Complete",
        description: response?.data?.message || `Imported ${response?.data?.count || 0} paints`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import paint catalog",
        variant: "destructive",
      });
    },
  });

  // Show loading while checking authentication
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-white mt-4">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated or not admin (redirect will handle this)
  if (!isAuthenticated || !user?.isAdmin) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-400">Error loading admin dashboard. Please check your permissions.</p>
            <p className="text-gray-400 mt-2">Only admin users can access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Activity className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-white font-cinzel">Admin Dashboard</h1>
          </div>
          <p className="text-gray-300">Monitor The Paint Forge application metrics and user activity</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-morphism border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  {stats.verifiedUsers} verified
                </Badge>
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                  {stats.unverifiedUsers} pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Paint Database</CardTitle>
              <Palette className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalPaints.toLocaleString()}</div>
              <p className="text-xs text-gray-300">Available paints</p>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">User Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalProjects}</div>
              <p className="text-xs text-gray-300">Projects created</p>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Error Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.systemHealth.errorRate.toFixed(1)}%</div>
              <p className="text-xs text-gray-300">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card className="glass-morphism border-orange-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-orange-500" />
              <span>User Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-300 mt-2">Loading users...</p>
              </div>
            ) : users && users.length > 0 ? (
              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {user.isAdmin ? (
                          <ShieldCheck className="w-4 h-4 text-green-400" />
                        ) : (
                          <Shield className="w-4 h-4 text-gray-400" />
                        )}
                        <div>
                          <div className="text-white font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            <div>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                            <div>
                              {user.lastLoginAt ? (
                                <>Last login: {new Date(user.lastLoginAt).toLocaleDateString()}</>
                              ) : (
                                <span className="text-gray-600">Never logged in</span>
                              )}
                            </div>
                            <div className="flex space-x-4 mt-1">
                              <span>Paints: {user.paintCount || 0}</span>
                              <span>Projects: {user.projectCount || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={user.emailVerified ? "default" : "destructive"}
                          className={user.emailVerified ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                        >
                          {user.emailVerified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge 
                          variant={user.isAdmin ? "default" : "secondary"}
                          className={user.isAdmin ? "bg-orange-500/20 text-orange-400" : "bg-gray-500/20 text-gray-400"}
                        >
                          {user.isAdmin ? "Admin" : "User"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={user.isAdmin}
                          onCheckedChange={() => toggleAdminMutation.mutate(user.id)}
                          disabled={toggleAdminMutation.isPending}
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deleteUserMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-slate-800 border-slate-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-300">
                                Are you sure you want to delete {user.firstName} {user.lastName} ({user.email})?
                                This action cannot be undone and will permanently delete:
                                <br />• User account
                                <br />• All their paint inventory
                                <br />• All their projects
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteUserMutation.mutate(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-300">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paint Catalog Management */}
        <Card className="glass-morphism border-orange-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Database className="w-5 h-5 text-orange-500" />
              <span>Paint Catalog Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300">
                Import or refresh the paint catalog from the community database. This includes paints from 
                Citadel, Vallejo, Army Painter, Scale75, AK Interactive, Reaper, and more.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => importCatalogMutation.mutate(false)}
                  disabled={importCatalogMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {importCatalogMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Import Catalog
                    </>
                  )}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={importCatalogMutation.isPending}
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Force Refresh
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-slate-900 border-orange-500/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Force Refresh Catalog?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-300">
                        This will delete all existing catalog data and re-import from the source.
                        This is useful when the community database has been updated with new paints.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-slate-700 text-white border-slate-600 hover:bg-slate-600">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => importCatalogMutation.mutate(true)}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        Force Refresh
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Signups */}
          <Card className="glass-morphism border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span>Recent Signups</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.recentSignups.map((signup, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-300">{signup.date}</span>
                    <Badge variant="outline" className="text-orange-400 border-orange-500/30">
                      {signup.count} users
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Popular Paints */}
          <Card className="glass-morphism border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Palette className="w-5 h-5 text-orange-500" />
                <span>Most Popular Paints</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.popularPaints.map((paint, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">{paint.name}</div>
                      <div className="text-sm text-gray-400">{paint.brand}</div>
                    </div>
                    <Badge variant="outline" className="text-orange-400 border-orange-500/30">
                      {paint.usage_count} uses
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <Card className="glass-morphism border-orange-500/20 mt-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-orange-500" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Math.floor(stats.systemHealth.uptime / 3600)}h
                </div>
                <div className="text-sm text-gray-300">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {stats.systemHealth.lastBackup}
                </div>
                <div className="text-sm text-gray-300">Last Backup</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {stats.systemHealth.errorRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-300">Error Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
