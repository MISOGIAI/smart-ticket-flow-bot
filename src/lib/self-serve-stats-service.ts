import { supabase } from '@/integrations/supabase/client';

export interface SelfServeStats {
  total_queries: number;
  successful_queries: number;
  failed_queries: number;
  positive_feedback: number;
  negative_feedback: number;
  ticket_creation_rate: number;
  most_common_queries: { query: string; count: number }[];
  average_confidence: number;
}

export class SelfServeStatsService {
  /**
   * Track a new query to the self-serve bot
   */
  async trackQuery(data: {
    query: string;
    was_successful: boolean;
    confidence_score?: number;
    user_id?: string;
  }): Promise<{ success: boolean; error: Error | null }> {
    try {
      // In a real implementation, this would store the query in the database
      console.log('Tracked query:', data);
      
      // Store in localStorage for demo purposes
      const queries = this.getStoredQueries();
      queries.push({
        query: data.query,
        timestamp: new Date().toISOString(),
        was_successful: data.was_successful,
        confidence_score: data.confidence_score || 0
      });
      
      localStorage.setItem('self_serve_queries', JSON.stringify(queries));
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error tracking query:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Track feedback for a query
   */
  async trackFeedback(data: {
    query: string;
    was_helpful: boolean;
    article_id?: string;
    user_id?: string;
  }): Promise<{ success: boolean; error: Error | null }> {
    try {
      // In a real implementation, this would store the feedback in the database
      console.log('Tracked feedback:', data);
      
      // Store in localStorage for demo purposes
      const feedback = this.getStoredFeedback();
      feedback.push({
        query: data.query,
        timestamp: new Date().toISOString(),
        was_helpful: data.was_helpful,
        article_id: data.article_id
      });
      
      localStorage.setItem('self_serve_feedback', JSON.stringify(feedback));
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error tracking feedback:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Track when a user creates a ticket after using the self-serve bot
   */
  async trackTicketCreation(data: {
    query: string;
    user_id?: string;
  }): Promise<{ success: boolean; error: Error | null }> {
    try {
      // In a real implementation, this would store the ticket creation event in the database
      console.log('Tracked ticket creation:', data);
      
      // Store in localStorage for demo purposes
      const tickets = this.getStoredTicketCreations();
      tickets.push({
        query: data.query,
        timestamp: new Date().toISOString()
      });
      
      localStorage.setItem('self_serve_ticket_creations', JSON.stringify(tickets));
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error tracking ticket creation:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Get statistics about self-serve bot usage
   */
  async getStats(): Promise<{ stats: SelfServeStats; error: Error | null }> {
    try {
      // In a real implementation, this would query the database for stats
      
      // For demo purposes, calculate stats from localStorage
      const queries = this.getStoredQueries();
      const feedback = this.getStoredFeedback();
      const tickets = this.getStoredTicketCreations();
      
      const total_queries = queries.length;
      const successful_queries = queries.filter(q => q.was_successful).length;
      const failed_queries = total_queries - successful_queries;
      
      const positive_feedback = feedback.filter(f => f.was_helpful).length;
      const negative_feedback = feedback.length - positive_feedback;
      
      const ticket_creation_rate = total_queries > 0 
        ? (tickets.length / total_queries) * 100 
        : 0;
      
      // Calculate most common queries
      const queryCounts: Record<string, number> = {};
      queries.forEach(q => {
        queryCounts[q.query] = (queryCounts[q.query] || 0) + 1;
      });
      
      const most_common_queries = Object.entries(queryCounts)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Calculate average confidence
      const confidenceScores = queries.map(q => q.confidence_score).filter(Boolean) as number[];
      const average_confidence = confidenceScores.length > 0
        ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length
        : 0;
      
      const stats: SelfServeStats = {
        total_queries,
        successful_queries,
        failed_queries,
        positive_feedback,
        negative_feedback,
        ticket_creation_rate,
        most_common_queries,
        average_confidence
      };
      
      return { stats, error: null };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { 
        stats: {
          total_queries: 0,
          successful_queries: 0,
          failed_queries: 0,
          positive_feedback: 0,
          negative_feedback: 0,
          ticket_creation_rate: 0,
          most_common_queries: [],
          average_confidence: 0
        }, 
        error: error as Error 
      };
    }
  }

  // Helper methods to get data from localStorage
  private getStoredQueries(): Array<{
    query: string;
    timestamp: string;
    was_successful: boolean;
    confidence_score: number;
  }> {
    try {
      const stored = localStorage.getItem('self_serve_queries');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  private getStoredFeedback(): Array<{
    query: string;
    timestamp: string;
    was_helpful: boolean;
    article_id?: string;
  }> {
    try {
      const stored = localStorage.getItem('self_serve_feedback');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  private getStoredTicketCreations(): Array<{
    query: string;
    timestamp: string;
  }> {
    try {
      const stored = localStorage.getItem('self_serve_ticket_creations');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }
} 