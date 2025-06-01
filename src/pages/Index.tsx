
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, BarChart3, Users, MessageSquare, Settings, LogOut } from 'lucide-react';
import TicketCreationForm from '@/components/TicketCreationForm';
import TicketList from '@/components/TicketList';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import KnowledgeBase from '@/components/KnowledgeBase';
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard';
import SupportAgentDashboard from '@/components/dashboard/SupportAgentDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import SuperAdminDashboard from '@/components/dashboard/SuperAdminDashboard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import AuthPage from '@/components/auth/AuthPage';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const { toast } = useToast();
  const { user, userProfile, loading, signOut } = useAuth();

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

  if (!user || !userProfile) {
    return <AuthPage />;
  }

  const handleCreateTicket = () => {
    setShowCreateTicket(true);
    setActiveTab('tickets');
  };

  const handleTicketCreated = () => {
    setShowCreateTicket(false);
    toast({
      title: "Ticket Created Successfully",
      description: "Your ticket has been submitted and routed to the appropriate department.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  // Role-based tab configuration
  const getTabsForRole = (role: string) => {
    const baseTabs = [
      { value: 'dashboard', label: 'Dashboard', icon: BarChart3 }
    ];

    switch (role) {
      case 'employee':
        return [
          ...baseTabs,
          { value: 'tickets', label: 'My Tickets', icon: MessageSquare },
          { value: 'knowledge', label: 'Knowledge Base', icon: Search }
        ];
      case 'support_agent':
        return [
          ...baseTabs,
          { value: 'tickets', label: 'Tickets', icon: MessageSquare },
          { value: 'knowledge', label: 'Knowledge Base', icon: Search }
        ];
      case 'manager':
        return [
          ...baseTabs,
          { value: 'tickets', label: 'All Tickets', icon: MessageSquare },
          { value: 'analytics', label: 'Analytics', icon: BarChart3 },
          { value: 'knowledge', label: 'Knowledge Base', icon: Search }
        ];
      case 'super_admin':
        return [
          ...baseTabs,
          { value: 'tickets', label: 'All Tickets', icon: MessageSquare },
          { value: 'analytics', label: 'Analytics', icon: BarChart3 },
          { value: 'knowledge', label: 'Knowledge Base', icon: Search },
          { value: 'users', label: 'Users', icon: Users },
          { value: 'settings', label: 'Settings', icon: Settings }
        ];
      default:
        return baseTabs;
    }
  };

  const tabs = getTabsForRole(userProfile.role);

  const renderDashboard = () => {
    switch (userProfile.role) {
      case 'employee':
        return <EmployeeDashboard currentUser={userProfile} onCreateTicket={handleCreateTicket} />;
      case 'support_agent':
        return <SupportAgentDashboard currentUser={userProfile} />;
      case 'manager':
        return <ManagerDashboard currentUser={userProfile} />;
      case 'super_admin':
        return <SuperAdminDashboard currentUser={userProfile} />;
      default:
        return <EmployeeDashboard currentUser={userProfile} onCreateTicket={handleCreateTicket} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-slate-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">HelpDesk Pro</h1>
                <p className="text-sm text-gray-300">AI-Powered Ticket Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {(userProfile.role === 'employee' || userProfile.role === 'support_agent') && (
                <Button 
                  onClick={handleCreateTicket}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-white">{userProfile.name}</p>
                <p className="text-xs text-gray-300">{userProfile.role.replace('_', ' ').toUpperCase()}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="text-white border-gray-600 hover:bg-gray-700">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-fit lg:grid-cols-6">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            {showCreateTicket ? (
              <TicketCreationForm 
                currentUser={userProfile}
                onTicketCreated={handleTicketCreated}
                onCancel={() => setShowCreateTicket(false)}
              />
            ) : (
              <TicketList currentUser={userProfile} onCreateTicket={handleCreateTicket} />
            )}
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <KnowledgeBase />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard currentUser={userProfile} />
          </TabsContent>

          {userProfile.role === 'super_admin' && (
            <>
              <TabsContent value="users" className="space-y-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                  <p className="text-gray-600">Advanced user management features coming soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-6">
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
                  <p className="text-gray-600">Advanced system configuration coming soon</p>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
