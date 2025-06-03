import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, BarChart3, Users, MessageSquare, Settings, LogOut, Lightbulb } from 'lucide-react';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
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
import LandingPage from '@/components/LandingPage';
import Navbar from '@/components/ui/navbar';
import SelfServeHelpPage from './SelfServeHelp';
import SelfServeStatsPage from './SelfServeStats';
import NotFound from './NotFound';

const MainDashboard = () => {
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
    return <Navigate to="/" />;
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
      <Navbar 
        onSignOut={handleSignOut} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto overflow-hidden">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          {activeTab === 'dashboard' && (
            <div className="text-center md:text-left w-full">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent drop-shadow-sm">Dashboard</h1>
              <p className="text-gray-600">Welcome to your personalized dashboard</p>
            </div>
          )}
          
          {activeTab === 'tickets' && (
            <div className="text-center md:text-left w-full">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent drop-shadow-sm">
                {userProfile.role === 'employee' ? 'My Tickets' : 'All Tickets'}
              </h1>
              <p className="text-gray-600">Manage and track support requests</p>
            </div>
          )}
          
          {activeTab === 'knowledge' && (
            <div className="text-center md:text-left w-full">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent drop-shadow-sm">Knowledge Base</h1>
              <p className="text-gray-600">Find solutions and documentation</p>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="text-center md:text-left w-full">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent drop-shadow-sm">Analytics</h1>
              <p className="text-gray-600">View insights and performance metrics</p>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div className="text-center md:text-left w-full">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent drop-shadow-sm">User Management</h1>
              <p className="text-gray-600">Manage system users and permissions</p>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="text-center md:text-left w-full">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent drop-shadow-sm">System Settings</h1>
              <p className="text-gray-600">Configure application preferences</p>
            </div>
          )}
          
          {(userProfile.role === 'employee' || userProfile.role === 'support_agent') && activeTab === 'tickets' && !showCreateTicket && (
            <Button 
              onClick={handleCreateTicket}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 mt-4 md:mt-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          )}
        </div>

        {activeTab === 'dashboard' && renderDashboard()}

        {activeTab === 'tickets' && (
          showCreateTicket ? (
            <TicketCreationForm 
              currentUser={userProfile}
              onTicketCreated={handleTicketCreated}
              onCancel={() => setShowCreateTicket(false)}
            />
          ) : (
            <TicketList currentUser={userProfile} onCreateTicket={handleCreateTicket} />
          )
        )}

        {activeTab === 'knowledge' && <KnowledgeBase />}

        {activeTab === 'analytics' && <AnalyticsDashboard currentUser={userProfile} />}

        {activeTab === 'users' && userProfile.role === 'super_admin' && (
          <div className="text-center py-12 max-w-2xl mx-auto">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
            <p className="text-gray-600">Advanced user management features coming soon</p>
          </div>
        )}
        
        {activeTab === 'settings' && userProfile.role === 'super_admin' && (
          <div className="text-center py-12 max-w-2xl mx-auto">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
            <p className="text-gray-600">Advanced system configuration coming soon</p>
          </div>
        )}
      </main>
    </div>
  );
};

const Index = () => {
  const { loading, user } = useAuth();

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

  return (
    <Routes>
      <Route path="/" element={!user ? <LandingPage /> : <MainDashboard />} />
      <Route path="/self-serve-help" element={<SelfServeHelpPage />} />
      <Route path="/self-serve-stats" element={<SelfServeStatsPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Index;
