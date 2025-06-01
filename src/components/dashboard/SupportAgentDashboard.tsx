
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Clock, CheckCircle, Archive, User, Lightbulb, FileText } from 'lucide-react';
import { UserProfile } from '@/components/auth/AuthProvider';

interface SupportAgentDashboardProps {
  currentUser: UserProfile;
}

const SupportAgentDashboard: React.FC<SupportAgentDashboardProps> = ({ currentUser }) => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  // Sample data for agent's tickets
  const assignedTickets = [
    {
      id: 'TK-001',
      title: 'Password reset request',
      requester: 'Mike Chen',
      priority: 'high',
      status: 'open',
      created: '2024-01-15T10:30:00Z',
      category: 'IT Support',
      description: 'Unable to access email account after returning from vacation'
    },
    {
      id: 'TK-002',
      title: 'Software installation request',
      requester: 'Lisa Wong',
      priority: 'medium',
      status: 'in_progress',
      created: '2024-01-14T14:20:00Z',
      category: 'IT Support',
      description: 'Need Adobe Creative Suite for marketing projects'
    }
  ];

  const departmentQueue = [
    {
      id: 'TK-009',
      title: 'Network connectivity issue',
      requester: 'John Smith',
      priority: 'critical',
      status: 'open',
      created: '2024-01-15T15:45:00Z',
      category: 'IT Support'
    },
    {
      id: 'TK-010',
      title: 'Printer not working',
      requester: 'Sarah Johnson',
      priority: 'low',
      status: 'open',
      created: '2024-01-15T11:20:00Z',
      category: 'IT Support'
    }
  ];

  const responseTemplates = [
    {
      title: 'Password Reset Instructions',
      content: 'To reset your password, please follow these steps: 1. Go to the login page...',
      category: 'IT Support'
    },
    {
      title: 'Software Installation Process',
      content: 'Software installation requests require approval from your manager...',
      category: 'IT Support'
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
      {/* Agent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Assigned</p>
                <p className="text-2xl font-bold">{assignedTickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">
                  {assignedTickets.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Resolved Today</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold">2.1h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Ticket Area */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="assigned" className="space-y-4">
            <TabsList>
              <TabsTrigger value="assigned">My Tickets ({assignedTickets.length})</TabsTrigger>
              <TabsTrigger value="queue">Department Queue ({departmentQueue.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="assigned" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assigned Tickets</CardTitle>
                  <CardDescription>Tickets currently assigned to you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignedTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(ticket.priority)} hover:shadow-md transition-shadow cursor-pointer`}
                        onClick={() => setSelectedTicket(ticket.id)}
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
                            <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Requester: {ticket.requester}</span>
                              <span>•</span>
                              <span>{formatDate(ticket.created)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Badge 
                              variant="outline"
                              className={
                                ticket.priority === 'critical' ? 'text-red-800 border-red-300' :
                                ticket.priority === 'high' ? 'text-orange-800 border-orange-300' :
                                ticket.priority === 'medium' ? 'text-amber-800 border-amber-300' :
                                'text-green-800 border-green-300'
                              }
                            >
                              {ticket.priority.toUpperCase()}
                            </Badge>
                            <Select defaultValue={ticket.status}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="queue" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Department Queue</CardTitle>
                  <CardDescription>Unassigned tickets in your department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {departmentQueue.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(ticket.priority)} hover:shadow-md transition-shadow`}
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
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                              <span>Requester: {ticket.requester}</span>
                              <span>•</span>
                              <span>{formatDate(ticket.created)}</span>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Badge 
                              variant="outline"
                              className={
                                ticket.priority === 'critical' ? 'text-red-800 border-red-300' :
                                ticket.priority === 'high' ? 'text-orange-800 border-orange-300' :
                                ticket.priority === 'medium' ? 'text-amber-800 border-amber-300' :
                                'text-green-800 border-green-300'
                              }
                            >
                              {ticket.priority.toUpperCase()}
                            </Badge>
                            <Button size="sm" variant="outline">
                              Assign to Me
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <span>AI Suggestions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">Quick Resolution</p>
                <p className="text-xs text-blue-700">This looks like a common password reset issue. Use template #1.</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-900">Knowledge Base</p>
                <p className="text-xs text-green-700">Similar issue resolved 3 times this week. Check KB article #245.</p>
              </div>
            </CardContent>
          </Card>

          {/* Response Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <span>Quick Templates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {responseTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3"
                >
                  <div>
                    <p className="font-medium text-sm">{template.title}</p>
                    <p className="text-xs text-gray-500 truncate">{template.content}</p>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupportAgentDashboard;
