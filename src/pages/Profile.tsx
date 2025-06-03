import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Building, Shield, Save } from 'lucide-react';
import Navbar from '@/components/ui/navbar';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getDepartmentNameById } from '@/lib/constants';

const ProfilePage: React.FC = () => {
  const { user, userProfile, loading, signOut, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
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
  
  const handleSaveProfile = async () => {
    if (!userProfile) return;
    
    setIsSaving(true);
    try {
      // Update profile in database
      const { error } = await updateProfile({
        name,
        email
      });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update profile: " + error,
          variant: "destructive"
        });
        return;
      }
      
      // Show success message
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };
  
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const userInitials = getInitials(userProfile.name);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar onSignOut={handleSignOut} />
      
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold mb-2">My Profile</h1>
          <p className="text-sm text-gray-600 mb-6">View and manage your account information</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Summary Card */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle>{userProfile.name}</CardTitle>
                  <CardDescription>{userProfile.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Role:</span>
                      <span className="capitalize">{userProfile.role.replace('_', ' ')}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Department:</span>
                      <span>{userProfile.department_id ? getDepartmentNameById(userProfile.department_id) : 'Not assigned'}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)} 
                    className="w-full"
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Profile Details Card */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    {isEditing 
                      ? 'Edit your personal information below' 
                      : 'Your personal information and preferences'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        {isEditing ? (
                          <Input 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your full name"
                          />
                        ) : (
                          <p>{userProfile.name}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                        {isEditing ? (
                          <Input 
                            id="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Your email address"
                            type="email"
                          />
                        ) : (
                          <p>{userProfile.email}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 text-gray-500 mr-2" />
                        <p className="capitalize">{userProfile.role.replace('_', ' ')}</p>
                      </div>
                      <p className="text-xs text-gray-500">Account type cannot be changed. Contact an administrator for role changes.</p>
                    </div>
                  </div>
                </CardContent>
                {isEditing && (
                  <CardFooter>
                    <Button 
                      onClick={handleSaveProfile} 
                      disabled={isSaving}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
              
              {/* Account Security */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>Manage your account security settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm mb-4">Password management is handled through your authentication provider.</p>
                    <Button variant="outline">
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage; 