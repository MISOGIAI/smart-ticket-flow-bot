import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Plus, MessageSquare, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import TicketDetailModal from '@/components/TicketDetailModal';

interface TicketListProps {
  currentUser: any;
  onCreateTicket: () => void;
}

const TicketList: React.FC<TicketListProps> = ({ currentUser, onCreateTicket }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch tickets from database
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data: ticketsData, error } = await supabase
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
            category:categories(name),
            department:departments(name)
          `)
          .eq('requester_id', currentUser?.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tickets:', error);
        } else {
          setTickets(ticketsData || []);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchTickets();
    }
  }, [currentUser]);

  const handleTicketClick = (ticketId: string) => {
    setSelectedTicket(ticketId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
  };

  const handleTicketUpdate = () => {
    // Refresh tickets after update
    if (currentUser?.id) {
      const fetchTickets = async () => {
        try {
          const { data: ticketsData, error } = await supabase
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
              category:categories(name),
              department:departments(name)
            `)
            .eq('requester_id', currentUser?.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching tickets:', error);
          } else {
            setTickets(ticketsData || []);
          }
        } catch (error) {
          console.error('Error refreshing tickets:', error);
        }
      };
      
      fetchTickets();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status?.toLowerCase() === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority?.toLowerCase() === filterPriority;
    
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
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
            <p className="text-gray-600">Loading your tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="col-span-full">
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
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-lg">{ticket.title}</CardTitle>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        AI Routed
                      </Badge>
                    </div>
                    <CardDescription className="text-sm text-gray-600">
                      {ticket.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority?.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{ticket.ticket_number}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{ticket.assigned_agent?.name || ticket.department?.name || 'Department'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>
                      <span className="font-medium">{ticket.department?.name || ticket.category?.name || 'General'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{ticket.status?.replace('_', ' ').charAt(0).toUpperCase() + ticket.status?.replace('_', ' ').slice(1)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Created: {formatDate(ticket.created_at)}</span>
                    <span>Updated: {formatDate(ticket.updated_at)}</span>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Created by {ticket.requester?.name || 'You'}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTicketClick(ticket.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticketId={selectedTicket}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentUser={currentUser}
        onTicketUpdate={handleTicketUpdate}
      />
    </div>
  );
};

export default TicketList;
