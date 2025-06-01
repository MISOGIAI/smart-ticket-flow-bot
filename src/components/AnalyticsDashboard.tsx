
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Users, Clock, Target, AlertTriangle } from 'lucide-react';

interface AnalyticsDashboardProps {
  currentUser: any;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ currentUser }) => {
  // Sample analytics data
  const ticketVolumeData = [
    { month: 'Jan', tickets: 45, resolved: 42 },
    { month: 'Feb', tickets: 52, resolved: 48 },
    { month: 'Mar', tickets: 38, resolved: 35 },
    { month: 'Apr', tickets: 61, resolved: 58 },
    { month: 'May', tickets: 55, resolved: 52 },
    { month: 'Jun', tickets: 67, resolved: 63 }
  ];

  const departmentData = [
    { name: 'IT Support', value: 45, color: '#3B82F6' },
    { name: 'HR', value: 28, color: '#10B981' },
    { name: 'Admin', value: 18, color: '#F59E0B' },
    { name: 'Facilities', value: 9, color: '#EF4444' }
  ];

  const responseTimeData = [
    { day: 'Mon', avgTime: 2.3 },
    { day: 'Tue', avgTime: 1.8 },
    { day: 'Wed', avgTime: 2.7 },
    { day: 'Thu', avgTime: 2.1 },
    { day: 'Fri', avgTime: 3.2 },
    { day: 'Sat', avgTime: 1.5 },
    { day: 'Sun', avgTime: 1.2 }
  ];

  const aiMetrics = {
    routingAccuracy: 94,
    autoResolved: 23,
    suggestionAcceptance: 78,
    timesSaved: 156
  };

  const patternInsights = [
    {
      type: 'High Volume',
      description: 'Password reset requests up 40% this week',
      severity: 'warning',
      impact: 'IT Department workload increase',
      recommendation: 'Consider self-service password reset implementation'
    },
    {
      type: 'Recurring Issue',
      description: 'VPN connection problems reported 15 times',
      severity: 'error',
      impact: 'Remote work productivity affected',
      recommendation: 'Schedule network infrastructure review'
    },
    {
      type: 'Efficiency Gain',
      description: 'HR policy questions resolved 60% faster',
      severity: 'success',
      impact: 'Improved employee satisfaction',
      recommendation: 'Expand knowledge base with more HR content'
    }
  ];

  const departmentPerformance = [
    {
      department: 'IT Support',
      totalTickets: 45,
      resolved: 42,
      avgResponseTime: '2.3h',
      satisfaction: 4.2,
      agents: 6
    },
    {
      department: 'HR',
      totalTickets: 28,
      resolved: 26,
      avgResponseTime: '1.8h',
      satisfaction: 4.5,
      agents: 3
    },
    {
      department: 'Admin',
      totalTickets: 18,
      resolved: 17,
      avgResponseTime: '3.1h',
      satisfaction: 4.0,
      agents: 2
    },
    {
      department: 'Facilities',
      totalTickets: 9,
      resolved: 8,
      avgResponseTime: '4.2h',
      satisfaction: 3.8,
      agents: 2
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
        <p className="text-gray-600">AI-powered insights and pattern detection</p>
      </div>

      {/* AI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Routing Accuracy</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{aiMetrics.routingAccuracy}%</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto-Resolved</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{aiMetrics.autoResolved}</div>
            <p className="text-xs text-gray-500 mt-1">Tickets this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggestion Acceptance</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{aiMetrics.suggestionAcceptance}%</div>
            <div className="flex items-center text-xs text-purple-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5% improvement
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Saved</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{aiMetrics.timesSaved}h</div>
            <p className="text-xs text-gray-500 mt-1">Through automation</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Volume Trends</CardTitle>
            <CardDescription>Monthly ticket creation and resolution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketVolumeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tickets" fill="#3B82F6" name="Created" />
                <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
            <CardDescription>Ticket distribution by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Average Response Time</CardTitle>
          <CardDescription>Daily average response times (hours)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avgTime" stroke="#3B82F6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pattern Insights */}
      <Card>
        <CardHeader>
          <CardTitle>AI Pattern Detection</CardTitle>
          <CardDescription>Intelligent insights and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {patternInsights.map((insight, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={insight.severity === 'error' ? 'destructive' : 
                            insight.severity === 'warning' ? 'secondary' : 'default'}
                  >
                    {insight.type}
                  </Badge>
                  <h3 className="font-medium">{insight.description}</h3>
                </div>
                {insight.severity === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                {insight.severity === 'warning' && <Clock className="h-5 w-5 text-yellow-500" />}
                {insight.severity === 'success' && <TrendingUp className="h-5 w-5 text-green-500" />}
              </div>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Impact:</strong> {insight.impact}
              </p>
              <p className="text-sm text-blue-600">
                <strong>Recommendation:</strong> {insight.recommendation}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Detailed metrics by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentPerformance.map((dept, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-lg">{dept.department}</h3>
                  <Badge variant="outline">{dept.agents} agents</Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Tickets</p>
                    <p className="text-xl font-bold">{dept.totalTickets}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Resolution Rate</p>
                    <p className="text-xl font-bold">{((dept.resolved / dept.totalTickets) * 100).toFixed(0)}%</p>
                    <Progress value={(dept.resolved / dept.totalTickets) * 100} className="mt-1" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Response</p>
                    <p className="text-xl font-bold">{dept.avgResponseTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Satisfaction</p>
                    <p className="text-xl font-bold">{dept.satisfaction}/5.0</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
