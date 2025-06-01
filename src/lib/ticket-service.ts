import { supabase } from '@/integrations/supabase/client';

export interface TicketWithRelations {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  ticket_number: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  category_id: string;
  category_name: string;
  department_id: string;
  requester_id: string;
  assigned_to: string | null;
  requester: {
    name: string;
    department_id: string | null;
    job_title: string | null;
  };
  assigned_agent: {
    name: string;
    department_id: string | null;
    expertise_areas: string[] | null;
  } | null;
  category: {
    name: string;
  };
  department: {
    name: string;
  };
}

export class TicketService {
  /**
   * Fetches all tickets with their related data
   * @returns Promise with array of tickets and their relations
   */
  async getAllTicketsWithRelations(): Promise<TicketWithRelations[]> {
    try {
      console.log('Fetching all tickets with relations for AI training...');
      
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
          resolved_at,
          category_id,
          category_name,
          department_id,
          requester_id,
          assigned_to,
          requester:users!tickets_requester_id_fkey(
            name,
            department_id,
            job_title
          ),
          assigned_agent:users!tickets_assigned_to_fkey(
            name,
            department_id,
            expertise_areas
          ),
          category:categories(
            name
          ),
          department:departments(
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        throw new Error(`Failed to fetch tickets: ${error.message}`);
      }

      console.log(`Successfully fetched ${data?.length || 0} tickets for AI training`);
      return data || [];
    } catch (error) {
      console.error('Error in getAllTicketsWithRelations:', error);
      throw error;
    }
  }
}

export const ticketService = new TicketService(); 