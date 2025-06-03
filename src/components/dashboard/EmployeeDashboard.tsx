import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, CheckCircle, Plus, Search, Lightbulb } from 'lucide-react';
import { UserProfile } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { ticketService } from '@/lib/ticket-service';
import { embeddingsService } from '@/lib/embeddings-service';

interface EmployeeDashboardProps {
  currentUser: UserProfile;
  onCreateTicket: () => void;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ currentUser, onCreateTicket }) => {
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's tickets from database
  useEffect(() => {
    const fetchUserTickets = async () => {
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select(`
            id,
            title,
            description,
            status,
            priority,
            ticket_number,
            created_at,
            assigned_to,
            users!tickets_assigned_to_fkey(name),
            department:departments(name)
          `)
          .eq('requester_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tickets:', error);
        } else {
          setMyTickets(data || []);
        }
      } catch (error) {
        console.error('Error fetching user tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchUserTickets();
    }
  }, [currentUser]);

  // Fetch all tickets for AI training when component mounts
  useEffect(() => {
    const fetchAllTicketsForAI = async () => {
      try {
        console.log('EmployeeDashboard: Initializing AI training data fetch');
        const allTickets = await ticketService.getAllTicketsWithRelations();
        console.log(`EmployeeDashboard: AI training data ready with ${allTickets.length} tickets`);
        
        // Generate embeddings for all tickets
        console.log('EmployeeDashboard: Starting embedding generation process');
        const embeddings = await embeddingsService.processTickets(allTickets);
        
        // Store embeddings in localStorage
        embeddingsService.storeEmbeddings(embeddings);
        console.log('EmployeeDashboard: Embedding generation and storage complete');
      } catch (error) {
        console.error('EmployeeDashboard: Error in AI training process:', error);
      }
    };

    fetchAllTicketsForAI();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-amber-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
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
        <h1 className="text-2xl font-bold mb-2">Welcome back, {currentUser.name}!</h1>
        <p className="text-blue-100">Employee Help Desk Portal</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold">{myTickets.filter(t => t.status === 'open').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{myTickets.filter(t => t.status === 'in_progress').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Resolved This Month</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tickets */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Tickets</CardTitle>
                  <CardDescription>Your submitted support requests</CardDescription>
                </div>
                <Button onClick={onCreateTicket} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading your tickets...</p>
                  </div>
                ) : myTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">You haven't created any tickets yet.</p>
                    <Button onClick={onCreateTicket} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Ticket
                    </Button>
                  </div>
                ) : (
                  myTickets.map((ticket) => (
                    <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{ticket.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {ticket.ticket_number}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Created: {formatDate(ticket.created_at)}</span>
                            <span>•</span>
                            <span>Assigned to: {ticket.users?.name || ticket.department?.name}</span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Help */}
        <div className="space-y-4">
          {/* Self-Service Bot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <span>Self-Service Bot</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">Try asking our AI assistant before creating a ticket:</p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  "How do I reset my password?"
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  "VPN connection issues"
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  "Software installation help"
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={onCreateTicket} className="w-full bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Submit New Ticket
              </Button>
              <Button variant="outline" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search Knowledge Base
              </Button>
            </CardContent>
          </Card>

          {/* Recent Solutions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Solutions</CardTitle>
              <CardDescription>Solutions that helped you before</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-900">Password Reset</p>
                <p className="text-xs text-green-700">Self-service via company portal</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">VPN Setup</p>
                <p className="text-xs text-blue-700">Download from IT resources page</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
