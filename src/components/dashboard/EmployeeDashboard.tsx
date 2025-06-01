
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, MessageSquare, Clock, CheckCircle, Archive, Bot } from 'lucide-react';
import { UserProfile } from '@/components/auth/AuthProvider';

interface EmployeeDashboardProps {
  currentUser: UserProfile;
  onCreateTicket: () => void;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ currentUser, onCreateTicket }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data for employee's tickets
  const myTickets = [
    {
      id: 'TK-001',
      title: 'Password reset request',
      status: 'open',
      priority: 'high',
      created: '2024-01-15T10:30:00Z',
      category: 'IT Support'
    },
    {
      id: 'TK-005',
      title: 'Document access request',
      status: 'pending',
      priority: 'medium',
      created: '2024-01-10T14:20:00Z',
      category: 'Admin'
    },
    {
      id: 'TK-008',
      title: 'Leave policy question',
      status: 'resolved',
      priority: 'low',
      created: '2024-01-08T09:15:00Z',
      category: 'HR'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-amber-600" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'closed': return <Archive className="h-4 w-4 text-gray-600" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-600 bg-red-50';
      case 'high': return 'border-l-orange-600 bg-orange-50';
      case 'medium': return 'border-l-amber-600 bg-amber-50';
      case 'low': return 'border-l-green-600 bg-green-50';
      default: return 'border-l-gray-300 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {currentUser.name}</h1>
        <p className="text-blue-100">How can we help you today?</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onCreateTicket}>
          <CardContent className="p-6 text-center">
            <Plus className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Submit New Ticket</h3>
            <p className="text-gray-600 text-sm">Get help with your IT, HR, or Admin needs</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Search className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Search Knowledge Base</h3>
            <p className="text-gray-600 text-sm">Find answers to common questions</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Bot className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-2">Ask AI Assistant</h3>
            <p className="text-gray-600 text-sm">Get instant help before submitting a ticket</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="my-tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
        </TabsList>

        <TabsContent value="my-tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Tickets</CardTitle>
              <CardDescription>Track the status of your support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(ticket.priority)} hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(ticket.status)}
                          <span className="font-medium">{ticket.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {ticket.id}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{ticket.category}</span>
                          <span>•</span>
                          <span>Created {formatDate(ticket.created)}</span>
                        </div>
                      </div>
                      <Badge 
                        variant={ticket.status === 'resolved' ? 'default' : 'secondary'}
                        className={
                          ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {myTickets.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets yet</h3>
                  <p className="text-gray-600 mb-4">Create your first support ticket to get started</p>
                  <Button onClick={onCreateTicket}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ticket
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>Search for answers to common questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-3">
                {[
                  { title: 'How to reset your password', category: 'IT Support', views: 245 },
                  { title: 'Understanding leave policies', category: 'HR', views: 189 },
                  { title: 'Accessing shared documents', category: 'Admin', views: 156 },
                  { title: 'Troubleshooting VPN connection', category: 'IT Support', views: 134 },
                ].map((article, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <h4 className="font-medium text-gray-900 mb-1">{article.title}</h4>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <Badge variant="outline">{article.category}</Badge>
                      <span>{article.views} views</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeDashboard;
