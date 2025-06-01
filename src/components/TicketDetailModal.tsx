import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Archive, 
  User, 
  Lightbulb, 
  FileText, 
  Send,
  Copy,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Calendar,
  Tag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/components/auth/AuthProvider';

interface TicketDetailModalProps {
  ticketId: string | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onTicketUpdate: () => void;
}

interface TicketDetails {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  ticket_number: string;
  created_at: string;
  updated_at: string;
  requester: { name: string; email: string } | null;
  category: { name: string } | null;
  department: { name: string } | null;
  assigned_agent: { name: string } | null;
}

interface AIResponse {
  id: string;
  title: string;
  content: string;
  confidence: number;
  category: string;
  reasoning: string;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticketId,
  isOpen,
  onClose,
  currentUser,
  onTicketUpdate
}) => {
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AIResponse[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  // Mock AI response suggestions - In a real app, this would come from an AI service
  const generateAISuggestions = (ticketData: TicketDetails): AIResponse[] => {
    const suggestions: AIResponse[] = [];
    
    // Password reset suggestion
    if (ticketData.title.toLowerCase().includes('password') || 
        ticketData.description.toLowerCase().includes('password')) {
      suggestions.push({
        id: 'pwd-reset-1',
        title: 'Password Reset Instructions',
        content: `Hi ${ticketData.requester?.name || 'there'},\n\nI understand you're having trouble with your password. I'll help you reset it right away.\n\nPlease follow these steps:\n1. Go to our login page\n2. Click "Forgot Password"\n3. Enter your email address\n4. Check your email for the reset link\n5. Follow the instructions in the email\n\nIf you don't receive the email within 5 minutes, please check your spam folder. If you still don't see it, let me know and I'll send a manual reset.\n\nBest regards,\n${currentUser.name}`,
        confidence: 95,
        category: 'Password Support',
        reasoning: 'High confidence based on keywords "password" in ticket title/description'
      });
    }

    // Software installation suggestion
    if (ticketData.title.toLowerCase().includes('software') || 
        ticketData.title.toLowerCase().includes('install')) {
      suggestions.push({
        id: 'software-install-1',
        title: 'Software Installation Process',
        content: `Hello ${ticketData.requester?.name || 'there'},\n\nThank you for your software installation request. I'll guide you through our process.\n\nTo proceed with the installation:\n1. Please confirm the specific software name and version needed\n2. Verify you have manager approval (if required)\n3. I'll check software licensing and compatibility\n4. Schedule installation during your preferred time\n\nFor security reasons, all software installations must be performed by IT staff. I'll coordinate with you to find a convenient time.\n\nExpected timeline: 1-2 business days\n\nBest regards,\n${currentUser.name}`,
        confidence: 88,
        category: 'Software Support',
        reasoning: 'Detected software installation request based on title keywords'
      });
    }

    // General technical issue
    if (suggestions.length === 0) {
      suggestions.push({
        id: 'general-1',
        title: 'Initial Response - Information Gathering',
        content: `Hi ${ticketData.requester?.name || 'there'},\n\nThank you for contacting IT support. I've received your request and I'm here to help.\n\nTo better assist you, could you please provide:\n1. What specific error messages (if any) are you seeing?\n2. When did this issue first occur?\n3. Have you tried any troubleshooting steps already?\n4. Is this affecting your work urgently?\n\nI'll prioritize this based on the impact to your productivity. In the meantime, I'm researching similar cases to provide you with the best solution.\n\nBest regards,\n${currentUser.name}`,
        confidence: 75,
        category: 'General Support',
        reasoning: 'Generic response for information gathering when specific issue type cannot be determined'
      });
    }

    return suggestions;
  };

  // Fetch ticket details
  useEffect(() => {
    const fetchTicketDetails = async () => {
      if (!ticketId || !isOpen) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
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
            requester:users!tickets_requester_id_fkey(name, email),
            category:categories(name),
            department:departments(name),
            assigned_agent:users!tickets_assigned_to_fkey(name)
          `)
          .eq('id', ticketId)
          .single();

        if (error) {
          console.error('Error fetching ticket details:', error);
          return;
        }

        setTicket(data);
        setNewStatus(data.status);
        
        // Generate AI suggestions based on ticket content
        const suggestions = generateAISuggestions(data);
        setAiSuggestions(suggestions);
        
      } catch (error) {
        console.error('Error fetching ticket details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketDetails();
  }, [ticketId, isOpen]);

  const handleSubmitResponse = async () => {
    if (!ticket || !response.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Update ticket status if changed
      if (newStatus !== ticket.status) {
        const { error: statusError } = await supabase
          .from('tickets')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', ticket.id);

        if (statusError) {
          console.error('Error updating ticket status:', statusError);
          return;
        }
      }

      // Add response as a comment/note (you might need to create a ticket_responses table)
      // For now, we'll just log it
      console.log('Response submitted:', {
        ticketId: ticket.id,
        response,
        internalNotes,
        status: newStatus,
        agentId: currentUser.id
      });

      // Reset form
      setResponse('');
      setInternalNotes('');
      setSelectedSuggestion(null);
      
      // Notify parent component
      onTicketUpdate();
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseSuggestion = (suggestion: AIResponse) => {
    setResponse(suggestion.content);
    setSelectedSuggestion(suggestion.id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

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
      case 'critical': return 'text-red-800 border-red-300 bg-red-50';
      case 'high': return 'text-orange-800 border-orange-300 bg-orange-50';
      case 'medium': return 'text-amber-800 border-amber-300 bg-amber-50';
      case 'low': return 'text-green-800 border-green-300 bg-green-50';
      default: return 'text-gray-800 border-gray-300 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !ticketId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Ticket Details</span>
            {ticket && (
              <Badge variant="outline" className="ml-2">
                {ticket.ticket_number || ticket.id}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading ticket details...</div>
          </div>
        ) : ticket ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Ticket Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{ticket.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{ticket.requester?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(ticket.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Tag className="h-4 w-4" />
                          <span>{ticket.category?.name || 'General'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(ticket.status)}
                        <span className="text-sm capitalize">{ticket.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Department:</span>
                        <span className="ml-2">{ticket.department?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Assigned to:</span>
                        <span className="ml-2">{ticket.assigned_agent?.name || 'Unassigned'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Last Updated:</span>
                        <span className="ml-2">{formatDate(ticket.updated_at)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Requester Email:</span>
                        <span className="ml-2">{ticket.requester?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Response</CardTitle>
                  <CardDescription>Compose your response to the customer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Type your response here..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Update Status</label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Internal Notes (Optional)</label>
                      <Textarea
                        placeholder="Add internal notes..."
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubmitResponse}
                      disabled={!response.trim() || isSubmitting}
                    >
                      {isSubmitting ? (
                        'Submitting...'
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Response
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Suggestions Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    <span>AI Response Suggestions</span>
                  </CardTitle>
                  <CardDescription>
                    AI-generated responses based on ticket content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiSuggestions.map((suggestion) => (
                    <div 
                      key={suggestion.id}
                      className={`p-4 border rounded-lg space-y-3 ${
                        selectedSuggestion === suggestion.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{suggestion.title}</h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {suggestion.category}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${
                                suggestion.confidence >= 90 ? 'bg-green-500' :
                                suggestion.confidence >= 75 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`} />
                              <span className="text-xs text-gray-600">
                                {suggestion.confidence}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 italic">
                        {suggestion.reasoning}
                      </p>
                      
                      <div className="bg-gray-50 p-3 rounded text-xs max-h-32 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-mono">
                          {suggestion.content.substring(0, 200)}...
                        </pre>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUseSuggestion(suggestion)}
                          className="flex-1"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Use This
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => copyToClipboard(suggestion.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-500">Ticket not found</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailModal;