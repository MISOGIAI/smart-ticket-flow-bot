
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Clock, TrendingUp, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';
import { UserProfile } from '@/components/auth/AuthProvider';

interface ManagerDashboardProps {
  currentUser: UserProfile;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ currentUser }) => {
  // Sample analytics data
  const weeklyData = [
    { day: 'Mon', tickets: 24, resolved: 18 },
    { day: 'Tue', tickets: 28, resolved: 22 },
    { day: 'Wed', tickets: 32, resolved: 25 },
    { day: 'Thu', tickets: 19, resolved: 16 },
    { day: 'Fri', tickets: 26, resolved: 24 },
    { day: 'Sat', tickets: 8, resolved: 6 },
    { day: 'Sun', tickets: 5, resolved: 4 }
  ];

  const responseTimeData = [
    { day: 'Mon', avgTime: 2.3 },
    { day: 'Tue', avgTime: 1.8 },
    { day: 'Wed', avgTime: 2.1 },
    { day: 'Thu', avgTime: 1.9 },
    { day: 'Fri', avgTime: 2.5 },
    { day: 'Sat', avgTime: 3.2 },
    { day: 'Sun', avgTime: 2.8 }
  ];

  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'Senior Support Agent',
      assignedTickets: 8,
      resolvedToday: 3,
      avgResponseTime: '1.2h',
      status: 'available'
    },
    {
      name: 'David Kumar',
      role: 'Support Agent',
      assignedTickets: 12,
      resolvedToday: 5,
      avgResponseTime: '2.1h',
      status: 'busy'
    },
    {
      name: 'Jennifer Adams',
      role: 'Support Agent',
      assignedTickets: 6,
      resolvedToday: 4,
      avgResponseTime: '1.8h',
      status: 'available'
    }
  ];

  const departmentTickets = [
    {
      id: 'TK-001',
      title: 'Password reset request',
      requester: 'Mike Chen',
      assignedTo: 'Sarah Johnson',
      priority: 'high',
      status: 'open',
      created: '2024-01-15T10:30:00Z'
    },
    {
      id: 'TK-002',
      title: 'Software installation',
      requester: 'Lisa Wong',
      assignedTo: 'David Kumar',
      priority: 'medium',
      status: 'in_progress',
      created: '2024-01-14T14:20:00Z'
    },
    {
      id: 'TK-009',
      title: 'Network connectivity issue',
      requester: 'John Smith',
      assignedTo: null,
      priority: 'critical',
      status: 'open',
      created: '2024-01-15T15:45:00Z'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="space-y-6">
      {/* Department Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">IT Support Department</h1>
        <p className="text-blue-100">Department Overview & Team Management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold">142</p>
                <p className="text-xs text-green-600">+12% vs last week</p>
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
                <p className="text-2xl font-bold">2.3h</p>
                <p className="text-xs text-red-600">+15% vs target</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Resolution Rate</p>
                <p className="text-2xl font-bold">89%</p>
                <p className="text-xs text-green-600">+3% vs last week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Satisfaction</p>
                <p className="text-2xl font-bold">4.6/5</p>
                <p className="text-xs text-green-600">+0.2 vs last month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
          <TabsTrigger value="tickets">All Tickets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Ticket Volume</CardTitle>
                <CardDescription>Tickets created vs resolved this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="tickets" fill="#3b82f6" name="Created" />
                    <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Trend</CardTitle>
                <CardDescription>Average response time in hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgTime" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Performance</span>
              </CardTitle>
              <CardDescription>Monitor your team's workload and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge 
                          variant={member.status === 'available' ? 'default' : 'secondary'}
                          className={member.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}
                        >
                          {member.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-600">Assigned</p>
                        <p className="font-semibold">{member.assignedTickets}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Resolved Today</p>
                        <p className="font-semibold">{member.resolvedToday}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Response</p>
                        <p className="font-semibold">{member.avgResponseTime}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Tickets</CardTitle>
              <CardDescription>All tickets in your department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(ticket.priority)} hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">{ticket.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {ticket.id}
                          </Badge>
                          {!ticket.assignedTo && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Unassigned
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Requester: {ticket.requester}</span>
                          {ticket.assignedTo && (
                            <>
                              <span>•</span>
                              <span>Assigned to: {ticket.assignedTo}</span>
                            </>
                          )}
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
                        {!ticket.assignedTo && (
                          <Button size="sm" variant="outline">
                            Assign
                          </Button>
                        )}
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
                <CardTitle>Ticket Categories</CardTitle>
                <CardDescription>Distribution of ticket types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { category: 'Password Reset', count: 45, percentage: 32 },
                    { category: 'Software Issues', count: 38, percentage: 27 },
                    { category: 'Hardware Problems', count: 28, percentage: 20 },
                    { category: 'Network Issues', count: 31, percentage: 21 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.category}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">First Response SLA</span>
                  <span className="text-green-600 font-bold">94%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm font-medium">Resolution SLA</span>
                  <span className="text-amber-600 font-bold">87%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Customer Satisfaction</span>
                  <span className="text-blue-600 font-bold">4.6/5</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Reopened Tickets</span>
                  <span className="text-purple-600 font-bold">3%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerDashboard;
