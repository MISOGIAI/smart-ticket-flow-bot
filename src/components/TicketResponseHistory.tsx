import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  Archive, 
  User,
  Calendar,
  Bot
} from 'lucide-react';
import { TicketResponse } from '@/lib/ticket-response-service';

interface TicketResponseHistoryProps {
  responses: TicketResponse[];
  isLoading: boolean;
}

export const TicketResponseHistory: React.FC<TicketResponseHistoryProps> = ({ 
  responses, 
  isLoading 
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status icon based on status
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading responses...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (responses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No responses yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {responses.map((response, index) => (
          <div key={response.id} className="space-y-3">
            {index > 0 && <Separator />}
            
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {response.is_ai_generated ? (
                  <div className="bg-purple-100 p-1 rounded-full">
                    <Bot className="h-4 w-4 text-purple-600" />
                  </div>
                ) : (
                  <div className="bg-blue-100 p-1 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                <div>
                  <div className="font-medium">
                    {response.responder?.name || 'Support Agent'}
                    {response.is_ai_generated && (
                      <Badge variant="outline" className="ml-2 text-xs">AI Assisted</Badge>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(response.created_at)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <div className="flex items-center">
                  {getStatusIcon(response.status_before)}
                  <span className="ml-1 capitalize">{response.status_before.replace('_', ' ')}</span>
                </div>
                <span>→</span>
                <div className="flex items-center">
                  {getStatusIcon(response.status_after)}
                  <span className="ml-1 capitalize">{response.status_after.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
              {response.response_text}
            </div>
            
            {response.internal_notes && (
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <div className="text-xs font-medium text-yellow-800 mb-1">Internal Notes</div>
                <div className="text-sm text-gray-700">{response.internal_notes}</div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TicketResponseHistory; 