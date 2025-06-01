import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, MessageSquare, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { UserProfile } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { ticketService } from '@/lib/ticket-service';
import { embeddingsService } from '@/lib/embeddings-service';

interface ManagerDashboardProps {
  currentUser: UserProfile;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ currentUser }) => {
  const [departmentTickets, setDepartmentTickets] = useState<any[]>([]);
  const [departmentAgents, setDepartmentAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch department data
  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        if (!currentUser?.department_id) return;

        // Fetch tickets for the manager's department
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets')
          .select(`
            id,
            title,
            description,
            priority,
            status,
            ticket_number,
            created_at,
            updated_at,
            requester:users!tickets_requester_id_fkey(name),
            assigned_agent:users!tickets_assigned_to_fkey(name),
            category:categories(name)
          `)
          .eq('department_id', currentUser.department_id)
          .order('created_at', { ascending: false });

        if (ticketsError) {
          console.error('Error fetching department tickets:', ticketsError);
        } else {
          setDepartmentTickets(ticketsData || []);
        }

        // Fetch agents in the manager's department
        const { data: agentsData, error: agentsError } = await supabase
          .from('users')
          .select(`
            id,
            name,
            email,
            role,
            job_title,
            expertise_areas
          `)
          .eq('department_id', currentUser.department_id)
          .eq('role', 'support_agent');

        if (agentsError) {
          console.error('Error fetching department agents:', agentsError);
        } else {
          setDepartmentAgents(agentsData || []);
        }
      } catch (error) {
        console.error('Error fetching department data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartmentData();
  }, [currentUser]);

  // Fetch all tickets for AI training when component mounts
  useEffect(() => {
    const fetchAllTicketsForAI = async () => {
      try {
        console.log('ManagerDashboard: Initializing AI training data fetch');
        const allTickets = await ticketService.getAllTicketsWithRelations();
        console.log(`ManagerDashboard: AI training data ready with ${allTickets.length} tickets`);
        
        // Generate embeddings for all tickets
        console.log('ManagerDashboard: Starting embedding generation process');
        const embeddings = await embeddingsService.processTickets(allTickets);
        
        // Store embeddings in localStorage
        embeddingsService.storeEmbeddings(embeddings);
        console.log('ManagerDashboard: Embedding generation and storage complete');
      } catch (error) {
        console.error('ManagerDashboard: Error in AI training process:', error);
      }
    };

    fetchAllTicketsForAI();
  }, []);

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'Support Agent',
      assignedTickets: 8,
      resolvedToday: 3,
      avgResponseTime: '2.1h',
      status: 'active'
    },
    {
      name: 'Tom Wilson',
      role: 'Support Agent',
      assignedTickets: 6,
      resolvedToday: 4,
      avgResponseTime: '1.8h',
      status: 'active'
    }
  ];

  const weeklyData = [
    { day: 'Mon', tickets: 12, resolved: 10 },
    { day: 'Tue', tickets: 15, resolved: 13 },
    { day: 'Wed', tickets: 18, resolved: 16 },
    { day: 'Thu', tickets: 14, resolved: 12 },
    { day: 'Fri', tickets: 20, resolved: 18 },
    { day: 'Sat', tickets: 8, resolved: 7 },
    { day: 'Sun', tickets: 5, resolved: 5 }
  ];

  const responseTimeData = [
    { hour: '9AM', avgTime: 2.5 },
    { hour: '10AM', avgTime: 1.8 },
    { hour: '11AM', avgTime: 2.1 },
    { hour: '12PM', avgTime: 3.2 },
    { hour: '1PM', avgTime: 2.8 },
    { hour: '2PM', avgTime: 1.9 },
    { hour: '3PM', avgTime: 2.3 },
    { hour: '4PM', avgTime: 2.7 }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-amber-600 bg-amber-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
      {/* Department Overview */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Department Management</h1>
        <p className="text-indigo-100">IT Support Department - {currentUser.name}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold">{departmentTickets.length}</p>
                <p className="text-xs text-green-600">+12% this week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Team Members</p>
                <p className="text-2xl font-bold">{departmentAgents.length}</p>
                <p className="text-xs text-blue-600">All active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold">2.0h</p>
                <p className="text-xs text-green-600">-15% vs last week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-xs text-green-600">+3% vs target</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Team Overview</TabsTrigger>
          <TabsTrigger value="tickets">All Tickets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Individual agent metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentAgents.map((agent, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{agent.name}</h4>
                          <p className="text-sm text-gray-600">{agent.role}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          {agent.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Assigned</p>
                          <p className="font-semibold">{agent.assignedTickets}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Resolved Today</p>
                          <p className="font-semibold">{agent.resolvedToday}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg Response</p>
                          <p className="font-semibold">{agent.avgResponseTime}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Ticket Volume</CardTitle>
                <CardDescription>New vs resolved tickets this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tickets" fill="#3b82f6" name="New Tickets" />
                    <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Department Tickets</CardTitle>
                  <CardDescription>All tickets in your department</CardDescription>
                </div>
                <Button variant="outline">
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentTickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{ticket.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {ticket.id}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Requester: {ticket.requester}</span>
                          <span>•</span>
                          <span>Assigned to: {ticket.assigned_agent}</span>
                          <span>•</span>
                          <span>{formatDate(ticket.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Reassign
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
                <CardDescription>Average response time throughout the day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgTime" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key department indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <span className="text-green-600 font-bold">4.7/5</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">First Contact Resolution</span>
                  <span className="text-blue-600 font-bold">78%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm font-medium">Escalation Rate</span>
                  <span className="text-amber-600 font-bold">12%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">SLA Compliance</span>
                  <span className="text-purple-600 font-bold">96%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>Export detailed analytics and performance reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex-col">
                  <CheckCircle className="h-6 w-6 mb-2" />
                  Weekly Performance Report
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Team Productivity Report
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Trend Analysis Report
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <AlertCircle className="h-6 w-6 mb-2" />
                  SLA Compliance Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerDashboard;
