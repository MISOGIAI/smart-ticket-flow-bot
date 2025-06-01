import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Clock, CheckCircle, Archive, User, Lightbulb, FileText, Sparkles, BarChart3, RefreshCw, AlertCircle } from 'lucide-react';
import { UserProfile } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import TicketDetailModal from '@/components/TicketDetailModal';
import { ticketService } from '@/lib/ticket-service';
import { embeddingsService } from '@/lib/embeddings-service';
import { DEPARTMENT_IDS, getDepartmentNameById, isValidDepartmentId, getDefaultDepartmentId } from '@/lib/constants';
import { useNavigate } from 'react-router-dom';

// Utility function to check database structure
const checkDatabaseSchema = async (currentUser: UserProfile | null) => {
  try {
    console.log('🔍 Checking tickets table structure...');
    
    // Direct query to check the tickets table structure
    console.log('🔍 Checking tickets table with a sample query...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('tickets')
      .select('id, department_id, category_id, assigned_to')
      .limit(1);
      
    if (sampleError) {
      console.error('❌ Error with sample query:', sampleError);
    } else {
      console.log('✅ Sample ticket data:', sampleData);
      console.log('✅ Object keys in ticket:', sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : 'No tickets found');
    }
    
    // Check for tickets with null department_id
    console.log('🔍 Checking for tickets with null department_id...');
    const { data: nullDeptData, error: nullDeptError } = await supabase
      .from('tickets')
      .select('id, title, department_id, category_id')
      .is('department_id', null)
      .limit(5);
      
    if (nullDeptError) {
      console.error('❌ Error checking null department_id tickets:', nullDeptError);
    } else {
      console.log('✅ Tickets with null department_id:', nullDeptData);
      console.log('✅ Count of null department_id tickets:', nullDeptData?.length || 0);
    }
    
    // Additional test query for assigned tickets
    if (currentUser?.department_id) {
      console.log('🔍 Testing query for tickets by department_id:', currentUser.department_id);
      
      // Check if current user's department_id is in our hardcoded mapping
      let departmentId = currentUser.department_id;
      const knownDepartmentName = getDepartmentNameById(departmentId);
      console.log('🔍 Mapped department name:', knownDepartmentName);
      
      const { data: testData, error: testError } = await supabase
        .from('tickets')
        .select('id, department_id')
        .eq('department_id', departmentId)
        .limit(5);
        
      if (testError) {
        console.error('❌ Error with department_id query:', testError);
      } else {
        console.log('✅ Department tickets test query result:', testData);
        console.log('✅ Count of tickets by department_id:', testData?.length || 0);
      }
    }
  } catch (err) {
    console.error('❌ Error checking database schema:', err);
  }
};

interface SupportAgentDashboardProps {
  currentUser: UserProfile;
}

const SupportAgentDashboard: React.FC<SupportAgentDashboardProps> = ({ currentUser }) => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignedTickets, setAssignedTickets] = useState<any[]>([]);
  const [departmentQueue, setDepartmentQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userDepartmentId, setUserDepartmentId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Determine the correct department ID when component mounts
  useEffect(() => {
    if (currentUser?.department_id) {
      const deptId = currentUser.department_id;
      console.log('🔍 Original user department_id:', deptId);
      
      // Validate if it's one of our known department IDs
      if (isValidDepartmentId(deptId)) {
        console.log('✅ User department_id is valid:', deptId);
        setUserDepartmentId(deptId);
      } else {
        console.warn('⚠️ User department_id not recognized:', deptId);
        
        // Try to infer department from role or other info
        // For now, default to IT Support if we can't determine
        const defaultDeptId = getDefaultDepartmentId();
        console.log('🔄 Setting default department_id:', defaultDeptId);
        setUserDepartmentId(defaultDeptId);
      }
    }
  }, [currentUser]);

  // Fetch tickets from database
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        console.log('🔍 Fetching tickets for user:', currentUser);
        console.log('🔍 User department_id:', currentUser?.department_id);
        console.log('🔍 Using department_id for queries:', userDepartmentId);
        
        // Check database schema first
        await checkDatabaseSchema(currentUser);
        
        // Fetch tickets assigned to current user
        const { data: assignedData, error: assignedError } = await supabase
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
            category:categories(name),
            department:departments(name)
          `)
          .eq('assigned_to', currentUser?.id)
          .order('created_at', { ascending: false });

        if (assignedError) {
          console.error('❌ Error fetching assigned tickets:', assignedError);
        } else {
          console.log('✅ Assigned tickets fetched:', assignedData);
          setAssignedTickets(assignedData || []);
        }

        // Fetch unassigned tickets in user's department
        if (userDepartmentId) {
          console.log('🔍 Fetching department queue with department_id:', userDepartmentId);
          
          const { data: queueData, error: queueError } = await supabase
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
              category:categories(name),
              department:departments(name)
            `)
            .is('assigned_to', null)
            .eq('department_id', userDepartmentId)
            .order('created_at', { ascending: false });

          if (queueError) {
            console.error('❌ Error fetching department queue:', queueError);
            console.error('❌ Error details:', JSON.stringify(queueError, null, 2));
          } else {
            console.log('✅ Department queue fetched successfully');
            console.log('✅ Department queue data count:', queueData?.length || 0);
            console.log('✅ Department queue data:', queueData);
            setDepartmentQueue(queueData || []);
          }
        } else {
          console.warn('⚠️ No department_id available for current user:', currentUser);
        }
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.id && userDepartmentId) {
      fetchTickets();
    } else if (currentUser?.id) {
      // If we have the user but not the department ID yet, set loading state
      setIsLoading(true);
    }
  }, [currentUser, userDepartmentId]);

  // Fetch all tickets for AI training when component mounts
  useEffect(() => {
    const fetchAllTicketsForAI = async () => {
      try {
        console.log('SupportAgentDashboard: Initializing AI training data fetch');
        const allTickets = await ticketService.getAllTicketsWithRelations();
        console.log(`SupportAgentDashboard: AI training data ready with ${allTickets.length} tickets`);
        
        // Generate embeddings for all tickets
        console.log('SupportAgentDashboard: Starting embedding generation process');
        const embeddings = await embeddingsService.processTickets(allTickets);
        
        // Store embeddings in localStorage
        embeddingsService.storeEmbeddings(embeddings);
        console.log('SupportAgentDashboard: Embedding generation and storage complete');
      } catch (error) {
        console.error('SupportAgentDashboard: Error in AI training process:', error);
      }
    };

    fetchAllTicketsForAI();
  }, []);

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
    if (currentUser?.id && userDepartmentId) {
      const fetchTickets = async () => {
        try {
          // Fetch tickets assigned to current user
          const { data: assignedData, error: assignedError } = await supabase
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
              category:categories(name),
              department:departments(name)
            `)
            .eq('assigned_to', currentUser.id)
            .order('created_at', { ascending: false });

          if (!assignedError) {
            setAssignedTickets(assignedData || []);
          }

          // Fetch unassigned tickets in user's department
          if (userDepartmentId) {
            console.log('🔄 Refreshing department queue with department_id:', userDepartmentId);
            
            const { data: queueData, error: queueError } = await supabase
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
                category:categories(name),
                department:departments(name)
              `)
              .is('assigned_to', null)
              .eq('department_id', userDepartmentId)
              .order('created_at', { ascending: false });

            if (!queueError) {
              console.log('✅ Department queue refreshed successfully');
              console.log('✅ Updated department queue count:', queueData?.length || 0);
              console.log('✅ First few items:', queueData?.slice(0, 3));
              setDepartmentQueue(queueData || []);
            } else {
              console.error('❌ Error refreshing department queue:', queueError);
              console.error('❌ Error details:', JSON.stringify(queueError, null, 2));
            }
          } else {
            console.warn('⚠️ No department_id available for refresh:', currentUser);
          }
        } catch (error) {
          console.error('Error refreshing tickets:', error);
        }
      };
      
      fetchTickets();
    }
  };

  const fetchUnassignedTickets = async () => {
    // Existing code for fetching unassigned tickets
  };

  // Add a new component for the AI tools section
  const renderAIToolsSection = () => (
    <Card className="border-blue-200 hover:border-blue-400 transition-colors">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          AI Pattern Detection
        </CardTitle>
        <CardDescription>
          Analyze department tickets to identify patterns, automation opportunities, and potential issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-gray-600">
          Use AI to analyze ticket patterns in your department to:
        </p>
        <ul className="mb-4 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <BarChart3 className="h-4 w-4 mt-0.5 text-blue-500" />
            <span>Identify common issues and trends</span>
          </li>
          <li className="flex items-start gap-2">
            <RefreshCw className="h-4 w-4 mt-0.5 text-blue-500" />
            <span>Detect repetitive work that could be automated</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 text-blue-500" />
            <span>Recognize potential misuse patterns</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          onClick={() => navigate('/pattern-detection')}
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Open Pattern Detection
        </Button>
      </CardFooter>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Support Agent Dashboard Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Support Agent Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {currentUser?.name}! Manage and resolve support tickets efficiently.
        </p>
      </div>

      {/* AI Tools & Quick Stats Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* First 3 stats cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Assigned Tickets
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              {assignedTickets.filter(t => t.status === 'open').length} open / {assignedTickets.filter(t => t.status === 'in_progress').length} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Department Queue
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentQueue.length}</div>
            <p className="text-xs text-muted-foreground">
              Unassigned tickets in your department
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved This Week
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedTickets.filter(ticket => 
                ticket.status === 'resolved' && 
                new Date(ticket.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tickets you've resolved in the past 7 days
            </p>
          </CardContent>
        </Card>

        {/* AI Pattern Detection Card */}
        {renderAIToolsSection()}
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
                        className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(ticket.priority)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 cursor-pointer" onClick={() => handleTicketClick(ticket.id)}>
                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusIcon(ticket.status)}
                              <span className="font-medium">{ticket.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {ticket.ticket_number || ticket.id}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>Requester: {ticket.requester?.name || 'Unknown'}</span>
                              <span>•</span>
                              <span>{formatDate(ticket.created_at)}</span>
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
                            <div className="flex flex-col space-y-2">
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
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="flex items-center gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTicketClick(ticket.id);
                                }}
                              >
                                <Sparkles className="h-3 w-3 text-purple-600" />
                                Smart Reply
                              </Button>
                            </div>
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
                    {departmentQueue.length > 0 ? (
                      departmentQueue.map((ticket) => (
                        <div
                          key={ticket.id}
                          className={`border-l-4 p-4 rounded-r-lg ${getPriorityColor(ticket.priority)}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 cursor-pointer" onClick={() => handleTicketClick(ticket.id)}>
                              <div className="flex items-center space-x-2 mb-2">
                                {getStatusIcon(ticket.status)}
                                <span className="font-medium">{ticket.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {ticket.ticket_number || ticket.id}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                <span>Requester: {ticket.requester?.name || 'Unknown'}</span>
                                <span>•</span>
                                <span>{formatDate(ticket.created_at)}</span>
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
                              <div className="flex flex-col space-y-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Assign to current user logic would go here
                                  }}
                                >
                                  Assign to Me
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="flex items-center gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTicketClick(ticket.id);
                                  }}
                                >
                                  <Sparkles className="h-3 w-3 text-purple-600" />
                                  Smart Reply
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No department queue tickets found</h3>
                        <p className="text-gray-600 mb-2">
                          There are no unassigned tickets in your department. 
                        </p>
                        <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mt-2 text-left">
                          <p className="font-medium">Debug Info:</p>
                          <p>Department: {getDepartmentNameById(userDepartmentId || '')}</p>
                          <p>Department ID: {userDepartmentId || 'Not set'}</p>
                          <p>Original User Dept ID: {currentUser?.department_id || 'Not set'}</p>
                          <p>Using hardcoded department mapping</p>
                        </div>
                      </div>
                    )}
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

export default SupportAgentDashboard;
