
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, BarChart3, Users, MessageSquare, Settings } from 'lucide-react';
import TicketCreationForm from '@/components/TicketCreationForm';
import TicketList from '@/components/TicketList';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import KnowledgeBase from '@/components/KnowledgeBase';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const { toast } = useToast();

  // Simulated user role - in real app, this would come from authentication
  const [currentUser] = useState({
    id: '1',
    name: 'John Doe',
    email: 'john@company.com',
    role: 'agent', // 'user', 'agent', 'manager'
    department: 'IT Support'
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">HelpDesk Pro</h1>
                <p className="text-sm text-gray-500">AI-Powered Ticket Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={handleCreateTicket}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.department}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Tickets</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Knowledge Base</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardOverview currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            {showCreateTicket ? (
              <TicketCreationForm 
                currentUser={currentUser}
                onTicketCreated={handleTicketCreated}
                onCancel={() => setShowCreateTicket(false)}
              />
            ) : (
              <TicketList currentUser={currentUser} onCreateTicket={handleCreateTicket} />
            )}
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <KnowledgeBase />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard currentUser={currentUser} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ currentUser }: { currentUser: any }) => {
  const stats = [
    { title: 'Open Tickets', value: '24', change: '+12%', color: 'bg-blue-500' },
    { title: 'In Progress', value: '8', change: '-5%', color: 'bg-yellow-500' },
    { title: 'Resolved Today', value: '15', change: '+25%', color: 'bg-green-500' },
    { title: 'Avg Response Time', value: '2.3h', change: '-15%', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {currentUser.name}</h2>
        <p className="text-gray-600">Here's what's happening with your tickets today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change} from yesterday
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
            <CardDescription>Latest ticket activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: 'TK-001', title: 'Password reset request', status: 'Open', priority: 'High' },
              { id: 'TK-002', title: 'Software installation', status: 'In Progress', priority: 'Medium' },
              { id: 'TK-003', title: 'Network connectivity issue', status: 'Resolved', priority: 'Critical' },
            ].map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{ticket.title}</p>
                  <p className="text-xs text-gray-500">{ticket.id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={ticket.priority === 'Critical' ? 'destructive' : 'secondary'}>
                    {ticket.priority}
                  </Badge>
                  <Badge variant="outline">{ticket.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Smart recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">Pattern Detected</p>
              <p className="text-xs text-blue-700">Multiple password reset requests from IT department</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-900">Quick Resolution</p>
              <p className="text-xs text-green-700">3 tickets auto-resolved using knowledge base</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium text-yellow-900">High Volume Alert</p>
              <p className="text-xs text-yellow-700">HR department experiencing 40% increase in tickets</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
