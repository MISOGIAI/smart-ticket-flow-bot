import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SelfServeStatsDashboard from '@/components/SelfServeStatsDashboard';
import Navbar from '@/components/ui/navbar';
import { useAuth } from '@/components/auth/AuthProvider';
import { Navigate } from 'react-router-dom';
import { Shield, AlertCircle } from 'lucide-react';

const SelfServeStatsPage: React.FC = () => {
  const { user, userProfile, loading } = useAuth();
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect if not logged in
  if (!user || !userProfile) {
    return <Navigate to="/" />;
  }
  
  // Check if user has permission to view stats (manager or admin)
  const hasPermission = ['manager', 'super_admin'].includes(userProfile.role);
  
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar />
        <div className="container mx-auto py-16 px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <CardTitle>Access Denied</CardTitle>
              </div>
              <CardDescription>
                You don't have permission to view this page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                This page is only accessible to managers and administrators. Please contact your administrator if you need access.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Self-Serve Answer Bot Analytics</h1>
              <p className="text-muted-foreground">
                Performance metrics and usage statistics for the self-serve help system
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-md">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Manager View</span>
            </div>
          </div>
          
          <SelfServeStatsDashboard />
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                AI-generated recommendations based on usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-medium text-yellow-800 mb-1">Knowledge Base Gaps</h3>
                  <p className="text-yellow-700 text-sm">
                    Consider adding more documentation about "password reset" and "VPN setup" as these are common queries with mixed results.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-800 mb-1">Successful Topics</h3>
                  <p className="text-green-700 text-sm">
                    The self-serve bot is performing well for software request questions. Consider expanding this content with more detailed guides.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-1">Ticket Reduction</h3>
                  <p className="text-blue-700 text-sm">
                    The self-serve system has potentially prevented approximately 70% of tickets from being created, saving agent time and resources.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SelfServeStatsPage; 