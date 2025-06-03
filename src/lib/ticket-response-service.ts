import { supabase } from '@/integrations/supabase/client';

export interface TicketResponse {
  id: string;
  ticket_id: string;
  response_text: string;
  internal_notes: string | null;
  status_before: string;
  status_after: string;
  created_at: string;
  created_by: string;
  is_ai_generated: boolean;
  responder?: {
    name: string;
    role: string;
  };
}

export class TicketResponseService {
  /**
   * Create a new response for a ticket
   */
  async createResponse(data: {
    ticket_id: string;
    response_text: string;
    internal_notes?: string | null;
    status_before: string;
    status_after: string;
    created_by: string;
    is_ai_generated?: boolean;
  }): Promise<{ data: TicketResponse | null; error: Error | null }> {
    try {
      const { data: responseData, error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: data.ticket_id,
          response_text: data.response_text,
          internal_notes: data.internal_notes || null,
          status_before: data.status_before,
          status_after: data.status_after,
          created_by: data.created_by,
          is_ai_generated: data.is_ai_generated || false
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error creating ticket response:', error);
        return { data: null, error };
      }

      return { data: responseData as TicketResponse, error: null };
    } catch (error) {
      console.error('Error creating ticket response:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get all responses for a ticket
   */
  async getResponsesByTicketId(ticketId: string): Promise<{ data: TicketResponse[]; error: Error | null }> {
    try {
      const { data: responses, error } = await supabase
        .from('ticket_responses')
        .select(`
          *,
          responder:users!ticket_responses_created_by_fkey(
            name,
            role
          )
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching ticket responses:', error);
        return { data: [], error };
      }

      return { data: responses as TicketResponse[], error: null };
    } catch (error) {
      console.error('Error fetching ticket responses:', error);
      return { data: [], error: error as Error };
    }
  }
}

export const ticketResponseService = new TicketResponseService(); 