
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus, MessageSquare, Clock, User } from 'lucide-react';

interface TicketListProps {
  currentUser: any;
  onCreateTicket: () => void;
}

const TicketList: React.FC<TicketListProps> = ({ currentUser, onCreateTicket }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Sample ticket data with AI routing results
  const tickets = [
    {
      id: 'TK-001',
      title: 'Password reset request',
      description: 'Unable to access email account after returning from vacation',
      category: 'IT Support',
      priority: 'High',
      status: 'Open',
      assignedTo: 'Sarah Johnson',
      assignedDepartment: 'IT Support',
      createdBy: 'Mike Chen',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      responseTime: null,
      aiRouted: true
    },
    {
      id: 'TK-002',
      title: 'Software installation request',
      description: 'Need Adobe Creative Suite for marketing projects',
      category: 'IT Support',
      priority: 'Medium',
      status: 'In Progress',
      assignedTo: 'David Kumar',
      assignedDepartment: 'IT Support',
      createdBy: 'Lisa Wong',
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-15T09:15:00Z',
      responseTime: '2.5h',
      aiRouted: true
    },
    {
      id: 'TK-003',
      title: 'Leave policy clarification',
      description: 'Questions about maternity leave benefits',
      category: 'HR Query',
      priority: 'Low',
      status: 'Resolved',
      assignedTo: 'Jennifer Adams',
      assignedDepartment: 'HR',
      createdBy: 'Emma Davis',
      createdAt: '2024-01-13T11:45:00Z',
      updatedAt: '2024-01-14T16:30:00Z',
      responseTime: '4.2h',
      aiRouted: true
    },
    {
      id: 'TK-004',
      title: 'Office space heater not working',
      description: 'Conference room B heater has been broken for 2 days',
      category: 'Facilities',
      priority: 'Medium',
      status: 'In Progress',
      assignedTo: 'Robert Brown',
      assignedDepartment: 'Facilities',
      createdBy: 'Alex Thompson',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-01-15T08:30:00Z',
      responseTime: '0.5h',
      aiRouted: true
    },
    {
      id: 'TK-005',
      title: 'Document access request',
      description: 'Need access to Q4 financial reports for presentation',
      category: 'Admin Request',
      priority: 'High',
      status: 'Pending',
      assignedTo: 'Maria Garcia',
      assignedDepartment: 'Admin',
      createdBy: 'James Wilson',
      createdAt: '2024-01-15T13:15:00Z',
      updatedAt: '2024-01-15T13:15:00Z',
      responseTime: null,
      aiRouted: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status.toLowerCase() === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority.toLowerCase() === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tickets</h2>
          <p className="text-gray-600">Manage and track support requests</p>
        </div>
        <Button onClick={onCreateTicket} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-lg">{ticket.title}</CardTitle>
                    {ticket.aiRouted && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        AI Routed
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    {ticket.description}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{ticket.id}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{ticket.assignedTo}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    <span className="font-medium">{ticket.assignedDepartment}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{ticket.responseTime || 'Pending'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Created: {formatDate(ticket.createdAt)}</span>
                  <span>Updated: {formatDate(ticket.updatedAt)}</span>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Created by {ticket.createdBy}</span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== 'all' || filterPriority !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Create your first ticket to get started'}
            </p>
            <Button onClick={onCreateTicket}>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TicketList;
